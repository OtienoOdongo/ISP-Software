


# """
# AUTHENTICATION APP - Production Ready Views
# Enhanced with caching, rate limiting, and optimized performance
# Supporting email-based admin auth and username-based PPPoE auth
# """

# from rest_framework.decorators import api_view, permission_classes, action
# from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
# from rest_framework.response import Response
# from rest_framework import generics, status, viewsets, mixins
# from rest_framework.viewsets import GenericViewSet, ModelViewSet
# from rest_framework_simplejwt.tokens import RefreshToken
# from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
# from django.utils.decorators import method_decorator
# from django.views.decorators.csrf import csrf_exempt
# from django.conf import settings
# from django.db.models import Q, Count, F, ExpressionWrapper, DurationField
# from django.core.cache import cache
# from django.utils import timezone
# from django.contrib.auth import authenticate
# from typing import Dict, Any, List, Optional
# import time
# import logging
# from functools import lru_cache
# import uuid as uuid_lib
# from datetime import timedelta

# from authentication.models import UserAccount, CredentialEncryption, IDGenerator, PhoneValidation
# from authentication.serializers import (
#     HotspotClientCreateSerializer,
#     PPPoEClientCreateSerializer,
#     PPPoECredentialSerializer,
#     PPPoECredentialUpdateSerializer,
#     UserMeSerializer,
#     AdminPPPoESetupSerializer,
#     PPPoEAuthRequestSerializer,
#     PhoneValidationSerializer,
#     UUIDValidationSerializer,
#     DjoserUserCreateSerializer,
#     UserSerializer,
#     BulkUserOperationSerializer,
#     BulkUserResponseSerializer
# )

# logger = logging.getLogger(__name__)


# # ==================== DECORATORS ====================
# def rate_limited(max_calls: int = 100, period: int = 60, scope: str = "default"):
#     """
#     Enhanced rate limiting decorator with Redis backend
#     """
#     def decorator(view_func):
#         def wrapped_view(request, *args, **kwargs):
#             # Create unique identifier for rate limiting
#             if request.user.is_authenticated:
#                 identifier = f"{scope}_user_{request.user.id}"
#             else:
#                 ip_address = request.META.get('REMOTE_ADDR', 'unknown')
#                 identifier = f"{scope}_ip_{ip_address}"
            
#             cache_key = f"rate_limit_{identifier}"
            
#             # Get current count and timestamp
#             current_time = time.time()
#             rate_data = cache.get(cache_key) or {'count': 0, 'reset_time': current_time + period}
            
#             # Reset counter if period has passed
#             if current_time > rate_data['reset_time']:
#                 rate_data = {'count': 1, 'reset_time': current_time + period}
#             else:
#                 rate_data['count'] += 1
            
#             # Check if rate limit exceeded
#             if rate_data['count'] > max_calls:
#                 logger.warning(f"Rate limit exceeded for {identifier}")
#                 return Response(
#                     {
#                         'error': 'Rate limit exceeded',
#                         'retry_after': int(rate_data['reset_time'] - current_time),
#                         'max_calls': max_calls,
#                         'period': period
#                     },
#                     status=status.HTTP_429_TOO_MANY_REQUESTS
#                 )
            
#             # Update cache
#             cache.set(cache_key, rate_data, period)
            
#             # Add rate limit headers to response
#             response = view_func(request, *args, **kwargs)
#             response['X-RateLimit-Limit'] = str(max_calls)
#             response['X-RateLimit-Remaining'] = str(max_calls - rate_data['count'])
#             response['X-RateLimit-Reset'] = str(int(rate_data['reset_time']))
            
#             return response
        
#         return wrapped_view
#     return decorator


# def cached_response(timeout: int = 300, vary_by_user: bool = False, vary_by_query: bool = True):
#     """
#     Enhanced response caching decorator with Redis
#     """
#     def decorator(view_func):
#         def wrapped_view(request, *args, **kwargs):
#             # Generate cache key based on request
#             cache_parts = [view_func.__name__]
            
#             if vary_by_user and request.user.is_authenticated:
#                 cache_parts.append(f"user_{request.user.id}")
            
#             if vary_by_query:
#                 cache_parts.append(request.get_full_path())
            
#             cache_key = "_".join(cache_parts)
            
#             # Check cache
#             cached_response_data = cache.get(cache_key)
#             if cached_response_data:
#                 logger.debug(f"Cache hit for {cache_key}")
#                 return Response(cached_response_data)
            
#             # Execute view
#             response = view_func(request, *args, **kwargs)
            
#             # Cache successful responses
#             if response.status_code == 200:
#                 cache.set(cache_key, response.data, timeout)
#                 logger.debug(f"Cached response for {cache_key} for {timeout} seconds")
            
#             return response
        
#         return wrapped_view
#     return decorator


# # ==================== AUTHENTICATION HELPERS ====================
# def authenticate_admin(email: str, password: str) -> Optional[UserAccount]:
#     """Authenticate admin using email and password"""
#     try:
#         # First try to get admin user by email
#         user = UserAccount.objects.get(
#             email__iexact=email,
#             user_type__in=['admin', 'superadmin'],
#             is_active=True
#         )
        
#         # Check password
#         if user.check_password(password):
#             return user
    
#     except UserAccount.DoesNotExist:
#         pass
    
#     return None


# def authenticate_pppoe(username: str, password: str) -> Optional[UserAccount]:
#     """Authenticate PPPoE user using username and password"""
#     try:
#         # Find user by PPPoE username
#         user = UserAccount.objects.get(
#             pppoe_username=username,
#             is_active=True
#         )
        
#         # Verify PPPoE password
#         decrypted_password = user.get_pppoe_password_decrypted()
#         if decrypted_password and password == decrypted_password:
#             return user
    
#     except UserAccount.DoesNotExist:
#         pass
    
#     return None


# # ==================== CLIENT CREATION VIEWS ====================
# class HotspotClientCreateView(generics.CreateAPIView):
#     """
#     Create or retrieve hotspot client
#     Public endpoint for hotspot registration - phone only, no password
#     """
#     serializer_class = HotspotClientCreateSerializer
#     permission_classes = [AllowAny]
    
#     @method_decorator(csrf_exempt)
#     @method_decorator(rate_limited(max_calls=50, period=60, scope="hotspot_registration"))
#     def dispatch(self, *args, **kwargs):
#         return super().dispatch(*args, **kwargs)
    
#     def create(self, request, *args, **kwargs):
#         """Handle hotspot client creation with enhanced response"""
#         try:
#             serializer = self.get_serializer(data=request.data)
#             serializer.is_valid(raise_exception=True)
            
#             user = serializer.save()
            
#             # Get user display data
#             user_data = {
#                 'id': str(user.id),
#                 'username': user.username,
#                 'phone_number': user.phone_number,
#                 'phone_number_display': user.get_phone_display(),
#                 'user_type': user.user_type,
#                 'connection_type': user.connection_type,
#                 'created': serializer.validated_data.get('created', False)
#             }
            
#             status_code = status.HTTP_201_CREATED if user_data['created'] else status.HTTP_200_OK
#             message = 'Hotspot client created successfully' if user_data['created'] else 'Existing hotspot client found'
            
#             logger.info(f"Hotspot client processed: {user.username} (new: {user_data['created']})")
            
#             return Response({
#                 'success': True,
#                 'message': message,
#                 'user': user_data,
#                 'is_new': user_data['created']
#             }, status=status_code)
            
#         except Exception as e:
#             logger.error(f"Hotspot client creation error: {str(e)}")
#             return Response({
#                 'error': 'Failed to process hotspot client request',
#                 'details': str(e) if settings.DEBUG else None
#             }, status=status.HTTP_400_BAD_REQUEST)


# class PPPoEClientCreateView(generics.CreateAPIView):
#     """
#     Create or retrieve PPPoE client
#     Public endpoint for PPPoE registration - with auto-generated credentials
#     """
#     serializer_class = PPPoEClientCreateSerializer
#     permission_classes = [AllowAny]
    
#     @method_decorator(csrf_exempt)
#     @method_decorator(rate_limited(max_calls=30, period=60, scope="pppoe_registration"))
#     def dispatch(self, *args, **kwargs):
#         return super().dispatch(*args, **kwargs)
    
#     def create(self, request, *args, **kwargs):
#         """Handle PPPoE client creation with SMS sending"""
#         try:
#             # Set context for SMS sending
#             context = self.get_serializer_context()
#             context['send_sms'] = request.data.get('send_sms', True)
            
#             serializer = self.get_serializer(data=request.data, context=context)
#             serializer.is_valid(raise_exception=True)
            
#             user = serializer.save()
            
#             # Get PPPoE credentials for new users
#             pppoe_data = {}
#             if user.pppoe_username and serializer.validated_data.get('created', False):
#                 pppoe_data = {
#                     'pppoe_username': user.pppoe_username,
#                     'pppoe_password': user.get_pppoe_password_decrypted(),
#                     'credentials_sent': user.pppoe_credentials_sent,
#                     'credentials_sent_at': user.pppoe_credentials_sent_at
#                 }
            
#             user_data = {
#                 'id': str(user.id),
#                 'username': user.username,
#                 'phone_number': user.phone_number,
#                 'phone_number_display': user.get_phone_display(),
#                 'name': user.name,
#                 'user_type': user.user_type,
#                 'connection_type': user.connection_type,
#                 'created': serializer.validated_data.get('created', False)
#             }
#             user_data.update(pppoe_data)
            
#             status_code = status.HTTP_201_CREATED if user_data['created'] else status.HTTP_200_OK
#             message = 'PPPoE client created successfully' if user_data['created'] else 'Existing PPPoE client found'
            
#             logger.info(f"PPPoE client processed: {user.username} (new: {user_data['created']})")
            
#             return Response({
#                 'success': True,
#                 'message': message,
#                 'user': user_data,
#                 'is_new': user_data['created']
#             }, status=status_code)
            
#         except Exception as e:
#             logger.error(f"PPPoE client creation error: {str(e)}")
#             return Response({
#                 'error': 'Failed to process PPPoE client request',
#                 'details': str(e) if settings.DEBUG else None
#             }, status=status.HTTP_400_BAD_REQUEST)


# # ==================== ADMIN AUTHENTICATION VIEWS ====================
# class AdminLoginView(generics.GenericAPIView):
#     """
#     Custom admin login using email and password
#     Alternative to Djoser JWT login for admin-specific authentication
#     """
#     permission_classes = [AllowAny]
#     serializer_class = None  # Using custom validation
    
#     @method_decorator(csrf_exempt)
#     @method_decorator(rate_limited(max_calls=20, period=60, scope="admin_login"))
#     def post(self, request, *args, **kwargs):
#         """Authenticate admin user and return JWT tokens"""
#         email = request.data.get('email')
#         password = request.data.get('password')
        
#         if not email or not password:
#             return Response({
#                 'error': 'Email and password are required'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         # Authenticate admin
#         user = authenticate_admin(email, password)
        
#         if not user:
#             logger.warning(f"Admin login failed for email: {email}")
#             return Response({
#                 'error': 'Invalid email or password'
#             }, status=status.HTTP_401_UNAUTHORIZED)
        
#         # Generate JWT tokens
#         try:
#             refresh = RefreshToken.for_user(user)
#             access_token = str(refresh.access_token)
            
#             # Update last login
#             user.last_login = timezone.now()
#             user.save(update_fields=['last_login'])
            
#             logger.info(f"Admin login successful: {user.email}")
            
#             return Response({
#                 'success': True,
#                 'message': 'Login successful',
#                 'user': {
#                     'id': str(user.id),
#                     'username': user.username,
#                     'email': user.email,
#                     'name': user.name,
#                     'user_type': user.user_type,
#                     'is_admin': user.is_admin,
#                     'is_super_admin': user.is_super_admin
#                 },
#                 'tokens': {
#                     'access': access_token,
#                     'refresh': str(refresh)
#                 }
#             })
            
#         except Exception as e:
#             logger.error(f"Token generation failed for admin {email}: {e}")
#             return Response({
#                 'error': 'Authentication service temporarily unavailable'
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# # ==================== PPPOE CREDENTIAL VIEWS ====================
# class PPPoECredentialViewSet(GenericViewSet, mixins.RetrieveModelMixin, mixins.UpdateModelMixin):
#     """
#     Manage PPPoE credentials for authenticated users
#     """
#     serializer_class = PPPoECredentialSerializer
#     permission_classes = [IsAuthenticated]
    
#     def get_object(self):
#         """Get current user"""
#         return self.request.user
    
#     @cached_response(timeout=60, vary_by_user=True)
#     def retrieve(self, request, *args, **kwargs):
#         """Get PPPoE credentials"""
#         user = self.get_object()
        
#         if not user.pppoe_username:
#             return Response({
#                 'error': 'User does not have PPPoE credentials configured'
#             }, status=status.HTTP_404_NOT_FOUND)
        
#         # Add context for password display
#         context = self.get_serializer_context()
#         context['show_password'] = request.query_params.get('show_password', '').lower() == 'true'
        
#         serializer = self.get_serializer(user, context=context)
#         return Response(serializer.data)
    
#     @action(detail=False, methods=['post'])
#     def reset(self, request):
#         """Reset PPPoE credentials"""
#         user = self.get_object()
        
#         if not user.pppoe_username:
#             return Response({
#                 'error': 'User does not have PPPoE credentials to reset'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         try:
#             send_sms = request.data.get('send_sms', True)
#             new_credentials = user.reset_pppoe_credentials(send_sms=send_sms)
            
#             logger.info(f"PPPoE credentials reset for user: {user.username}")
            
#             # Invalidate cache
#             cache.delete(f"pppoe_pw_{user.uuid}")
#             cache.delete_pattern(f"user_display_{user.uuid}_*")
            
#             return Response({
#                 'success': True,
#                 'message': 'PPPoE credentials reset successfully',
#                 'credentials': {
#                     'username': new_credentials['username'],
#                     'password': new_credentials['password']
#                 },
#                 'sms_sent': send_sms and user.pppoe_credentials_sent
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to reset PPPoE credentials: {e}")
#             return Response({
#                 'error': 'Failed to reset PPPoE credentials',
#                 'details': str(e) if settings.DEBUG else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     @action(detail=False, methods=['put'])
#     def update_credentials(self, request):
#         """Update PPPoE username and/or password"""
#         user = self.get_object()
        
#         if not user.is_pppoe_user:
#             return Response({
#                 'error': 'User is not a PPPoE user'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         serializer = PPPoECredentialUpdateSerializer(data=request.data)
#         if not serializer.is_valid():
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
#         try:
#             # Update credentials
#             updates = user.update_pppoe_credentials(
#                 username=serializer.validated_data.get('username'),
#                 password=serializer.validated_data.get('password')
#             )
            
#             # Send SMS if requested
#             send_sms = serializer.validated_data.get('send_sms', True)
#             sms_sent = False
#             if send_sms:
#                 sms_sent = user.send_pppoe_credentials_sms()
            
#             logger.info(f"PPPoE credentials updated for user: {user.username}")
            
#             # Invalidate cache
#             cache.delete(f"pppoe_pw_{user.uuid}")
#             cache.delete_pattern(f"user_display_{user.uuid}_*")
            
#             return Response({
#                 'success': True,
#                 'message': 'PPPoE credentials updated successfully',
#                 'updates': updates['updates'],
#                 'sms_sent': sms_sent
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to update PPPoE credentials: {e}")
#             return Response({
#                 'error': str(e)
#             }, status=status.HTTP_400_BAD_REQUEST)
    
#     @action(detail=False, methods=['post'])
#     def send_sms(self, request):
#         """Send PPPoE credentials via SMS"""
#         user = self.get_object()
        
#         if not user.is_pppoe_user:
#             return Response({
#                 'error': 'User is not a PPPoE user'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         try:
#             sms_sent = user.send_pppoe_credentials_sms()
            
#             if sms_sent:
#                 return Response({
#                     'success': True,
#                     'message': 'PPPoE credentials sent via SMS',
#                     'sent_at': user.pppoe_credentials_sent_at
#                 })
#             else:
#                 return Response({
#                     'success': False,
#                     'error': 'Failed to send SMS'
#                 }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
#         except Exception as e:
#             logger.error(f"Failed to send PPPoE credentials SMS: {e}")
#             return Response({
#                 'error': 'Failed to send SMS',
#                 'details': str(e) if settings.DEBUG else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# # ==================== USER PROFILE VIEWS ====================
# class UserMeViewSet(GenericViewSet, mixins.RetrieveModelMixin, mixins.UpdateModelMixin):
#     """
#     Get and update current user profile
#     """
#     serializer_class = UserMeSerializer
#     permission_classes = [IsAuthenticated]
    
#     def get_object(self):
#         """Get current user"""
#         return self.request.user
    
#     @cached_response(timeout=60, vary_by_user=True)
#     def retrieve(self, request, *args, **kwargs):
#         """Get current user profile"""
#         user = self.get_object()
#         serializer = self.get_serializer(user)
#         return Response(serializer.data)
    
#     def update(self, request, *args, **kwargs):
#         """Update current user profile"""
#         user = self.get_object()
        
#         # Handle partial updates
#         partial = kwargs.pop('partial', False)
        
#         serializer = self.get_serializer(user, data=request.data, partial=partial)
#         serializer.is_valid(raise_exception=True)
#         serializer.save()
        
#         # Invalidate cache
#         cache.delete_pattern(f"user_display_{user.uuid}_*")
#         cache.delete_pattern(f"user_by_*_{user.uuid}")
        
#         return Response(serializer.data)


# # ==================== VALIDATION VIEWS ====================
# @api_view(['POST'])
# @permission_classes([AllowAny])
# @rate_limited(max_calls=200, period=60, scope="phone_validation")
# def validate_phone(request):
#     """
#     Validate phone number and check if it exists
#     """
#     try:
#         serializer = PhoneValidationSerializer(data=request.data, context={'request': request})
        
#         if not serializer.is_valid():
#             return Response({
#                 'success': False,
#                 'error': 'Invalid phone number',
#                 'details': serializer.errors
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         # Return enhanced validation result
#         phone_data = serializer.data
        
#         return Response({
#             'success': True,
#             'data': phone_data
#         })
        
#     except Exception as e:
#         logger.error(f"Phone validation error: {str(e)}")
#         return Response({
#             'success': False,
#             'error': 'Phone validation failed',
#             'details': str(e) if settings.DEBUG else None
#         }, status=status.HTTP_400_BAD_REQUEST)


# @api_view(['POST'])
# @permission_classes([AllowAny])
# @rate_limited(max_calls=200, period=60, scope="uuid_validation")
# def validate_uuid(request):
#     """
#     Validate UUID and check if user exists
#     """
#     try:
#         serializer = UUIDValidationSerializer(data=request.data, context={'request': request})
        
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
#         logger.error(f"UUID validation error: {str(e)}")
#         return Response({
#             'success': False,
#             'error': 'UUID validation failed',
#             'details': str(e) if settings.DEBUG else None
#         }, status=status.HTTP_400_BAD_REQUEST)


# @api_view(['GET'])
# @permission_classes([AllowAny])
# @rate_limited(max_calls=300, period=60, scope="check_phone")
# @cached_response(timeout=300)
# def check_phone(request):
#     """
#     Check if phone number exists (GET version)
#     """
#     phone = request.GET.get('phone')
    
#     if not phone:
#         return Response({
#             'success': False,
#             'error': 'Phone parameter is required'
#         }, status=status.HTTP_400_BAD_REQUEST)
    
#     try:
#         from authentication.serializers import ValidationAlgorithms
        
#         # Normalize phone
#         normalized = ValidationAlgorithms.normalize_phone(phone)
        
#         if not ValidationAlgorithms.is_valid_phone_number(normalized):
#             return Response({
#                 'success': False,
#                 'exists': False,
#                 'is_valid': False,
#                 'message': 'Invalid phone number format. Must be 07XXXXXXXX or 01XXXXXXXX'
#             })
        
#         # Check existence
#         exists = UserAccount.objects.filter(
#             phone_number=normalized,
#             is_active=True
#         ).exists()
        
#         # Get user data if exists
#         user_data = None
#         if exists:
#             try:
#                 user = UserAccount.objects.get(phone_number=normalized, is_active=True)
#                 user_data = {
#                     'id': str(user.id),
#                     'username': user.username,
#                     'user_type': user.user_type,
#                     'connection_type': user.connection_type
#                 }
#             except UserAccount.DoesNotExist:
#                 pass
        
#         response_data = {
#             'success': True,
#             'exists': exists,
#             'is_valid': True,
#             'phone_number': normalized,
#             'phone_number_display': ValidationAlgorithms.get_phone_display(phone),
#             'operator': PhoneValidation.get_operator(phone),
#             'message': 'Phone number found' if exists else 'Phone number not found'
#         }
        
#         if user_data:
#             response_data['user'] = user_data
        
#         return Response(response_data)
        
#     except Exception as e:
#         logger.error(f"Phone check error: {str(e)}")
#         return Response({
#             'success': False,
#             'error': 'Failed to check phone number',
#             'details': str(e) if settings.DEBUG else None
#         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# @api_view(['GET'])
# @permission_classes([AllowAny])
# @rate_limited(max_calls=300, period=60, scope="check_uuid")
# @cached_response(timeout=300)
# def check_uuid(request):
#     """
#     Check if UUID exists
#     """
#     user_uuid = request.GET.get('uuid')
    
#     if not user_uuid:
#         return Response({
#             'success': False,
#             'error': 'UUID parameter is required'
#         }, status=status.HTTP_400_BAD_REQUEST)
    
#     try:
#         # Validate UUID format
#         try:
#             uuid_obj = uuid_lib.UUID(user_uuid)
#         except ValueError:
#             return Response({
#                 'success': False,
#                 'exists': False,
#                 'is_valid': False,
#                 'message': 'Invalid UUID format'
#             })
        
#         # Check existence
#         exists = UserAccount.objects.filter(
#             id=uuid_obj,
#             is_active=True
#         ).exists()
        
#         # Get user data if exists
#         user_data = None
#         if exists:
#             try:
#                 user = UserAccount.objects.get(id=uuid_obj, is_active=True)
#                 user_data = {
#                     'id': str(user.id),
#                     'username': user.username,
#                     'email': user.email,
#                     'phone_number': user.phone_number,
#                     'user_type': user.user_type,
#                     'connection_type': user.connection_type
#                 }
#             except UserAccount.DoesNotExist:
#                 pass
        
#         return Response({
#             'success': True,
#             'exists': exists,
#             'is_valid': True,
#             'uuid': str(uuid_obj),
#             'message': 'User found' if exists else 'User not found',
#             'user': user_data if user_data else None
#         })
        
#     except Exception as e:
#         logger.error(f"UUID check error: {str(e)}")
#         return Response({
#             'success': False,
#             'error': 'Failed to check UUID',
#             'details': str(e) if settings.DEBUG else None
#         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# @api_view(['GET'])
# @permission_classes([AllowAny])
# @rate_limited(max_calls=300, period=60, scope="check_email")
# @cached_response(timeout=300)
# def check_email(request):
#     """
#     Check if email exists
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
        
#         # Check existence
#         exists = UserAccount.objects.filter(
#             email__iexact=email,
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
#         logger.error(f"Email check error: {str(e)}")
#         return Response({
#             'success': False,
#             'error': 'Failed to check email',
#             'details': str(e) if settings.DEBUG else None
#         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# # ==================== PPPOE AUTHENTICATION VIEW ====================
# @api_view(['POST'])
# @permission_classes([AllowAny])
# @rate_limited(max_calls=50, period=60, scope="pppoe_auth")
# def pppoe_authenticate(request):
#     """
#     PPPoE Authentication Endpoint
#     Used by routers to authenticate PPPoE connections
#     """
#     start_time = time.time()
    
#     try:
#         serializer = PPPoEAuthRequestSerializer(data=request.data)
        
#         if not serializer.is_valid():
#             logger.warning(f"Invalid PPPoE auth request: {serializer.errors}")
#             return Response({
#                 'authenticated': False,
#                 'message': 'Invalid authentication request',
#                 'errors': serializer.errors
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         username = serializer.validated_data['username']
#         password = serializer.validated_data['password']
        
#         logger.info(f"PPPoE authentication attempt: {username}")
        
#         # Find user by PPPoE username with caching
#         cache_key = f"pppoe_user_{username}"
#         cached_user_id = cache.get(cache_key)
        
#         user = None
#         if cached_user_id:
#             try:
#                 user = UserAccount.objects.get(id=cached_user_id, is_active=True)
#             except UserAccount.DoesNotExist:
#                 cache.delete(cache_key)
#                 user = None
        
#         if not user:
#             try:
#                 user = UserAccount.objects.get(
#                     pppoe_username=username,
#                     is_active=True
#                 )
#                 # Cache user ID for faster lookups
#                 cache.set(cache_key, str(user.id), 300)
#             except UserAccount.DoesNotExist:
#                 logger.warning(f"PPPoE user not found: {username}")
#                 return Response({
#                     'authenticated': False,
#                     'message': 'Invalid PPPoE credentials'
#                 }, status=status.HTTP_401_UNAUTHORIZED)
        
#         # Verify password
#         decrypted_password = user.get_pppoe_password_decrypted()
        
#         if not decrypted_password or password != decrypted_password:
#             logger.warning(f"PPPoE authentication failed for: {username}")
#             return Response({
#                 'authenticated': False,
#                 'message': 'Invalid PPPoE credentials'
#             }, status=status.HTTP_401_UNAUTHORIZED)
        
#         # Authentication successful
#         logger.info(f"PPPoE authentication successful: {username}")
        
#         # Update last login and status
#         user.last_pppoe_login = timezone.now()
#         user.pppoe_active = True
#         user.save(update_fields=['last_pppoe_login', 'pppoe_active', 'last_updated'])
        
#         # Generate JWT tokens for API access
#         try:
#             refresh = RefreshToken.for_user(user)
            
#             # Prepare user data
#             user_data = user.get_display_fields()
            
#             response_data = {
#                 'authenticated': True,
#                 'message': 'PPPoE authentication successful',
#                 'access_token': str(refresh.access_token),
#                 'refresh_token': str(refresh),
#                 'expires_in': refresh.access_token.lifetime.total_seconds(),
#                 'user': user_data,
#                 'processing_time': round(time.time() - start_time, 3)
#             }
            
#             return Response(response_data)
            
#         except Exception as e:
#             logger.error(f"JWT token generation failed: {e}")
            
#             # Fallback response without tokens
#             return Response({
#                 'authenticated': True,
#                 'message': 'PPPoE authentication successful (API tokens unavailable)',
#                 'user': user.get_display_fields(),
#                 'processing_time': round(time.time() - start_time, 3)
#             })
            
#     except Exception as e:
#         logger.error(f"PPPoE authentication error: {str(e)}", exc_info=True)
#         return Response({
#             'authenticated': False,
#             'error': 'Authentication service temporarily unavailable',
#             'details': str(e) if settings.DEBUG else None,
#             'processing_time': round(time.time() - start_time, 3)
#         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# # ==================== ADMIN PPPOE SETUP VIEW ====================
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def admin_pppoe_setup(request):
#     """
#     Setup PPPoE credentials for admin user
#     """
#     try:
#         user = request.user
        
#         # Only allow admins
#         if not user.is_admin:
#             return Response({
#                 'error': 'Only admin users can setup PPPoE credentials'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         serializer = AdminPPPoESetupSerializer(
#             data=request.data,
#             context={'request': request}
#         )
        
#         if not serializer.is_valid():
#             return Response({
#                 'error': 'Invalid PPPoE setup data',
#                 'details': serializer.errors
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         # Use model's setup method
#         result = user.setup_admin_pppoe(
#             username=serializer.validated_data.get('username'),
#             password=serializer.validated_data.get('password')
#         )
        
#         # Update admin-specific settings
#         if 'bandwidth' in serializer.validated_data:
#             user.admin_pppoe_bandwidth = serializer.validated_data['bandwidth']
#             user.save(update_fields=['admin_pppoe_bandwidth'])
        
#         if 'priority' in serializer.validated_data:
#             user.admin_pppoe_priority = serializer.validated_data['priority']
#             user.save(update_fields=['admin_pppoe_priority'])
        
#         logger.info(f"Admin PPPoE setup completed for: {user.email}")
        
#         return Response({
#             'success': True,
#             'message': 'PPPoE credentials setup successfully',
#             'pppoe_username': result['username'],
#             'auto_generated_password': result.get('message', '').find('auto-generated') != -1,
#             'bandwidth': user.admin_pppoe_bandwidth,
#             'priority': user.admin_pppoe_priority
#         })
        
#     except Exception as e:
#         logger.error(f"Admin PPPoE setup error: {str(e)}", exc_info=True)
#         return Response({
#             'error': str(e)
#         }, status=status.HTTP_400_BAD_REQUEST)


# # ==================== USER MANAGEMENT VIEWS ====================
# class UserManagementViewSet(viewsets.ReadOnlyModelViewSet):
#     """
#     User management for admins
#     """
#     serializer_class = UserSerializer
#     permission_classes = [IsAuthenticated, IsAdminUser]
    
#     def get_queryset(self):
#         """Filter users based on query parameters"""
#         queryset = UserAccount.objects.filter(is_active=True)
        
#         # Filter by user type
#         user_type = self.request.query_params.get('user_type')
#         if user_type:
#             queryset = queryset.filter(user_type=user_type)
        
#         # Filter by connection type
#         connection_type = self.request.query_params.get('connection_type')
#         if connection_type:
#             queryset = queryset.filter(connection_type=connection_type)
        
#         # Filter by date range
#         start_date = self.request.query_params.get('start_date')
#         end_date = self.request.query_params.get('end_date')
#         if start_date:
#             queryset = queryset.filter(date_joined__gte=start_date)
#         if end_date:
#             queryset = queryset.filter(date_joined__lte=end_date)
        
#         # Search by name, email, or phone
#         search = self.request.query_params.get('search')
#         if search:
#             queryset = queryset.filter(
#                 Q(name__icontains=search) |
#                 Q(email__icontains=search) |
#                 Q(phone_number__icontains=search) |
#                 Q(username__icontains=search)
#             )
        
#         return queryset.order_by('-date_joined')
    
#     @action(detail=True, methods=['post'])
#     def deactivate(self, request, pk=None):
#         """Deactivate a user"""
#         user = self.get_object()
        
#         if user == request.user:
#             return Response({
#                 'error': 'You cannot deactivate your own account'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         user.is_active = False
#         user.save(update_fields=['is_active', 'last_updated'])
        
#         # Invalidate cache
#         cache.delete_pattern(f"user_display_{user.uuid}_*")
#         cache.delete_pattern(f"user_by_*_{user.uuid}")
        
#         logger.info(f"User deactivated by admin: {user.username}")
        
#         return Response({
#             'success': True,
#             'message': f'User {user.username} deactivated successfully'
#         })
    
#     @action(detail=True, methods=['post'])
#     def activate(self, request, pk=None):
#         """Activate a user"""
#         user = self.get_object()
        
#         user.is_active = True
#         user.save(update_fields=['is_active', 'last_updated'])
        
#         # Invalidate cache
#         cache.delete_pattern(f"user_display_{user.uuid}_*")
#         cache.delete_pattern(f"user_by_*_{user.uuid}")
        
#         logger.info(f"User activated by admin: {user.username}")
        
#         return Response({
#             'success': True,
#             'message': f'User {user.username} activated successfully'
#         })


# # ==================== USER STATS VIEWS ====================
# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# @cached_response(timeout=60, vary_by_user=True)
# def user_stats(request):
#     """
#     Get system-wide user statistics
#     """
#     try:
#         # Get cached stats if available
#         cache_key = 'user_stats_global'
#         cached_stats = cache.get(cache_key)
        
#         if cached_stats:
#             return Response(cached_stats)
        
#         # Calculate stats with optimized queries
#         total_stats = UserAccount.get_user_counts()
        
#         # Recent activity stats
#         one_day_ago = timezone.now() - timedelta(days=1)
#         seven_days_ago = timezone.now() - timedelta(days=7)
#         thirty_days_ago = timezone.now() - timedelta(days=30)
        
#         recent_stats = UserAccount.objects.aggregate(
#             last_24h=Count('id', filter=Q(date_joined__gte=one_day_ago)),
#             last_7d=Count('id', filter=Q(date_joined__gte=seven_days_ago)),
#             last_30d=Count('id', filter=Q(date_joined__gte=thirty_days_ago)),
#             active_last_24h=Count('id', filter=Q(last_login__gte=one_day_ago, is_active=True)),
#         )
        
#         # PPPoE specific stats
#         pppoe_stats = UserAccount.objects.filter(
#             pppoe_username__isnull=False
#         ).aggregate(
#             total_pppoe=Count('id'),
#             active_pppoe=Count('id', filter=Q(pppoe_active=True)),
#             pppoe_admins=Count('id', filter=Q(user_type__in=['admin', 'superadmin'], pppoe_username__isnull=False)),
#         )
        
#         # Hotspot specific stats
#         hotspot_stats = UserAccount.objects.filter(
#             connection_type='hotspot',
#             user_type='client'
#         ).aggregate(
#             total_hotspot=Count('id'),
#             active_hotspot=Count('id', filter=Q(is_active=True)),
#         )
        
#         # Combine all stats
#         stats = {
#             'total_users': total_stats.get('total', 0),
#             'active_users': total_stats.get('active_users', 0),
#             'user_types': {
#                 'clients': total_stats.get('clients', 0),
#                 'admins': total_stats.get('admins', 0),
#                 'superadmins': total_stats.get('superadmins', 0),
#             },
#             'connection_types': {
#                 'hotspot': hotspot_stats.get('total_hotspot', 0),
#                 'pppoe': pppoe_stats.get('total_pppoe', 0),
#             },
#             'recent_activity': recent_stats,
#             'pppoe_stats': pppoe_stats,
#             'hotspot_stats': hotspot_stats,
#             'calculated_at': timezone.now().isoformat()
#         }
        
#         # Cache for 5 minutes
#         cache.set(cache_key, stats, 300)
        
#         return Response(stats)
        
#     except Exception as e:
#         logger.error(f"User stats error: {str(e)}")
#         return Response({
#             'error': 'Failed to load user statistics',
#             'details': str(e) if settings.DEBUG else None
#         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# # ==================== BULK OPERATIONS VIEW ====================
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def bulk_user_operation(request):
#     """
#     Perform bulk operations on users
#     Only accessible by admins
#     """
#     try:
#         # Check if user is admin
#         if not request.user.is_admin:
#             return Response({
#                 'error': 'Only admin users can perform bulk operations'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         serializer = BulkUserOperationSerializer(data=request.data)
#         if not serializer.is_valid():
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
#         user_ids = serializer.validated_data['user_ids']
#         operation = serializer.validated_data['operation']
        
#         if not user_ids:
#             return Response({
#                 'error': 'No users selected'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         success_count = 0
#         failed_users = []
        
#         # Perform operation
#         if operation in ['activate', 'deactivate']:
#             is_active = (operation == 'activate')
#             success_count = UserAccount.bulk_update_status(user_ids, is_active)
#             failed_count = len(user_ids) - success_count
            
#         elif operation == 'reset_pppoe':
#             for user_id in user_ids:
#                 try:
#                     user = UserAccount.get_user_by_uuid(user_id)
#                     if user and user.is_pppoe_user:
#                         user.reset_pppoe_credentials(send_sms=False)
#                         success_count += 1
#                     else:
#                         failed_users.append({
#                             'user_id': user_id,
#                             'error': 'User not found or not a PPPoE user'
#                         })
#                 except Exception as e:
#                     failed_users.append({
#                         'user_id': user_id,
#                         'error': str(e)
#                     })
#             failed_count = len(failed_users)
            
#         elif operation == 'send_credentials':
#             for user_id in user_ids:
#                 try:
#                     user = UserAccount.get_user_by_uuid(user_id)
#                     if user and user.is_pppoe_user:
#                         if user.send_pppoe_credentials_sms():
#                             success_count += 1
#                         else:
#                             failed_users.append({
#                                 'user_id': user_id,
#                                 'error': 'Failed to send SMS'
#                             })
#                     else:
#                         failed_users.append({
#                             'user_id': user_id,
#                             'error': 'User not found or not a PPPoE user'
#                         })
#                 except Exception as e:
#                     failed_users.append({
#                         'user_id': user_id,
#                         'error': str(e)
#                     })
#             failed_count = len(failed_users)
        
#         else:
#             return Response({
#                 'error': f'Invalid operation: {operation}'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         response_data = {
#             'operation': operation,
#             'total_users': len(user_ids),
#             'success_count': success_count,
#             'failed_count': failed_count,
#             'failed_users': failed_users if failed_users else None
#         }
        
#         logger.info(f"Bulk operation '{operation}' completed: {success_count}/{len(user_ids)} successful")
        
#         return Response(response_data)
        
#     except Exception as e:
#         logger.error(f"Bulk operation error: {str(e)}")
#         return Response({
#             'error': 'Failed to perform bulk operation',
#             'details': str(e) if settings.DEBUG else None
#         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# # ==================== USER TYPE CHECK VIEWS ====================
# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# @cached_response(timeout=60, vary_by_user=True)
# def check_user_type(request):
#     """
#     Check if current user has specific user type
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
# @cached_response(timeout=60, vary_by_user=True)
# def check_connection_type(request):
#     """
#     Check if current user has specific connection type
#     """
#     connection_type = request.GET.get('connection_type')
    
#     if not connection_type:
#         return Response({
#             'error': 'connection_type parameter is required'
#         }, status=status.HTTP_400_BAD_REQUEST)
    
#     has_type = request.user.connection_type == connection_type
    
#     return Response({
#         'has_type': has_type,
#         'connection_type': request.user.connection_type,
#         'requested_type': connection_type
#     })


# # ==================== UTILITY VIEWS ====================
# @api_view(['HEAD', 'GET'])
# @permission_classes([IsAuthenticated])
# def user_me_head_fix(request):
#     """
#     Fix for HEAD requests to user profile
#     """
#     if request.method == 'HEAD':
#         return Response(
#             status=status.HTTP_200_OK,
#             headers={
#                 'X-User-Id': str(request.user.id),
#                 'X-User-Type': request.user.user_type,
#                 'X-User-Name': request.user.username or '',
#                 'X-User-Email': request.user.email or ''
#             }
#         )
    
#     # GET request
#     serializer = UserMeSerializer(request.user)
#     return Response(serializer.data)


# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# @cached_response(timeout=300, vary_by_user=True)
# def user_profile_summary(request):
#     """
#     Get user profile summary with essential info
#     """
#     user = request.user
    
#     summary = {
#         'id': str(user.id),
#         'username': user.username,
#         'email': user.email,
#         'phone_number': user.phone_number,
#         'phone_number_display': user.get_phone_display(),
#         'user_type': user.user_type,
#         'connection_type': user.connection_type,
#         'is_active': user.is_active,
#         'date_joined': user.date_joined,
#         'last_login': user.last_login,
#         'has_pppoe': user.is_pppoe_user,
#         'auth_methods': user.get_auth_methods()
#     }
    
#     if user.is_pppoe_user:
#         summary['pppoe_username'] = user.pppoe_username
#         summary['pppoe_active'] = user.pppoe_active
    
#     return Response(summary)


# # ==================== CACHE UTILITIES ====================
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def clear_user_cache(request):
#     """
#     Clear cache for current user
#     Only accessible by the user themselves or admins
#     """
#     try:
#         user_id = request.data.get('user_id')
        
#         if user_id and request.user.is_admin:
#             # Admin clearing cache for another user
#             target_user_id = user_id
#         else:
#             # User clearing their own cache
#             target_user_id = str(request.user.id)
        
#         # Invalidate all cache entries for the user
#         patterns = [
#             f"user_display_{target_user_id}_*",
#             f"user_by_uuid_{target_user_id}",
#             f"user_by_email_*",
#             f"user_by_phone_*",
#             f"pppoe_pw_{target_user_id}",
#             f"rate_limit_*_{target_user_id}",
#         ]
        
#         keys_deleted = 0
#         for pattern in patterns:
#             keys = cache.keys(pattern)
#             if keys:
#                 cache.delete_many(keys)
#                 keys_deleted += len(keys)
        
#         logger.info(f"Cache cleared for user {target_user_id}: {keys_deleted} keys")
        
#         return Response({
#             'success': True,
#             'message': f'Cache cleared successfully',
#             'keys_deleted': keys_deleted,
#             'user_id': target_user_id
#         })
        
#     except Exception as e:
#         logger.error(f"Cache clear error: {str(e)}")
#         return Response({
#             'error': 'Failed to clear cache',
#             'details': str(e) if settings.DEBUG else None
#         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# # ==================== HEALTH CHECK VIEWS ====================
# @api_view(['GET'])
# @permission_classes([AllowAny])
# def health_check(request):
#     """
#     Health check endpoint for authentication service
#     """
#     try:
#         # Check database connectivity
#         db_status = UserAccount.objects.exists()
        
#         # Check cache connectivity
#         cache_status = cache.set('health_check', 'ok', 10)
        
#         # Check user counts
#         user_count = UserAccount.objects.count()
        
#         return Response({
#             'status': 'healthy',
#             'timestamp': timezone.now().isoformat(),
#             'services': {
#                 'database': 'connected' if db_status else 'disconnected',
#                 'cache': 'connected' if cache_status else 'disconnected'
#             },
#             'metrics': {
#                 'total_users': user_count,
#                 'active_users': UserAccount.objects.filter(is_active=True).count()
#             }
#         })
        
#     except Exception as e:
#         logger.error(f"Health check failed: {str(e)}")
#         return Response({
#             'status': 'unhealthy',
#             'timestamp': timezone.now().isoformat(),
#             'error': str(e)
#         }, status=status.HTTP_503_SERVICE_UNAVAILABLE)


# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def service_status(request):
#     """
#     Get authentication service status and metrics
#     """
#     try:
#         # Get cache metrics
#         cache_info = {
#             'keys': len(cache.keys('*')) if hasattr(cache, 'keys') else 'unknown',
#             'memory_used': cache.get('memory_usage', 'unknown')
#         }
        
#         # Get database metrics
#         db_metrics = {
#             'total_users': UserAccount.objects.count(),
#             'active_sessions': UserAccount.objects.filter(last_login__gte=timezone.now() - timedelta(hours=1)).count(),
#             'pppoe_users': UserAccount.objects.filter(pppoe_username__isnull=False).count(),
#             'hotspot_users': UserAccount.objects.filter(connection_type='hotspot').count(),
#         }
        
#         # Get rate limit info
#         rate_limit_keys = cache.keys('rate_limit_*') if hasattr(cache, 'keys') else []
        
#         return Response({
#             'status': 'operational',
#             'timestamp': timezone.now().isoformat(),
#             'cache': cache_info,
#             'database': db_metrics,
#             'rate_limits': {
#                 'active_limits': len(rate_limit_keys)
#             }
#         })
        
#     except Exception as e:
#         logger.error(f"Service status error: {str(e)}")
#         return Response({
#             'status': 'degraded',
#             'timestamp': timezone.now().isoformat(),
#             'error': str(e) if settings.DEBUG else None
#         }, status=status.HTTP_503_SERVICE_UNAVAILABLE)














"""
AUTHENTICATION APP - API Views
Handles only authentication-related endpoints
Clear separation of concerns - no SMS, no statistics, no health checks
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


# ==================== CLIENT CREATION VIEWS ====================
class HotspotClientCreateView(generics.CreateAPIView):
    """
    Create hotspot client (for UserManagement app)
    Hotspot clients only need phone number, username auto-generated
    No authentication required for client creation
    """
    serializer_class = HotspotClientCreateSerializer
    permission_classes = [IsAuthenticated]  # Only authenticated users can create clients
    
    @method_decorator(rate_limited(max_calls=50, period=60, scope="client_create"))
    def post(self, request, *args, **kwargs):
        """Create a new hotspot client"""
        try:
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
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Hotspot client creation error: {e}")
            return Response({
                'error': 'Failed to create hotspot client',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_400_BAD_REQUEST)


class PPPoEClientCreateView(generics.CreateAPIView):
    """
    Create PPPoE client (for UserManagement app)
    PPPoE clients need name + phone, credentials auto-generated
    Credentials returned for SMS sending by UserManagement app
    """
    serializer_class = PPPoEClientCreateSerializer
    permission_classes = [IsAuthenticated]  # Only authenticated users can create PPPoE clients
    
    @method_decorator(rate_limited(max_calls=30, period=60, scope="pppoe_create"))
    def post(self, request, *args, **kwargs):
        """Create a new PPPoE client with auto-generated credentials"""
        try:
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
                },
                'sms_data': credentials  # For UserManagement app to send SMS
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"PPPoE client creation error: {e}")
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
    Used by hotspot landing page
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
        
        # Check if client exists
        user = UserAccount.get_client_by_phone(normalized)
        exists = user is not None
        
        response_data = {
            'success': True,
            'exists': exists,
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


