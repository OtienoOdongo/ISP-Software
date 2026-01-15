


# """
# AUTHENTICATION APP - API Views
# Handles only authentication-related endpoints
# Clear separation of concerns - no SMS, no statistics, no health checks
# """

# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import AllowAny, IsAuthenticated
# from rest_framework.response import Response
# from rest_framework import generics, status, viewsets, mixins
# from rest_framework.viewsets import GenericViewSet
# from rest_framework_simplejwt.tokens import RefreshToken
# from django.utils.decorators import method_decorator
# from django.views.decorators.csrf import csrf_exempt
# from django.conf import settings
# from django.core.cache import cache
# from django.utils import timezone
# import time
# import logging

# from authentication.models import UserAccount, PhoneValidation
# from authentication.serializers import (
#     HotspotClientCreateSerializer,
#     PPPoEClientCreateSerializer,
#     UserMeSerializer,
#     UserSerializer,
#     PPPoEAuthSerializer,
#     PhoneValidationSerializer,
#     UUIDValidationSerializer,
#     PPPoECredentialUpdateSerializer,
#     AuthenticatedUserCreateSerializer
# )

# logger = logging.getLogger(__name__)


# # ==================== RATE LIMITING DECORATOR ====================
# def rate_limited(max_calls: int = 100, period: int = 60, scope: str = "default"):
#     """
#     Simple rate limiting decorator for authentication endpoints
#     Prevents brute force attacks
#     """
#     def decorator(view_func):
#         def wrapped_view(request, *args, **kwargs):
#             # Use IP address as identifier for rate limiting
#             ip_address = request.META.get('REMOTE_ADDR', 'unknown')
#             identifier = f"{scope}_{ip_address}"
#             cache_key = f"rate_limit_{identifier}"
            
#             current_time = time.time()
#             rate_data = cache.get(cache_key) or {'count': 0, 'reset_time': current_time + period}
            
#             # Reset if period passed
#             if current_time > rate_data['reset_time']:
#                 rate_data = {'count': 1, 'reset_time': current_time + period}
#             else:
#                 rate_data['count'] += 1
            
#             # Check limit
#             if rate_data['count'] > max_calls:
#                 logger.warning(f"Rate limit exceeded for {identifier}")
#                 return Response(
#                     {'error': 'Rate limit exceeded. Please try again later.'},
#                     status=status.HTTP_429_TOO_MANY_REQUESTS
#                 )
            
#             # Update cache
#             cache.set(cache_key, rate_data, period)
            
#             # Add headers
#             response = view_func(request, *args, **kwargs)
#             response['X-RateLimit-Limit'] = str(max_calls)
#             response['X-RateLimit-Remaining'] = str(max_calls - rate_data['count'])
            
#             return response
        
#         return wrapped_view
#     return decorator


# # ==================== CLIENT CREATION VIEWS ====================
# class HotspotClientCreateView(generics.CreateAPIView):
#     """
#     Create hotspot client (for UserManagement app)
#     Hotspot clients only need phone number, username auto-generated
#     No authentication required for client creation
#     """
#     serializer_class = HotspotClientCreateSerializer
#     permission_classes = [IsAuthenticated]  # Only authenticated users can create clients
    
#     @method_decorator(rate_limited(max_calls=50, period=60, scope="client_create"))
#     def post(self, request, *args, **kwargs):
#         """Create a new hotspot client"""
#         try:
#             serializer = self.get_serializer(data=request.data)
#             serializer.is_valid(raise_exception=True)
            
#             user = serializer.save()
            
#             return Response({
#                 'success': True,
#                 'message': 'Hotspot client created successfully',
#                 'client': {
#                     'id': str(user.id),
#                     'username': user.username,
#                     'phone_number': user.phone_number,
#                     'phone_number_display': user.get_phone_display(),
#                 }
#             }, status=status.HTTP_201_CREATED)
            
#         except Exception as e:
#             logger.error(f"Hotspot client creation error: {e}")
#             return Response({
#                 'error': 'Failed to create hotspot client',
#                 'details': str(e) if settings.DEBUG else None
#             }, status=status.HTTP_400_BAD_REQUEST)


# class PPPoEClientCreateView(generics.CreateAPIView):
#     """
#     Create PPPoE client (for UserManagement app)
#     PPPoE clients need name + phone, credentials auto-generated
#     Credentials returned for SMS sending by UserManagement app
#     """
#     serializer_class = PPPoEClientCreateSerializer
#     permission_classes = [IsAuthenticated]  # Only authenticated users can create PPPoE clients
    
#     @method_decorator(rate_limited(max_calls=30, period=60, scope="pppoe_create"))
#     def post(self, request, *args, **kwargs):
#         """Create a new PPPoE client with auto-generated credentials"""
#         try:
#             serializer = self.get_serializer(data=request.data)
#             serializer.is_valid(raise_exception=True)
            
#             user = serializer.save()
            
#             # Get credentials from context (set by serializer)
#             credentials = serializer.context.get('pppoe_credentials', {})
            
#             return Response({
#                 'success': True,
#                 'message': 'PPPoE client created successfully',
#                 'client': {
#                     'id': str(user.id),
#                     'username': user.username,
#                     'name': user.name,
#                     'phone_number': user.phone_number,
#                     'phone_number_display': user.get_phone_display(),
#                     'pppoe_username': user.pppoe_username,
#                     'pppoe_password': credentials.get('password'),
#                     'credentials_generated': user.pppoe_credentials_generated,
#                 },
#                 'sms_data': credentials  # For UserManagement app to send SMS
#             }, status=status.HTTP_201_CREATED)
            
#         except Exception as e:
#             logger.error(f"PPPoE client creation error: {e}")
#             return Response({
#                 'error': 'Failed to create PPPoE client',
#                 'details': str(e) if settings.DEBUG else None
#             }, status=status.HTTP_400_BAD_REQUEST)


# # ==================== AUTHENTICATION VIEWS ====================
# @api_view(['POST'])
# @permission_classes([AllowAny])
# @rate_limited(max_calls=100, period=60, scope="pppoe_auth")
# def pppoe_authenticate(request):
#     """
#     PPPoE Authentication Endpoint
#     Used by routers (Mikrotik, etc.) to authenticate PPPoE connections
#     Returns simple authentication response for routers
#     """
#     start_time = time.time()
    
#     try:
#         serializer = PPPoEAuthSerializer(data=request.data)
        
#         if not serializer.is_valid():
#             logger.warning(f"Invalid PPPoE auth request from {request.META.get('REMOTE_ADDR')}")
#             return Response({
#                 'authenticated': False,
#                 'message': 'Invalid credentials'
#             }, status=status.HTTP_401_UNAUTHORIZED)
        
#         user = serializer.context['user']
        
#         # Update PPPoE login status
#         user.last_pppoe_login = timezone.now()
#         user.pppoe_active = True
#         user.save(update_fields=['last_pppoe_login', 'pppoe_active', 'last_updated'])
        
#         logger.info(f"PPPoE authentication successful: {user.pppoe_username}")
        
#         # Return router-friendly response
#         response_data = {
#             'authenticated': True,
#             'message': 'PPPoE authentication successful',
#             'user': {
#                 'username': user.pppoe_username,
#                 'client_id': str(user.id),
#                 'is_active': user.is_active,
#             },
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         }
        
#         return Response(response_data)
        
#     except Exception as e:
#         logger.error(f"PPPoE authentication error: {e}")
#         return Response({
#             'authenticated': False,
#             'error': 'Authentication service temporarily unavailable',
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# # ==================== VALIDATION VIEWS ====================
# @api_view(['POST'])
# @permission_classes([AllowAny])
# @rate_limited(max_calls=200, period=60, scope="phone_validation")
# def validate_phone(request):
#     """
#     Validate phone number format and check existence
#     Used by frontend for phone validation
#     """
#     try:
#         serializer = PhoneValidationSerializer(data=request.data)
        
#         if not serializer.is_valid():
#             return Response({
#                 'success': False,
#                 'error': 'Invalid phone number',
#                 'details': serializer.errors
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         return Response({
#             'success': True,
#             'data': serializer.data
#         })
        
#     except Exception as e:
#         logger.error(f"Phone validation error: {e}")
#         return Response({
#             'success': False,
#             'error': 'Phone validation failed'
#         }, status=status.HTTP_400_BAD_REQUEST)


# @api_view(['POST'])
# @permission_classes([AllowAny])
# @rate_limited(max_calls=200, period=60, scope="uuid_validation")
# def validate_uuid(request):
#     """
#     Validate UUID and check if user exists
#     """
#     try:
#         serializer = UUIDValidationSerializer(data=request.data)
        
#         if not serializer.is_valid():
#             return Response({
#                 'success': False,
#                 'error': 'Invalid UUID',
#                 'details': serializer.errors
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         return Response({
#             'success': True,
#             'data': serializer.data
#         })
        
#     except Exception as e:
#         logger.error(f"UUID validation error: {e}")
#         return Response({
#             'success': False,
#             'error': 'UUID validation failed'
#         }, status=status.HTTP_400_BAD_REQUEST)


# @api_view(['GET'])
# @permission_classes([AllowAny])
# @rate_limited(max_calls=300, period=60, scope="check_phone")
# def check_phone(request):
#     """
#     GET endpoint to check if phone number exists
#     Used by hotspot landing page
#     """
#     phone = request.GET.get('phone')
    
#     if not phone:
#         return Response({
#             'success': False,
#             'error': 'Phone parameter is required'
#         }, status=status.HTTP_400_BAD_REQUEST)
    
#     try:
#         normalized = PhoneValidation.normalize_kenyan_phone(phone)
        
#         if not PhoneValidation.is_valid_kenyan_phone(normalized):
#             return Response({
#                 'success': False,
#                 'exists': False,
#                 'is_valid': False,
#                 'message': 'Invalid phone number format'
#             })
        
#         # Check if client exists
#         user = UserAccount.get_client_by_phone(normalized)
#         exists = user is not None
        
#         response_data = {
#             'success': True,
#             'exists': exists,
#             'is_valid': True,
#             'phone_number': normalized,
#             'phone_number_display': PhoneValidation.get_phone_display(phone),
#             'message': 'Client found' if exists else 'Client not found'
#         }
        
#         if exists:
#             response_data['client'] = {
#                 'id': str(user.id),
#                 'username': user.username,
#                 'connection_type': user.connection_type,
#                 'is_pppoe_client': user.is_pppoe_client,
#                 'is_hotspot_client': user.is_hotspot_client,
#             }
        
#         return Response(response_data)
        
#     except Exception as e:
#         logger.error(f"Phone check error: {e}")
#         return Response({
#             'success': False,
#             'error': 'Failed to check phone number'
#         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# @api_view(['GET'])
# @permission_classes([AllowAny])
# @rate_limited(max_calls=300, period=60, scope="check_uuid")
# def check_uuid(request):
#     """
#     GET endpoint to check if UUID exists
#     """
#     user_uuid = request.GET.get('uuid')
    
#     if not user_uuid:
#         return Response({
#             'success': False,
#             'error': 'UUID parameter is required'
#         }, status=status.HTTP_400_BAD_REQUEST)
    
#     try:
#         import uuid as uuid_lib
#         uuid_obj = uuid_lib.UUID(user_uuid)
        
#         # Check existence
#         exists = UserAccount.objects.filter(id=uuid_obj, is_active=True).exists()
        
#         # Get user data if exists
#         user_data = None
#         if exists:
#             try:
#                 user = UserAccount.objects.get(id=uuid_obj, is_active=True)
#                 user_data = user.to_dict()
#             except UserAccount.DoesNotExist:
#                 pass
        
#         return Response({
#             'success': True,
#             'exists': exists,
#             'is_valid': True,
#             'uuid': str(uuid_obj),
#             'message': 'User found' if exists else 'User not found',
#             'user': user_data
#         })
        
#     except ValueError:
#         return Response({
#             'success': False,
#             'exists': False,
#             'is_valid': False,
#             'message': 'Invalid UUID format'
#         })
#     except Exception as e:
#         logger.error(f"UUID check error: {e}")
#         return Response({
#             'success': False,
#             'error': 'Failed to check UUID'
#         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# @api_view(['GET'])
# @permission_classes([AllowAny])
# @rate_limited(max_calls=300, period=60, scope="check_email")
# def check_email(request):
#     """
#     GET endpoint to check if email exists
#     Used by dashboard for email validation
#     """
#     email = request.GET.get('email')
    
#     if not email:
#         return Response({
#             'success': False,
#             'error': 'Email parameter is required'
#         }, status=status.HTTP_400_BAD_REQUEST)
    
#     try:
#         from authentication.serializers import ValidationAlgorithms
        
#         if not ValidationAlgorithms.is_valid_email(email):
#             return Response({
#                 'success': False,
#                 'exists': False,
#                 'is_valid': False,
#                 'message': 'Invalid email format'
#             })
        
#         # Check existence (authenticated users only)
#         exists = UserAccount.objects.filter(
#             email__iexact=email,
#             user_type__in=['staff', 'admin'],
#             is_active=True
#         ).exists()
        
#         return Response({
#             'success': True,
#             'exists': exists,
#             'is_valid': True,
#             'email': email,
#             'message': 'Email found' if exists else 'Email not found'
#         })
        
#     except Exception as e:
#         logger.error(f"Email check error: {e}")
#         return Response({
#             'success': False,
#             'error': 'Failed to check email'
#         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# # ==================== USER PROFILE VIEWS ====================
# class UserMeViewSet(GenericViewSet, mixins.RetrieveModelMixin, mixins.UpdateModelMixin):
#     """
#     Current user profile endpoints
#     Uses Djoser for authenticated users, custom for client users
#     """
#     serializer_class = UserMeSerializer
#     permission_classes = [IsAuthenticated]
    
#     def get_object(self):
#         """Get current user"""
#         return self.request.user
    
#     @method_decorator(rate_limited(max_calls=100, period=60, scope="user_profile"))
#     def retrieve(self, request, *args, **kwargs):
#         """Get current user profile"""
#         user = self.get_object()
#         serializer = self.get_serializer(user)
#         return Response(serializer.data)


# # ==================== PPPOE CLIENT SELF-SERVICE VIEWS ====================
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# @rate_limited(max_calls=20, period=60, scope="pppoe_update")
# def pppoe_update_credentials(request):
#     """
#     PPPoE client self-service credential update
#     Only accessible to PPPoE clients after login
#     """
#     try:
#         user = request.user
        
#         # Only PPPoE clients can update their credentials
#         if not user.is_pppoe_client:
#             return Response({
#                 'error': 'Only PPPoE clients can update credentials'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         serializer = PPPoECredentialUpdateSerializer(data=request.data)
#         if not serializer.is_valid():
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
#         # Update credentials
#         updates = user.update_pppoe_credentials(
#             username=serializer.validated_data.get('username'),
#             password=serializer.validated_data.get('password')
#         )
        
#         logger.info(f"PPPoE credentials updated by client: {user.username}")
        
#         return Response({
#             'success': True,
#             'message': 'PPPoE credentials updated successfully',
#             'updates': updates['updates']
#         })
        
#     except Exception as e:
#         logger.error(f"PPPoE credential update error: {e}")
#         return Response({
#             'error': str(e)
#         }, status=status.HTTP_400_BAD_REQUEST)


# # ==================== USER TYPE CHECK VIEWS ====================
# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def check_user_type(request):
#     """
#     Check if current user has specific user type
#     Used by frontend for conditional rendering
#     """
#     user_type = request.GET.get('user_type')
    
#     if not user_type:
#         return Response({
#             'error': 'user_type parameter is required'
#         }, status=status.HTTP_400_BAD_REQUEST)
    
#     has_type = request.user.user_type == user_type
    
#     return Response({
#         'has_type': has_type,
#         'user_type': request.user.user_type,
#         'requested_type': user_type
#     })


# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def check_connection_type(request):
#     """
#     Check if current user has specific connection type
#     Used by client landing pages
#     """
#     connection_type = request.GET.get('connection_type')
    
#     if not connection_type:
#         return Response({
#             'error': 'connection_type parameter is required'
#         }, status=status.HTTP_400_BAD_REQUEST)
    
#     # For authenticated users, connection_type is always 'admin'
#     if request.user.is_authenticated_user:
#         has_type = (connection_type == 'admin')
#     else:
#         has_type = request.user.connection_type == connection_type
    
#     return Response({
#         'has_type': has_type,
#         'connection_type': request.user.connection_type,
#         'requested_type': connection_type
#     })


# # ==================== CLIENT LOOKUP VIEWS ====================
# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_client_by_phone(request):
#     """
#     Get client details by phone number
#     Only accessible to authenticated users (for UserManagement app)
#     """
#     phone = request.GET.get('phone')
    
#     if not phone:
#         return Response({
#             'error': 'Phone parameter is required'
#         }, status=status.HTTP_400_BAD_REQUEST)
    
#     try:
#         user = UserAccount.get_client_by_phone(phone)
        
#         if not user:
#             return Response({
#                 'success': False,
#                 'message': 'Client not found'
#             }, status=status.HTTP_404_NOT_FOUND)
        
#         return Response({
#             'success': True,
#             'client': user.to_dict()
#         })
        
#     except Exception as e:
#         logger.error(f"Client lookup error: {e}")
#         return Response({
#             'error': 'Failed to lookup client'
#         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# # ==================== AUTHENTICATED USER CREATION ====================
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def create_authenticated_user(request):
#     """
#     Create new authenticated user (staff/admin)
#     Only accessible to existing authenticated users with proper permissions
#     """
#     try:
#         # Only admins can create new authenticated users
#         if request.user.user_type != 'admin':
#             return Response({
#                 'error': 'Only admin users can create new authenticated users'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         serializer = AuthenticatedUserCreateSerializer(data=request.data)
        
#         if not serializer.is_valid():
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
#         user = serializer.save()
        
#         logger.info(f"Authenticated user created by admin {request.user.email}: {user.email}")
        
#         return Response({
#             'success': True,
#             'message': 'Authenticated user created successfully',
#             'user': {
#                 'id': str(user.id),
#                 'email': user.email,
#                 'name': user.name,
#                 'user_type': user.user_type,
#             }
#         }, status=status.HTTP_201_CREATED)
        
#     except Exception as e:
#         logger.error(f"Authenticated user creation error: {e}")
#         return Response({
#             'error': 'Failed to create authenticated user'
#         }, status=status.HTTP_400_BAD_REQUEST)











"""
AUTHENTICATION APP - API Views
Handles only authentication-related endpoints
Clear separation of concerns:
- Admin dashboard client creation (authenticated)
- Captive portal registration (public)
- PPPoE authentication for routers
- Validation endpoints
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import generics, status, viewsets, mixins
from rest_framework.viewsets import GenericViewSet
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone
import time
import logging

from authentication.models import UserAccount, PhoneValidation
from authentication.serializers import (
    HotspotClientCreateSerializer,
    PPPoEClientCreateSerializer,
    CaptivePortalRegistrationSerializer,
    UserMeSerializer,
    UserSerializer,
    PPPoEAuthSerializer,
    PhoneValidationSerializer,
    UUIDValidationSerializer,
    PPPoECredentialUpdateSerializer,
    AuthenticatedUserCreateSerializer
)

logger = logging.getLogger(__name__)


# ==================== RATE LIMITING DECORATOR ====================
def rate_limited(max_calls: int = 100, period: int = 60, scope: str = "default"):
    """
    Simple rate limiting decorator for authentication endpoints
    Prevents brute force attacks
    """
    def decorator(view_func):
        def wrapped_view(request, *args, **kwargs):
            # Use IP address as identifier for rate limiting
            ip_address = request.META.get('REMOTE_ADDR', 'unknown')
            identifier = f"{scope}_{ip_address}"
            cache_key = f"rate_limit_{identifier}"
            
            current_time = time.time()
            rate_data = cache.get(cache_key) or {'count': 0, 'reset_time': current_time + period}
            
            # Reset if period passed
            if current_time > rate_data['reset_time']:
                rate_data = {'count': 1, 'reset_time': current_time + period}
            else:
                rate_data['count'] += 1
            
            # Check limit
            if rate_data['count'] > max_calls:
                logger.warning(f"Rate limit exceeded for {identifier}")
                return Response(
                    {'error': 'Rate limit exceeded. Please try again later.'},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )
            
            # Update cache
            cache.set(cache_key, rate_data, period)
            
            # Add headers
            response = view_func(request, *args, **kwargs)
            response['X-RateLimit-Limit'] = str(max_calls)
            response['X-RateLimit-Remaining'] = str(max_calls - rate_data['count'])
            
            return response
        
        return wrapped_view
    return decorator


# ==================== CAPTIVE PORTAL VIEWS ====================
@api_view(['POST'])
@permission_classes([AllowAny])
@rate_limited(max_calls=50, period=60, scope="captive_registration")
def captive_portal_register(request):
    """
    Captive portal registration endpoint (PUBLIC)
    Called when user enters phone on hotspot landing page
    """
    try:
        serializer = CaptivePortalRegistrationSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'error': 'Invalid phone number',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get or create user
        user = serializer.save()
        created = serializer.context.get('user_created', False)
        
        response_data = {
            'success': True,
            'message': 'User registered successfully' if created else 'User already exists',
            'user_created': created,
            'client': {
                'id': str(user.id),
                'username': user.username,
                'phone_number': user.phone_number,
                'phone_number_display': user.get_phone_display(),
                'connection_type': user.connection_type,
                'source': user.source,
            }
        }
        
        logger.info(f"Captive portal registration: {user.username}, created={created}")
        
        return Response(response_data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Captive portal registration error: {e}")
        return Response({
            'success': False,
            'error': 'Registration failed. Please try again.'
        }, status=status.HTTP_400_BAD_REQUEST)


# ==================== ADMIN CLIENT CREATION VIEWS ====================
class HotspotClientCreateView(generics.CreateAPIView):
    """
    Create hotspot client via admin dashboard
    Only accessible to authenticated users (admin/staff)
    """
    serializer_class = HotspotClientCreateSerializer
    permission_classes = [IsAuthenticated]
    
    @method_decorator(rate_limited(max_calls=30, period=60, scope="admin_client_create"))
    def post(self, request, *args, **kwargs):
        """Create a new hotspot client via admin dashboard"""
        try:
            # Only admin/staff can create clients via dashboard
            if request.user.user_type not in ['admin', 'staff']:
                return Response({
                    'error': 'Only admin or staff can create clients'
                }, status=status.HTTP_403_FORBIDDEN)
            
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            user = serializer.save()
            
            return Response({
                'success': True,
                'message': 'Hotspot client created successfully',
                'client': {
                    'id': str(user.id),
                    'username': user.username,
                    'phone_number': user.phone_number,
                    'phone_number_display': user.get_phone_display(),
                    'source': user.source,
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Admin hotspot client creation error: {e}")
            return Response({
                'error': 'Failed to create hotspot client',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_400_BAD_REQUEST)


class PPPoEClientCreateView(generics.CreateAPIView):
    """
    Create PPPoE client via admin dashboard
    Only accessible to authenticated users (admin/staff)
    """
    serializer_class = PPPoEClientCreateSerializer
    permission_classes = [IsAuthenticated]
    
    @method_decorator(rate_limited(max_calls=20, period=60, scope="admin_pppoe_create"))
    def post(self, request, *args, **kwargs):
        """Create a new PPPoE client with auto-generated credentials via admin dashboard"""
        try:
            # Only admin/staff can create PPPoE clients via dashboard
            if request.user.user_type not in ['admin', 'staff']:
                return Response({
                    'error': 'Only admin or staff can create PPPoE clients'
                }, status=status.HTTP_403_FORBIDDEN)
            
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            user = serializer.save()
            
            # Get credentials from context (set by serializer)
            credentials = serializer.context.get('pppoe_credentials', {})
            
            return Response({
                'success': True,
                'message': 'PPPoE client created successfully',
                'client': {
                    'id': str(user.id),
                    'username': user.username,
                    'name': user.name,
                    'phone_number': user.phone_number,
                    'phone_number_display': user.get_phone_display(),
                    'pppoe_username': user.pppoe_username,
                    'pppoe_password': credentials.get('password'),
                    'credentials_generated': user.pppoe_credentials_generated,
                    'source': user.source,
                },
                'sms_data': credentials  # For UserManagement app to send SMS
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Admin PPPoE client creation error: {e}")
            return Response({
                'error': 'Failed to create PPPoE client',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_400_BAD_REQUEST)


# ==================== AUTHENTICATION VIEWS ====================
@api_view(['POST'])
@permission_classes([AllowAny])
@rate_limited(max_calls=100, period=60, scope="pppoe_auth")
def pppoe_authenticate(request):
    """
    PPPoE Authentication Endpoint
    Used by routers (Mikrotik, etc.) to authenticate PPPoE connections
    Returns simple authentication response for routers
    """
    start_time = time.time()
    
    try:
        serializer = PPPoEAuthSerializer(data=request.data)
        
        if not serializer.is_valid():
            logger.warning(f"Invalid PPPoE auth request from {request.META.get('REMOTE_ADDR')}")
            return Response({
                'authenticated': False,
                'message': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        user = serializer.context['user']
        
        # Update PPPoE login status
        user.last_pppoe_login = timezone.now()
        user.pppoe_active = True
        user.save(update_fields=['last_pppoe_login', 'pppoe_active', 'last_updated'])
        
        logger.info(f"PPPoE authentication successful: {user.pppoe_username}")
        
        # Return router-friendly response
        response_data = {
            'authenticated': True,
            'message': 'PPPoE authentication successful',
            'user': {
                'username': user.pppoe_username,
                'client_id': str(user.id),
                'is_active': user.is_active,
            },
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        }
        
        return Response(response_data)
        
    except Exception as e:
        logger.error(f"PPPoE authentication error: {e}")
        return Response({
            'authenticated': False,
            'error': 'Authentication service temporarily unavailable',
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== VALIDATION VIEWS ====================
@api_view(['POST'])
@permission_classes([AllowAny])
@rate_limited(max_calls=200, period=60, scope="phone_validation")
def validate_phone(request):
    """
    Validate phone number format and check existence
    Used by frontend for phone validation
    """
    try:
        serializer = PhoneValidationSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'error': 'Invalid phone number',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
        
    except Exception as e:
        logger.error(f"Phone validation error: {e}")
        return Response({
            'success': False,
            'error': 'Phone validation failed'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
@rate_limited(max_calls=200, period=60, scope="uuid_validation")
def validate_uuid(request):
    """
    Validate UUID and check if user exists
    """
    try:
        serializer = UUIDValidationSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'error': 'Invalid UUID',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
        
    except Exception as e:
        logger.error(f"UUID validation error: {e}")
        return Response({
            'success': False,
            'error': 'UUID validation failed'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
@rate_limited(max_calls=300, period=60, scope="check_phone")
def check_phone(request):
    """
    GET endpoint to check if phone number exists
    Used by hotspot landing page and admin dashboard
    """
    phone = request.GET.get('phone')
    
    if not phone:
        return Response({
            'success': False,
            'error': 'Phone parameter is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        normalized = PhoneValidation.normalize_kenyan_phone(phone)
        
        if not PhoneValidation.is_valid_kenyan_phone(normalized):
            return Response({
                'success': False,
                'exists': False,
                'is_valid': False,
                'message': 'Invalid phone number format'
            })
        
        # Check if client exists (active or inactive)
        user = UserAccount.get_client_by_phone(normalized, active_only=False)
        exists = user is not None
        is_active = exists and user.is_active
        
        response_data = {
            'success': True,
            'exists': exists,
            'is_active': is_active,
            'is_valid': True,
            'phone_number': normalized,
            'phone_number_display': PhoneValidation.get_phone_display(phone),
            'message': 'Client found' if exists else 'Client not found'
        }
        
        if exists:
            response_data['client'] = {
                'id': str(user.id),
                'username': user.username,
                'connection_type': user.connection_type,
                'is_pppoe_client': user.is_pppoe_client,
                'is_hotspot_client': user.is_hotspot_client,
                'source': user.source,
                'is_active': user.is_active,
            }
        
        return Response(response_data)
        
    except Exception as e:
        logger.error(f"Phone check error: {e}")
        return Response({
            'success': False,
            'error': 'Failed to check phone number'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
@rate_limited(max_calls=300, period=60, scope="check_uuid")
def check_uuid(request):
    """
    GET endpoint to check if UUID exists
    """
    user_uuid = request.GET.get('uuid')
    
    if not user_uuid:
        return Response({
            'success': False,
            'error': 'UUID parameter is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        import uuid as uuid_lib
        uuid_obj = uuid_lib.UUID(user_uuid)
        
        # Check existence
        exists = UserAccount.objects.filter(id=uuid_obj, is_active=True).exists()
        
        # Get user data if exists
        user_data = None
        if exists:
            try:
                user = UserAccount.objects.get(id=uuid_obj, is_active=True)
                user_data = user.to_dict()
            except UserAccount.DoesNotExist:
                pass
        
        return Response({
            'success': True,
            'exists': exists,
            'is_valid': True,
            'uuid': str(uuid_obj),
            'message': 'User found' if exists else 'User not found',
            'user': user_data
        })
        
    except ValueError:
        return Response({
            'success': False,
            'exists': False,
            'is_valid': False,
            'message': 'Invalid UUID format'
        })
    except Exception as e:
        logger.error(f"UUID check error: {e}")
        return Response({
            'success': False,
            'error': 'Failed to check UUID'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
@rate_limited(max_calls=300, period=60, scope="check_email")
def check_email(request):
    """
    GET endpoint to check if email exists
    Used by dashboard for email validation
    """
    email = request.GET.get('email')
    
    if not email:
        return Response({
            'success': False,
            'error': 'Email parameter is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        from authentication.serializers import ValidationAlgorithms
        
        if not ValidationAlgorithms.is_valid_email(email):
            return Response({
                'success': False,
                'exists': False,
                'is_valid': False,
                'message': 'Invalid email format'
            })
        
        # Check existence (authenticated users only)
        exists = UserAccount.objects.filter(
            email__iexact=email,
            user_type__in=['staff', 'admin'],
            is_active=True
        ).exists()
        
        return Response({
            'success': True,
            'exists': exists,
            'is_valid': True,
            'email': email,
            'message': 'Email found' if exists else 'Email not found'
        })
        
    except Exception as e:
        logger.error(f"Email check error: {e}")
        return Response({
            'success': False,
            'error': 'Failed to check email'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== USER PROFILE VIEWS ====================
class UserMeViewSet(GenericViewSet, mixins.RetrieveModelMixin, mixins.UpdateModelMixin):
    """
    Current user profile endpoints
    Uses Djoser for authenticated users, custom for client users
    """
    serializer_class = UserMeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        """Get current user"""
        return self.request.user
    
    @method_decorator(rate_limited(max_calls=100, period=60, scope="user_profile"))
    def retrieve(self, request, *args, **kwargs):
        """Get current user profile"""
        user = self.get_object()
        serializer = self.get_serializer(user)
        return Response(serializer.data)


# ==================== PPPOE CLIENT SELF-SERVICE VIEWS ====================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@rate_limited(max_calls=20, period=60, scope="pppoe_update")
def pppoe_update_credentials(request):
    """
    PPPoE client self-service credential update
    Only accessible to PPPoE clients after login
    """
    try:
        user = request.user
        
        # Only PPPoE clients can update their credentials
        if not user.is_pppoe_client:
            return Response({
                'error': 'Only PPPoE clients can update credentials'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = PPPoECredentialUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Update credentials
        updates = user.update_pppoe_credentials(
            username=serializer.validated_data.get('username'),
            password=serializer.validated_data.get('password')
        )
        
        logger.info(f"PPPoE credentials updated by client: {user.username}")
        
        return Response({
            'success': True,
            'message': 'PPPoE credentials updated successfully',
            'updates': updates['updates']
        })
        
    except Exception as e:
        logger.error(f"PPPoE credential update error: {e}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


# ==================== USER TYPE CHECK VIEWS ====================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_user_type(request):
    """
    Check if current user has specific user type
    Used by frontend for conditional rendering
    """
    user_type = request.GET.get('user_type')
    
    if not user_type:
        return Response({
            'error': 'user_type parameter is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    has_type = request.user.user_type == user_type
    
    return Response({
        'has_type': has_type,
        'user_type': request.user.user_type,
        'requested_type': user_type
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_connection_type(request):
    """
    Check if current user has specific connection type
    Used by client landing pages
    """
    connection_type = request.GET.get('connection_type')
    
    if not connection_type:
        return Response({
            'error': 'connection_type parameter is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # For authenticated users, connection_type is always 'admin'
    if request.user.is_authenticated_user:
        has_type = (connection_type == 'admin')
    else:
        has_type = request.user.connection_type == connection_type
    
    return Response({
        'has_type': has_type,
        'connection_type': request.user.connection_type,
        'requested_type': connection_type
    })


# ==================== CLIENT LOOKUP VIEWS ====================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_client_by_phone(request):
    """
    Get client details by phone number
    Only accessible to authenticated users (for UserManagement app)
    """
    phone = request.GET.get('phone')
    
    if not phone:
        return Response({
            'error': 'Phone parameter is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = UserAccount.get_client_by_phone(phone)
        
        if not user:
            return Response({
                'success': False,
                'message': 'Client not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        return Response({
            'success': True,
            'client': user.to_dict()
        })
        
    except Exception as e:
        logger.error(f"Client lookup error: {e}")
        return Response({
            'error': 'Failed to lookup client'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== AUTHENTICATED USER CREATION ====================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_authenticated_user(request):
    """
    Create new authenticated user (staff/admin)
    Only accessible to existing authenticated users with proper permissions
    """
    try:
        # Only admins can create new authenticated users
        if request.user.user_type != 'admin':
            return Response({
                'error': 'Only admin users can create new authenticated users'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = AuthenticatedUserCreateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = serializer.save()
        
        logger.info(f"Authenticated user created by admin {request.user.email}: {user.email}")
        
        return Response({
            'success': True,
            'message': 'Authenticated user created successfully',
            'user': {
                'id': str(user.id),
                'email': user.email,
                'name': user.name,
                'user_type': user.user_type,
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Authenticated user creation error: {e}")
        return Response({
            'error': 'Failed to create authenticated user'
        }, status=status.HTTP_400_BAD_REQUEST)


# ==================== BULK OPERATIONS ====================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_check_phones(request):
    """
    Bulk check multiple phone numbers
    Useful for admin dashboard operations
    """
    try:
        # Only admin/staff can use bulk operations
        if request.user.user_type not in ['admin', 'staff']:
            return Response({
                'error': 'Only admin or staff can use bulk operations'
            }, status=status.HTTP_403_FORBIDDEN)
        
        phones = request.data.get('phones', [])
        
        if not phones or not isinstance(phones, list):
            return Response({
                'error': 'Phones must be a list of phone numbers'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        results = []
        for phone in phones[:100]:  # Limit to 100 phones per request
            try:
                normalized = PhoneValidation.normalize_kenyan_phone(str(phone))
                is_valid = PhoneValidation.is_valid_kenyan_phone(normalized)
                
                user = None
                exists = False
                is_active = False
                
                if is_valid:
                    user = UserAccount.get_client_by_phone(normalized, active_only=False)
                    exists = user is not None
                    is_active = exists and user.is_active
                
                results.append({
                    'phone': phone,
                    'normalized': normalized,
                    'is_valid': is_valid,
                    'exists': exists,
                    'is_active': is_active,
                    'user_id': str(user.id) if user else None,
                    'username': user.username if user else None,
                    'connection_type': user.connection_type if user else None,
                })
                
            except Exception as e:
                results.append({
                    'phone': phone,
                    'error': str(e),
                    'is_valid': False,
                    'exists': False,
                })
        
        return Response({
            'success': True,
            'count': len(results),
            'results': results
        })
        
    except Exception as e:
        logger.error(f"Bulk phone check error: {e}")
        return Response({
            'error': 'Failed to process bulk request'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)