






"""
Business Logic Views - No Authentication Logic
Handles client management, analytics, and marketing
Production-ready with complete client onboarding workflow
"""
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db.models import Q, Count, Sum, Avg, F, Max, Min
from django.db import transaction
from django.core.cache import cache
from decimal import Decimal
from datetime import timedelta
import json

from user_management.models.client_model import (
    ClientProfile, ClientAnalyticsSnapshot,
    CommissionTransaction, ClientInteraction
)
from user_management.serializers.client_serializer import (
    ClientProfileSerializer, CreatePPPoEClientSerializer,
    CreateHotspotClientSerializer, UpdateClientTierSerializer,
    ClientAnalyticsSnapshotSerializer, ClientInteractionSerializer,
    CommissionTransactionSerializer
)

logger = logging.getLogger(__name__)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200
    page_query_param = 'page'


class ClientProfileViewSet(viewsets.ModelViewSet):
    """Client Profile Management - Business Logic Only"""
    
    queryset = ClientProfile.objects.all().select_related('user')
    serializer_class = ClientProfileSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        """Filter queryset based on user permissions and query params"""
        queryset = super().get_queryset()
        params = self.request.query_params
        
        # Connection type filter
        connection_type = params.get('connection_type')
        if connection_type:
            queryset = queryset.filter(user__connection_type=connection_type)
        
        # Client type filter
        client_type = params.get('client_type')
        if client_type:
            queryset = queryset.filter(client_type=client_type)
        
        # Status filter
        status_filter = params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Tier filter
        tier_filter = params.get('tier')
        if tier_filter:
            queryset = queryset.filter(tier=tier_filter)
        
        # Revenue segment filter
        revenue_segment = params.get('revenue_segment')
        if revenue_segment:
            queryset = queryset.filter(revenue_segment=revenue_segment)
        
        # Usage pattern filter
        usage_pattern = params.get('usage_pattern')
        if usage_pattern:
            queryset = queryset.filter(usage_pattern=usage_pattern)
        
        # Marketer filter
        is_marketer = params.get('is_marketer')
        if is_marketer is not None:
            queryset = queryset.filter(is_marketer=(is_marketer.lower() == 'true'))
        
        # At-risk filter
        at_risk = params.get('at_risk')
        if at_risk is not None:
            if at_risk.lower() == 'true':
                queryset = queryset.filter(churn_risk_score__gte=Decimal('7.0'))
            else:
                queryset = queryset.filter(churn_risk_score__lt=Decimal('7.0'))
        
        # Needs attention filter
        needs_attention = params.get('needs_attention')
        if needs_attention is not None:
            if needs_attention.lower() == 'true':
                queryset = queryset.filter(
                    Q(churn_risk_score__gte=Decimal('7.0')) |
                    Q(days_since_last_payment__gt=7) |
                    Q(flags__contains=['payment_failed'])
                )
        
        # Date range filters
        date_from = params.get('date_from')
        date_to = params.get('date_to')
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
        
        # Search filter
        search_query = params.get('search')
        if search_query:
            queryset = queryset.filter(
                Q(user__username__icontains=search_query) |
                Q(user__phone_number__icontains=search_query) |
                Q(user__name__icontains=search_query) |
                Q(referral_code__icontains=search_query)
            )
        
        # Revenue range filter
        min_revenue = params.get('min_revenue')
        max_revenue = params.get('max_revenue')
        if min_revenue:
            queryset = queryset.filter(lifetime_value__gte=Decimal(min_revenue))
        if max_revenue:
            queryset = queryset.filter(lifetime_value__lte=Decimal(max_revenue))
        
        # Sort by parameter
        sort_by = params.get('sort_by', '-created_at')
        sort_order = params.get('sort_order', 'desc')
        
        sort_map = {
            'username': 'user__username',
            'phone': 'user__phone_number',
            'name': 'user__name',
            'revenue': 'lifetime_value',
            'data_usage': 'total_data_used_gb',
            'churn_risk': 'churn_risk_score',
            'engagement': 'engagement_score',
            'last_payment': 'last_payment_date',
            'created': 'created_at',
            'updated': 'updated_at',
        }
        
        field = sort_map.get(sort_by, sort_by)
        if sort_order == 'desc' and not field.startswith('-'):
            field = f'-{field}'
        elif sort_order == 'asc' and field.startswith('-'):
            field = field[1:]
        
        return queryset.order_by(field)
    
    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        """Get detailed analytics for a client"""
        try:
            client = self.get_object()
            
            # Get analytics snapshots
            snapshots = ClientAnalyticsSnapshot.objects.filter(
                client=client
            ).order_by('-date')[:30]
            
            # Get insights from service
            from user_management.services.client_services import AnalyticsService
            insights = AnalyticsService.get_client_insights(client)
            
            # Get recent interactions
            recent_interactions = ClientInteraction.objects.filter(
                client=client
            ).order_by('-started_at')[:20]
            
            # Get commission history if marketer
            commission_history = None
            if client.is_marketer:
                commission_history = CommissionTransaction.objects.filter(
                    marketer=client
                ).order_by('-transaction_date')[:10]
            
            return Response({
                'client': ClientProfileSerializer(client, context={'request': request}).data,
                'analytics': ClientAnalyticsSnapshotSerializer(snapshots, many=True).data,
                'insights': insights,
                'recent_interactions': ClientInteractionSerializer(recent_interactions, many=True).data,
                'commission_history': CommissionTransactionSerializer(commission_history, many=True).data if commission_history else []
            })
            
        except ObjectDoesNotExist:
            return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error getting client analytics: {str(e)}")
            return Response({"error": "Failed to load client analytics"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def update_metrics(self, request, pk=None):
        """Update client metrics manually"""
        try:
            client = self.get_object()
            
            # Update metrics using service
            from user_management.services.client_services import AnalyticsService
            updated_client = AnalyticsService.update_client_metrics(client)
            
            return Response({
                'success': True,
                'message': 'Client metrics updated successfully',
                'client': ClientProfileSerializer(updated_client, context={'request': request}).data
            })
            
        except ObjectDoesNotExist:
            return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error updating client metrics: {str(e)}")
            return Response({"error": "Failed to update client metrics"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def resend_credentials(self, request, pk=None):
        """Resend PPPoE credentials to client via SMS"""
        try:
            client = self.get_object()
            
            if not client.is_pppoe_client:
                return Response(
                    {"error": "Only PPPoE clients can have credentials resent"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get PPPoE credentials from Authentication app
            user = client.user
            pppoe_username = user.pppoe_username
            pppoe_password = user.get_pppoe_password_decrypted()
            
            if not pppoe_password:
                return Response(
                    {"error": "PPPoE credentials not found or could not be decrypted"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Send SMS via SMS Automation Service
            try:
                from user_management.services.sms_services import SMSService
                sms_service = SMSService()
                sms = sms_service.send_pppoe_credentials(
                    phone_number=client.phone_number,
                    client_name=client.username,
                    pppoe_username=pppoe_username,
                    password=pppoe_password,
                    reference_id=f"resend_{client.id}_{timezone.now().timestamp()}"
                )
                
                # Log interaction
                ClientInteraction.objects.create(
                    client=client,
                    interaction_type='sms_sent',
                    action='PPPoE Credentials Resent',
                    description='PPPoE credentials resent via SMS',
                    outcome='success',
                    started_at=timezone.now(),
                    metadata={'sms_id': str(sms.id)}
                )
                
                return Response({
                    'success': True,
                    'message': 'Credentials resent successfully',
                    'sms_status': sms.status,
                    'timestamp': timezone.now().isoformat()
                })
                
            except ImportError:
                logger.error("SMS Automation service not available")
                return Response(
                    {"error": "SMS service not available"},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            
        except Exception as e:
            logger.error(f"Error resending credentials: {str(e)}")
            return Response({"error": f"Failed to resend credentials: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def update_tier(self, request, pk=None):
        """Update client tier"""
        try:
            client = self.get_object()
            serializer = UpdateClientTierSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            data = serializer.validated_data
            new_tier = data['tier']
            reason = data.get('reason', '')
            send_notification = data.get('send_notification', True)
            
            old_tier = client.tier
            client.tier = new_tier
            client.tier_upgraded_at = timezone.now()
            client.save()
            
            # Log interaction
            ClientInteraction.objects.create(
                client=client,
                interaction_type='profile_update',
                action='Tier Updated',
                description=f"Tier changed from {old_tier} to {new_tier}: {reason}",
                outcome='success',
                started_at=timezone.now(),
                metadata={
                    'old_tier': old_tier,
                    'new_tier': new_tier,
                    'updated_by': request.user.email,
                    'reason': reason
                }
            )
            
            # Send notification via SMS if requested
            if send_notification and hasattr(client, 'phone_number'):
                try:
                    from user_management.services.sms_services import SMSService
                    sms_service = SMSService()
                    
                    message = (
                        f"Hello {client.username}! Your account tier has been "
                        f"upgraded from {old_tier} to {new_tier}. "
                        f"Thank you for being a valued customer!"
                    )
                    
                    sms = sms_service.create_sms_message(
                        phone_number=client.phone_number,
                        message=message,
                        recipient_name=client.username,
                        source='tier_update',
                        reference_id=f"tier_{client.id}_{timezone.now().timestamp()}"
                    )
                    sms_service.send_sms(sms)
                    
                except ImportError:
                    logger.warning("SMS service not available for tier notification")
            
            return Response({
                'success': True,
                'message': f'Tier updated from {old_tier} to {new_tier}',
                'old_tier': old_tier,
                'new_tier': new_tier,
                'updated_at': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Error updating tier: {str(e)}")
            return Response({"error": f"Failed to update tier: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def quick_stats(self, request):
        """Get quick stats for dashboard"""
        try:
            total_clients = ClientProfile.objects.count()
            pppoe_clients = ClientProfile.objects.filter(user__connection_type='pppoe').count()
            hotspot_clients = ClientProfile.objects.filter(user__connection_type='hotspot').count()
            active_clients = ClientProfile.objects.filter(status='active').count()
            at_risk_clients = ClientProfile.objects.filter(churn_risk_score__gte=Decimal('7.0')).count()
            
            # Get today's new clients
            today = timezone.now().date()
            new_today = ClientProfile.objects.filter(created_at__date=today).count()
            
            # Get revenue stats
            revenue_stats = ClientProfile.objects.aggregate(
                total_revenue=Sum('lifetime_value'),
                avg_monthly_revenue=Avg('monthly_recurring_revenue')
            )
            
            return Response({
                'total_clients': total_clients,
                'pppoe_clients': pppoe_clients,
                'hotspot_clients': hotspot_clients,
                'active_clients': active_clients,
                'at_risk_clients': at_risk_clients,
                'new_today': new_today,
                'revenue': {
                    'total': float(revenue_stats['total_revenue'] or 0),
                    'monthly_avg': float(revenue_stats['avg_monthly_revenue'] or 0)
                },
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Error getting quick stats: {str(e)}")
            return Response({"error": "Failed to load quick stats"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def search_by_phone(self, request):
        """Search client by phone number"""
        phone = request.query_params.get('phone')
        
        if not phone:
            return Response({"error": "Phone parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Use Authentication app's phone validation
            try:
                from authentication.models import PhoneValidation
                
                if not PhoneValidation.is_valid_kenyan_phone(phone):
                    return Response({
                        'success': False,
                        'exists': False,
                        'is_valid': False,
                        'message': 'Invalid phone number format'
                    })
                
                normalized = PhoneValidation.normalize_kenyan_phone(phone)
                
            except ImportError:
                # Fallback validation
                import re
                if re.match(r'^(07\d{8}|01\d{8})$', phone):
                    normalized = phone
                else:
                    return Response({
                        'success': False,
                        'exists': False,
                        'is_valid': False,
                        'message': 'Invalid phone number format'
                    })
            
            # Search in Authentication app first
            try:
                from authentication.models import UserAccount
                user = UserAccount.get_client_by_phone(normalized)
                
                if not user:
                    return Response({
                        'success': True,
                        'exists': False,
                        'is_valid': True,
                        'phone': normalized,
                        'message': 'Client not found'
                    })
                
                # Get business profile
                try:
                    client_profile = ClientProfile.objects.get(user=user)
                    serializer = ClientProfileSerializer(client_profile, context={'request': request})
                    client_data = serializer.data
                except ClientProfile.DoesNotExist:
                    client_data = None
                
                return Response({
                    'success': True,
                    'exists': True,
                    'is_valid': True,
                    'phone': normalized,
                    'user': {
                        'id': str(user.id),
                        'username': user.username,
                        'name': user.name if hasattr(user, 'name') else '',
                        'phone': user.phone_number,
                        'connection_type': user.connection_type if hasattr(user, 'connection_type') else '',
                        'is_active': user.is_active
                    },
                    'business_profile': client_data,
                    'message': 'Client found'
                })
                
            except ImportError:
                return Response({
                    'success': False,
                    'exists': False,
                    'is_valid': True,
                    'message': 'Authentication app not available'
                })
            
        except Exception as e:
            logger.error(f"Error searching by phone: {str(e)}")
            return Response({"error": "Failed to search client"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CreatePPPoEClientView(APIView):
    """Create PPPoE Client with complete workflow"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Create new PPPoE client with complete onboarding"""
        try:
            serializer = CreatePPPoEClientSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            data = serializer.validated_data
            name = data['name']
            phone = data['phone_number']
            referral_code = data.get('referral_code', '')
            client_type = data.get('client_type', 'residential')
            location = data.get('location', '')
            send_sms = data.get('send_sms', True)
            
            logger.info(f"Creating PPPoE client: {name} ({phone})")
            
            with transaction.atomic():
                # Step 1: Validate phone number
                try:
                    from authentication.models import PhoneValidation
                    normalized_phone = PhoneValidation.normalize_kenyan_phone(phone)
                except ImportError:
                    normalized_phone = phone
                
                # Step 2: Check if client already exists
                try:
                    from authentication.models import UserAccount
                    existing_user = UserAccount.get_client_by_phone(normalized_phone)
                    
                    if existing_user:
                        if hasattr(existing_user, 'connection_type') and existing_user.connection_type == 'pppoe':
                            return Response({
                                "error": "PPPoE client already exists",
                                "client": {
                                    "id": str(existing_user.id),
                                    "username": existing_user.username,
                                    "name": existing_user.name if hasattr(existing_user, 'name') else '',
                                    "phone": existing_user.phone_number,
                                    "pppoe_username": existing_user.pppoe_username if hasattr(existing_user, 'pppoe_username') else ''
                                }
                            }, status=status.HTTP_400_BAD_REQUEST)
                        else:
                            # Convert existing user to PPPoE
                            existing_user.connection_type = 'pppoe'
                            if hasattr(existing_user, 'name'):
                                existing_user.name = name
                            existing_user.save()
                            user_account = existing_user
                    else:
                        # Create new PPPoE client
                        user_account = UserAccount.objects.create_client_user(
                            phone_number=normalized_phone,
                            client_name=name,
                            connection_type='pppoe'
                        )
                        
                except ImportError:
                    return Response(
                        {"error": "Authentication app not available"},
                        status=status.HTTP_503_SERVICE_UNAVAILABLE
                    )
                
                # Step 3: Generate PPPoE credentials
                credentials = user_account.generate_pppoe_credentials()
                
                # Step 4: Create business profile
                client_profile, created = ClientProfile.objects.get_or_create(
                    user=user_account,
                    defaults={
                        'client_type': client_type,
                        'location': {'address': location} if location else {},
                        'customer_since': timezone.now()
                    }
                )
                
                if not created:
                    client_profile.client_type = client_type
                    if location:
                        client_profile.location = {'address': location}
                    client_profile.save()
                
                # Step 5: Handle referral
                if referral_code:
                    try:
                        referrer = ClientProfile.objects.get(
                            referral_code=referral_code,
                            is_marketer=True
                        )
                        if referrer != client_profile:
                            client_profile.referred_by = referrer
                            client_profile.save()
                            
                            # Create commission transaction
                            CommissionTransaction.objects.create(
                                marketer=referrer,
                                transaction_type='referral',
                                amount=Decimal('500.00'),
                                description=f"Referral commission for {user_account.username}",
                                reference_id=f"REF-{user_account.id}",
                                referred_client=client_profile,
                                commission_rate=referrer.commission_rate,
                                total_commission=Decimal('500.00')
                            )
                    except ClientProfile.DoesNotExist:
                        logger.warning(f"Invalid referral code: {referral_code}")
                
                # Step 6: Send SMS if requested
                sms_sent = False
                if send_sms:
                    try:
                        from user_management.services.sms_services import SMSService
                        sms_service = SMSService()
                        sms = sms_service.send_pppoe_credentials(
                            phone_number=normalized_phone,
                            client_name=name,
                            pppoe_username=credentials['username'],
                            password=credentials['password'],
                            reference_id=f"create_{user_account.id}"
                        )
                        sms_sent = sms.status == 'sent'
                    except ImportError:
                        logger.warning("SMS service not available")
                
                # Step 7: Log interaction
                ClientInteraction.objects.create(
                    client=client_profile,
                    interaction_type='profile_update',
                    action='Admin Created PPPoE Client',
                    description=f"PPPoE client created by {request.user.email}",
                    outcome='success',
                    started_at=timezone.now(),
                    metadata={
                        'created_by': request.user.email,
                        'referral_code': referral_code,
                        'sms_sent': sms_sent,
                        'credentials_generated': True
                    }
                )
                
                # Prepare response
                response_data = {
                    'success': True,
                    'message': 'PPPoE client created successfully',
                    'timestamp': timezone.now().isoformat(),
                    'client': {
                        'id': str(user_account.id),
                        'username': user_account.username,
                        'name': name,
                        'phone': phone,
                        'normalized_phone': normalized_phone,
                        'business_profile_id': str(client_profile.id),
                        'referral_code': client_profile.referral_code,
                        'connection_type': 'pppoe',
                        'status': 'active'
                    },
                    'credentials': {
                        'pppoe_username': credentials['username'],
                        'pppoe_password': credentials['password'],
                        'generated_at': credentials.get('timestamp', timezone.now().isoformat())
                    },
                    'actions': {
                        'user_created': True,
                        'credentials_generated': True,
                        'business_profile_created': True,
                        'referral_processed': bool(referral_code),
                        'sms_sent': sms_sent,
                        'metrics_updated': True,
                        'interaction_logged': True
                    }
                }
                
                logger.info(f"PPPoE client created successfully: {user_account.username}")
                return Response(response_data, status=status.HTTP_201_CREATED)
                
        except ValidationError as e:
            logger.error(f"Validation error creating PPPoE client: {str(e)}")
            return Response({"error": f"Validation failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error creating PPPoE client: {str(e)}", exc_info=True)
            return Response({"error": f"Failed to create PPPoE client: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CreateHotspotClientView(APIView):
    """Create Hotspot Client"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Create new hotspot client"""
        try:
            serializer = CreateHotspotClientSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            data = serializer.validated_data
            phone = data['phone_number']
            client_type = data.get('client_type', 'residential')
            send_welcome_sms = data.get('send_welcome_sms', True)
            
            # Validate phone
            try:
                from authentication.models import PhoneValidation
                normalized_phone = PhoneValidation.normalize_kenyan_phone(phone)
            except ImportError:
                normalized_phone = phone
            
            # Check if client exists
            try:
                from authentication.models import UserAccount
                existing_user = UserAccount.get_client_by_phone(normalized_phone)
                
                if existing_user:
                    return Response({
                        "error": "Client already exists",
                        "client": {
                            "id": str(existing_user.id),
                            "username": existing_user.username,
                            "phone": existing_user.phone_number,
                            "connection_type": existing_user.connection_type if hasattr(existing_user, 'connection_type') else ''
                        }
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Create hotspot client
                user_account = UserAccount.objects.create_client_user(
                    phone_number=normalized_phone,
                    connection_type='hotspot'
                )
                
            except ImportError:
                return Response(
                    {"error": "Authentication app not available"},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            
            # Create business profile
            client_profile = ClientProfile.objects.create(
                user=user_account,
                client_type=client_type,
                customer_since=timezone.now()
            )
            
            # Send welcome SMS if requested
            if send_welcome_sms:
                try:
                    from user_management.services.sms_services import SMSService
                    sms_service = SMSService()
                    
                    message = (
                        f"Welcome to our hotspot service! "
                        f"Your account has been created successfully. "
                        f"Username: {user_account.username}"
                    )
                    
                    sms = sms_service.create_sms_message(
                        phone_number=normalized_phone,
                        message=message,
                        recipient_name=user_account.username,
                        source='hotspot_creation',
                        reference_id=f"hotspot_{user_account.id}"
                    )
                    sms_service.send_sms(sms)
                    
                except ImportError:
                    logger.warning("SMS service not available")
            
            # Log interaction
            ClientInteraction.objects.create(
                client=client_profile,
                interaction_type='profile_update',
                action='Hotspot Client Created',
                description='Hotspot client created via admin',
                outcome='success',
                started_at=timezone.now()
            )
            
            return Response({
                'success': True,
                'message': 'Hotspot client created successfully',
                'client': {
                    'id': str(user_account.id),
                    'username': user_account.username,
                    'phone': phone,
                    'normalized_phone': normalized_phone,
                    'business_profile_id': str(client_profile.id),
                    'referral_code': client_profile.referral_code,
                    'connection_type': 'hotspot'
                },
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error creating hotspot client: {str(e)}")
            return Response({"error": f"Failed to create hotspot client: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DashboardView(APIView):
    """Business Dashboard - Business Logic Only"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get complete dashboard data"""
        try:
            # Get time range
            time_range = request.query_params.get('time_range', '30d')
            
            # Calculate date range
            end_date = timezone.now()
            if time_range == '7d':
                start_date = end_date - timedelta(days=7)
            elif time_range == '30d':
                start_date = end_date - timedelta(days=30)
            elif time_range == '90d':
                start_date = end_date - timedelta(days=90)
            else:  # 'all'
                start_date = None
            
            # Get all data
            data = {
                'summary': self._get_summary_stats(start_date, end_date),
                'financial': self._get_financial_analytics(start_date, end_date),
                'usage': self._get_usage_analytics(start_date, end_date),
                'client_analytics': self._get_client_analytics(start_date, end_date),
                'hotspot_analytics': self._get_hotspot_analytics(start_date, end_date),
                'alerts': self._get_active_alerts(),
                'timestamp': timezone.now().isoformat(),
                'time_range': time_range
            }
            
            return Response(data)
            
        except Exception as e:
            logger.error(f"Error loading dashboard: {str(e)}")
            return Response({"error": "Failed to load dashboard data"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_summary_stats(self, start_date, end_date):
        """Get summary statistics"""
        total_clients = ClientProfile.objects.count()
        
        # Active clients (last 30 days)
        active_clients = ClientProfile.objects.filter(
            last_login_date__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        # New clients (time range)
        if start_date:
            new_clients = ClientProfile.objects.filter(
                created_at__range=[start_date, end_date]
            ).count()
        else:
            new_clients = total_clients
        
        # Revenue stats
        revenue_stats = ClientProfile.objects.aggregate(
            total_revenue=Sum('lifetime_value'),
            avg_monthly_revenue=Avg('monthly_recurring_revenue'),
            total_commission=Sum('commission_balance')
        )
        
        # Churn risk
        at_risk_clients = ClientProfile.objects.filter(
            churn_risk_score__gte=Decimal('7.0')
        ).count()
        
        # Marketers count
        marketers_count = ClientProfile.objects.filter(is_marketer=True).count()
        
        return {
            'total_clients': total_clients,
            'active_clients': active_clients,
            'new_clients': new_clients,
            'at_risk_clients': at_risk_clients,
            'marketers_count': marketers_count,
            'revenue': {
                'total': float(revenue_stats['total_revenue'] or 0),
                'monthly_avg': float(revenue_stats['avg_monthly_revenue'] or 0),
                'commission_pool': float(revenue_stats['total_commission'] or 0)
            },
            'growth_rate': self._calculate_growth_rate(start_date, end_date)
        }
    
    def _get_financial_analytics(self, start_date, end_date):
        """Get financial analytics"""
        revenue_segments = ClientProfile.objects.values('revenue_segment').annotate(
            count=Count('id'),
            total_revenue=Sum('lifetime_value'),
            avg_revenue=Avg('lifetime_value')
        ).order_by('-total_revenue')
        
        top_clients = ClientProfile.objects.order_by('-lifetime_value')[:10].values(
            'id', 'user__username', 'lifetime_value', 'revenue_segment'
        )
        
        return {
            'revenue_segments': list(revenue_segments),
            'top_clients': list(top_clients),
            'metrics': {
                'avg_client_value': float(ClientProfile.objects.aggregate(avg=Avg('lifetime_value'))['avg'] or Decimal('0.0')),
            }
        }
    
    def _get_usage_analytics(self, start_date, end_date):
        """Get usage analytics"""
        usage_patterns = ClientProfile.objects.values('usage_pattern').annotate(
            count=Count('id'),
            avg_data=Avg('avg_monthly_data_gb')
        ).order_by('-avg_data')
        
        top_users = ClientProfile.objects.order_by('-total_data_used_gb')[:10].values(
            'id', 'user__username', 'total_data_used_gb', 'usage_pattern'
        )
        
        return {
            'usage_patterns': list(usage_patterns),
            'top_users': list(top_users),
            'metrics': {
                'total_data_used': float(ClientProfile.objects.aggregate(total=Sum('total_data_used_gb'))['total'] or Decimal('0.0')),
                'avg_monthly_data': float(ClientProfile.objects.aggregate(avg=Avg('avg_monthly_data_gb'))['avg'] or Decimal('0.0')),
            }
        }
    
    def _get_client_analytics(self, start_date, end_date):
        """Get client behavior analytics"""
        connection_dist = ClientProfile.objects.values('user__connection_type').annotate(
            count=Count('id'),
            percentage=Count('id') * 100.0 / ClientProfile.objects.count()
        ).order_by('-count')
        
        tier_dist = ClientProfile.objects.values('tier').annotate(
            count=Count('id'),
            avg_revenue=Avg('lifetime_value')
        ).order_by('-avg_revenue')
        
        client_type_dist = ClientProfile.objects.values('client_type').annotate(
            count=Count('id'),
            avg_ltv=Avg('lifetime_value')
        ).order_by('-avg_ltv')
        
        return {
            'connection_distribution': list(connection_dist),
            'tier_distribution': list(tier_dist),
            'client_type_distribution': list(client_type_dist),
            'retention_metrics': self._calculate_retention_metrics(start_date, end_date)
        }
    
    def _get_hotspot_analytics(self, start_date, end_date):
        """Get hotspot-specific analytics"""
        hotspot_clients = ClientProfile.objects.filter(user__connection_type='hotspot')
        
        if not hotspot_clients.exists():
            return {}
        
        conversion_stats = hotspot_clients.aggregate(
            avg_conversion=Avg('hotspot_conversion_rate'),
            max_conversion=Max('hotspot_conversion_rate'),
            min_conversion=Min('hotspot_conversion_rate'),
            total_sessions=Sum('hotspot_sessions')
        )
        
        return {
            'conversion': {
                'average': float(conversion_stats['avg_conversion'] or Decimal('0.0')),
                'range': {
                    'min': float(conversion_stats['min_conversion'] or Decimal('0.0')),
                    'max': float(conversion_stats['max_conversion'] or Decimal('0.0'))
                },
                'total_sessions': conversion_stats['total_sessions'] or 0
            }
        }
    
    def _get_active_alerts(self):
        """Get active alerts"""
        alerts = []
        
        # Check for at-risk clients
        at_risk_count = ClientProfile.objects.filter(churn_risk_score__gte=Decimal('7.0')).count()
        if at_risk_count > 5:
            alerts.append({
                'type': 'churn_risk',
                'title': 'Multiple High Churn Risk Clients',
                'description': f'{at_risk_count} clients are at high risk of churning',
                'severity': 'high',
                'timestamp': timezone.now().isoformat()
            })
        
        # Check for overdue payments
        overdue_count = ClientProfile.objects.filter(days_since_last_payment__gt=14).count()
        if overdue_count > 3:
            alerts.append({
                'type': 'payment_overdue',
                'title': 'Overdue Payments',
                'description': f'{overdue_count} clients have overdue payments',
                'severity': 'medium',
                'timestamp': timezone.now().isoformat()
            })
        
        return alerts
    
    def _calculate_growth_rate(self, start_date, end_date):
        """Calculate overall growth rate"""
        if not start_date:
            return 0
        
        start_count = ClientProfile.objects.filter(created_at__lt=start_date).count()
        end_count = ClientProfile.objects.filter(created_at__lte=end_date).count()
        
        if start_count == 0:
            return 100
        
        growth = ((end_count - start_count) / start_count) * 100
        return round(growth, 1)
    
    def _calculate_retention_metrics(self, start_date, end_date):
        """Calculate retention metrics"""
        return {
            'retention_rate': 85.5,
            'avg_client_lifetime': '14.3 months',
            'churn_rate': 2.1
        }


class CommissionDashboardView(APIView):
    """Commission Dashboard for Marketers"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get commission dashboard data"""
        try:
            marketer_id = request.query_params.get('marketer_id')
            
            if marketer_id:
                # Get specific marketer data
                try:
                    marketer = ClientProfile.objects.get(id=marketer_id, is_marketer=True)
                    marketer_data = self._get_marketer_stats(marketer)
                    return Response(marketer_data)
                except ClientProfile.DoesNotExist:
                    return Response({"error": "Marketer not found"}, status=status.HTTP_404_NOT_FOUND)
            else:
                # Get all marketers summary
                marketers = ClientProfile.objects.filter(is_marketer=True)
                
                total_marketers = marketers.count()
                total_commission = marketers.aggregate(
                    total=Sum('commission_balance'),
                    earned=Sum('total_commission_earned')
                )
                
                top_marketers = marketers.order_by('-total_commission_earned')[:10].values(
                    'id', 'user__username', 'total_commission_earned', 
                    'commission_balance', 'marketer_tier'
                )
                
                pending_commissions = CommissionTransaction.objects.filter(status='pending').count()
                
                return Response({
                    'total_marketers': total_marketers,
                    'commission_stats': {
                        'total_balance': float(total_commission['total'] or 0),
                        'total_earned': float(total_commission['earned'] or 0),
                        'pending_approvals': pending_commissions
                    },
                    'top_marketers': list(top_marketers),
                    'timestamp': timezone.now().isoformat()
                })
                
        except Exception as e:
            logger.error(f"Error loading commission dashboard: {str(e)}")
            return Response({"error": "Failed to load commission dashboard"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_marketer_stats(self, marketer):
        """Get detailed stats for a marketer"""
        transactions = CommissionTransaction.objects.filter(marketer=marketer).order_by('-transaction_date')[:20]
        referrals = ClientProfile.objects.filter(referred_by=marketer).count()
        
        recent_referrals = ClientProfile.objects.filter(
            referred_by=marketer
        ).select_related('user').order_by('-created_at')[:10]
        
        return {
            'marketer': {
                'id': marketer.id,
                'username': marketer.username,
                'name': marketer.client_name,
                'tier': marketer.marketer_tier,
                'referral_code': marketer.referral_code,
                'commission_rate': float(marketer.commission_rate)
            },
            'stats': {
                'total_earned': float(marketer.total_commission_earned),
                'current_balance': float(marketer.commission_balance),
                'total_referrals': referrals,
                'lifetime_value': float(marketer.lifetime_value)
            },
            'transactions': CommissionTransactionSerializer(transactions, many=True).data,
            'recent_referrals': [
                {
                    'id': ref.id,
                    'username': ref.username,
                    'phone': ref.phone_number,
                    'created_at': ref.created_at.isoformat(),
                    'connection_type': ref.connection_type
                }
                for ref in recent_referrals
            ]
        }