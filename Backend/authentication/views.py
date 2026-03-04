


# """
# AUTHENTICATION APP - Enhanced API Views
# Fixed Djoser compatibility and clear separation of concerns:
# - Djoser endpoints for authenticated user registration/login
# - Admin dashboard client creation (authenticated)
# - Captive portal registration (public)
# - PPPoE authentication for routers
# - Validation endpoints
# """

# from rest_framework.decorators import api_view, permission_classes, action
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
# import json

# from authentication.models import UserAccount, PhoneValidation
# from authentication.serializers import (
#     HotspotClientCreateSerializer,
#     PPPoEClientCreateSerializer,
#     CaptivePortalRegistrationSerializer,
#     UserMeSerializer,
#     UserSerializer,
#     PPPoEAuthSerializer,
#     PhoneValidationSerializer,
#     UUIDValidationSerializer,
#     EmailValidationSerializer,
#     PPPoECredentialUpdateSerializer,
#     AuthenticatedUserCreateSerializer,
#     DjoserUserSerializer
# )

# # Import signals for testing and debugging
# try:
#     from authentication.signals import (
#         emit_client_account_creation,
#         emit_pppoe_credentials,
#         test_signal_connection,
#         health_check_signals,
#         SignalCacheManager
#     )
#     SIGNALS_AVAILABLE = True
# except ImportError:
#     SIGNALS_AVAILABLE = False
#     logger = logging.getLogger(__name__)
#     logger.warning("Authentication signals not available")

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


# # ==================== EMAIL VALIDATION ENDPOINTS ====================
# @api_view(['POST'])
# @permission_classes([AllowAny])
# @rate_limited(max_calls=200, period=60, scope="email_validation")
# def validate_email(request):
#     """
#     Validate email format and check existence
#     Specifically for authenticated user registration (Djoser)
#     """
#     start_time = time.time()
    
#     try:
#         serializer = EmailValidationSerializer(data=request.data)
        
#         if not serializer.is_valid():
#             return Response({
#                 'success': False,
#                 'error': 'Invalid email',
#                 'details': serializer.errors,
#                 'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         return Response({
#             'success': True,
#             'data': serializer.data,
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         })
        
#     except Exception as e:
#         logger.error(f"Email validation error: {e}")
#         return Response({
#             'success': False,
#             'error': 'Email validation failed',
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         }, status=status.HTTP_400_BAD_REQUEST)


# @api_view(['GET'])
# @permission_classes([AllowAny])
# @rate_limited(max_calls=300, period=60, scope="check_email")
# def check_email(request):
#     """
#     GET endpoint to check if email exists for authenticated users
#     Used by signup form for Djoser registration
#     """
#     start_time = time.time()
#     email = request.GET.get('email')
    
#     if not email:
#         return Response({
#             'success': False,
#             'error': 'Email parameter is required',
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         }, status=status.HTTP_400_BAD_REQUEST)
    
#     try:
#         from authentication.serializers import ValidationAlgorithms
        
#         if not ValidationAlgorithms.is_valid_email(email):
#             return Response({
#                 'success': False,
#                 'exists': False,
#                 'is_valid': False,
#                 'message': 'Invalid email format',
#                 'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#             })
        
#         # Check existence for authenticated users (staff/admin) only
#         # This is CRITICAL: Djoser registration is for authenticated users only
#         exists = UserAccount.objects.filter(
#             email__iexact=email,
#             user_type__in=['staff', 'admin']  # Only check for authenticated users
#         ).exists()
        
#         return Response({
#             'success': True,
#             'exists': exists,
#             'is_valid': True,
#             'email': email,
#             'message': 'Email found' if exists else 'Email available for registration',
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         })
        
#     except Exception as e:
#         logger.error(f"Email check error: {e}")
#         return Response({
#             'success': False,
#             'error': 'Failed to check email',
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# # ==================== CAPTIVE PORTAL VIEWS ====================
# @api_view(['POST'])
# @permission_classes([AllowAny])
# @rate_limited(max_calls=50, period=60, scope="captive_registration")
# def captive_portal_register(request):
#     """
#     Captive portal registration endpoint (PUBLIC)
#     Called when user enters phone on hotspot landing page
#     """
#     start_time = time.time()
    
#     try:
#         # Log request for debugging
#         logger.info(f"Captive portal registration attempt from {request.META.get('REMOTE_ADDR')}")
        
#         serializer = CaptivePortalRegistrationSerializer(
#             data=request.data,
#             context={'request': request}
#         )
        
#         if not serializer.is_valid():
#             logger.warning(f"Captive portal validation failed: {serializer.errors}")
#             return Response({
#                 'success': False,
#                 'error': 'Invalid phone number',
#                 'details': serializer.errors,
#                 'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         # Get or create user
#         user = serializer.save()
#         created = serializer.context.get('user_created', False)
        
#         response_data = {
#             'success': True,
#             'message': 'User registered successfully' if created else 'User already exists',
#             'user_created': created,
#             'client': {
#                 'id': str(user.id),
#                 'username': user.username,
#                 'phone_number': user.phone_number,
#                 'phone_number_display': user.get_phone_display(),
#                 'connection_type': user.connection_type,
#                 'source': user.source,
#             },
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         }
        
#         logger.info(f"Captive portal registration: {user.username}, created={created}")
        
#         return Response(response_data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        
#     except Exception as e:
#         logger.error(f"Captive portal registration error: {e}", exc_info=True)
#         return Response({
#             'success': False,
#             'error': 'Registration failed. Please try again.',
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         }, status=status.HTTP_400_BAD_REQUEST)


# # ==================== ADMIN CLIENT CREATION VIEWS ====================
# class HotspotClientCreateView(generics.CreateAPIView):
#     """
#     Create hotspot client via admin dashboard
#     Only accessible to authenticated users (admin/staff)
#     """
#     serializer_class = HotspotClientCreateSerializer
#     permission_classes = [IsAuthenticated]
    
#     @method_decorator(rate_limited(max_calls=30, period=60, scope="admin_client_create"))
#     def post(self, request, *args, **kwargs):
#         """Create a new hotspot client via admin dashboard"""
#         start_time = time.time()
        
#         try:
#             # Only admin/staff can create clients via dashboard
#             if request.user.user_type not in ['admin', 'staff']:
#                 logger.warning(f"Unauthorized hotspot client creation attempt by {request.user.username}")
#                 return Response({
#                     'error': 'Only admin or staff can create clients',
#                     'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#                 }, status=status.HTTP_403_FORBIDDEN)
            
#             logger.info(f"Hotspot client creation attempt by {request.user.username}")
            
#             serializer = self.get_serializer(data=request.data)
            
#             if not serializer.is_valid():
#                 logger.warning(f"Hotspot client validation failed: {serializer.errors}")
#                 return Response({
#                     'error': 'Validation failed',
#                     'details': serializer.errors,
#                     'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             user = serializer.save()
            
#             logger.info(f"Hotspot client created: {user.username} by {request.user.username}")
            
#             return Response({
#                 'success': True,
#                 'message': 'Hotspot client created successfully',
#                 'client': {
#                     'id': str(user.id),
#                     'username': user.username,
#                     'phone_number': user.phone_number,
#                     'phone_number_display': user.get_phone_display(),
#                     'source': user.source,
#                 },
#                 'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#             }, status=status.HTTP_201_CREATED)
            
#         except Exception as e:
#             logger.error(f"Admin hotspot client creation error: {e}", exc_info=True)
#             return Response({
#                 'error': 'Failed to create hotspot client',
#                 'details': str(e) if settings.DEBUG else None,
#                 'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#             }, status=status.HTTP_400_BAD_REQUEST)


# class PPPoEClientCreateView(generics.CreateAPIView):
#     """
#     Create PPPoE client via admin dashboard
#     Only accessible to authenticated users (admin/staff)
#     """
#     serializer_class = PPPoEClientCreateSerializer
#     permission_classes = [IsAuthenticated]
    
#     @method_decorator(rate_limited(max_calls=20, period=60, scope="admin_pppoe_create"))
#     def post(self, request, *args, **kwargs):
#         """Create a new PPPoE client with auto-generated credentials via admin dashboard"""
#         start_time = time.time()
        
#         try:
#             # Only admin/staff can create PPPoE clients via dashboard
#             if request.user.user_type not in ['admin', 'staff']:
#                 logger.warning(f"Unauthorized PPPoE client creation attempt by {request.user.username}")
#                 return Response({
#                     'error': 'Only admin or staff can create PPPoE clients',
#                     'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#                 }, status=status.HTTP_403_FORBIDDEN)
            
#             logger.info(f"PPPoE client creation attempt by {request.user.username}")
            
#             serializer = self.get_serializer(data=request.data)
            
#             if not serializer.is_valid():
#                 logger.warning(f"PPPoE client validation failed: {serializer.errors}")
#                 return Response({
#                     'error': 'Validation failed',
#                     'details': serializer.errors,
#                     'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             user = serializer.save()
            
#             # Get credentials from context (set by serializer)
#             credentials = serializer.context.get('pppoe_credentials', {})
            
#             logger.info(f"PPPoE client created: {user.username} with PPPoE username: {user.pppoe_username}")
            
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
#                     'source': user.source,
#                 },
#                 'sms_data': credentials,  # For UserManagement app to send SMS
#                 'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#             }, status=status.HTTP_201_CREATED)
            
#         except Exception as e:
#             logger.error(f"Admin PPPoE client creation error: {e}", exc_info=True)
#             return Response({
#                 'error': 'Failed to create PPPoE client',
#                 'details': str(e) if settings.DEBUG else None,
#                 'processing_time_ms': round((time.time() - start_time) * 1000, 2)
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
#         logger.debug(f"PPPoE auth attempt from {request.META.get('REMOTE_ADDR')}")
        
#         serializer = PPPoEAuthSerializer(data=request.data)
        
#         if not serializer.is_valid():
#             logger.warning(f"Invalid PPPoE auth request from {request.META.get('REMOTE_ADDR')}: {serializer.errors}")
#             return Response({
#                 'authenticated': False,
#                 'message': 'Invalid credentials',
#                 'processing_time_ms': round((time.time() - start_time) * 1000, 2)
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
#         logger.error(f"PPPoE authentication error: {e}", exc_info=True)
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
#     start_time = time.time()
    
#     try:
#         serializer = PhoneValidationSerializer(data=request.data)
        
#         if not serializer.is_valid():
#             return Response({
#                 'success': False,
#                 'error': 'Invalid phone number',
#                 'details': serializer.errors,
#                 'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         return Response({
#             'success': True,
#             'data': serializer.data,
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         })
        
#     except Exception as e:
#         logger.error(f"Phone validation error: {e}")
#         return Response({
#             'success': False,
#             'error': 'Phone validation failed',
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         }, status=status.HTTP_400_BAD_REQUEST)


# @api_view(['POST'])
# @permission_classes([AllowAny])
# @rate_limited(max_calls=200, period=60, scope="uuid_validation")
# def validate_uuid(request):
#     """
#     Validate UUID and check if user exists
#     """
#     start_time = time.time()
    
#     try:
#         serializer = UUIDValidationSerializer(data=request.data)
        
#         if not serializer.is_valid():
#             return Response({
#                 'success': False,
#                 'error': 'Invalid UUID',
#                 'details': serializer.errors,
#                 'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         return Response({
#             'success': True,
#             'data': serializer.data,
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         })
        
#     except Exception as e:
#         logger.error(f"UUID validation error: {e}")
#         return Response({
#             'success': False,
#             'error': 'UUID validation failed',
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         }, status=status.HTTP_400_BAD_REQUEST)


# @api_view(['GET'])
# @permission_classes([AllowAny])
# @rate_limited(max_calls=300, period=60, scope="check_phone")
# def check_phone(request):
#     """
#     GET endpoint to check if phone number exists for clients
#     Used by hotspot landing page and admin dashboard
#     """
#     start_time = time.time()
#     phone = request.GET.get('phone')
    
#     if not phone:
#         return Response({
#             'success': False,
#             'error': 'Phone parameter is required',
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         }, status=status.HTTP_400_BAD_REQUEST)
    
#     try:
#         normalized = PhoneValidation.normalize_kenyan_phone(phone)
        
#         if not PhoneValidation.is_valid_kenyan_phone(normalized):
#             return Response({
#                 'success': False,
#                 'exists': False,
#                 'is_valid': False,
#                 'message': 'Invalid phone number format',
#                 'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#             })
        
#         # Check if client exists (active or inactive)
#         user = UserAccount.get_client_by_phone(normalized, active_only=False)
#         exists = user is not None
#         is_active = exists and user.is_active
        
#         response_data = {
#             'success': True,
#             'exists': exists,
#             'is_active': is_active,
#             'is_valid': True,
#             'phone_number': normalized,
#             'phone_number_display': PhoneValidation.get_phone_display(phone),
#             'message': 'Client found' if exists else 'Client not found',
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         }
        
#         if exists:
#             response_data['client'] = {
#                 'id': str(user.id),
#                 'username': user.username,
#                 'connection_type': user.connection_type,
#                 'is_pppoe_client': user.is_pppoe_client,
#                 'is_hotspot_client': user.is_hotspot_client,
#                 'source': user.source,
#                 'is_active': user.is_active,
#             }
        
#         return Response(response_data)
        
#     except Exception as e:
#         logger.error(f"Phone check error: {e}")
#         return Response({
#             'success': False,
#             'error': 'Failed to check phone number',
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# @api_view(['GET'])
# @permission_classes([AllowAny])
# @rate_limited(max_calls=300, period=60, scope="check_uuid")
# def check_uuid(request):
#     """
#     GET endpoint to check if UUID exists
#     """
#     start_time = time.time()
#     user_uuid = request.GET.get('uuid')
    
#     if not user_uuid:
#         return Response({
#             'success': False,
#             'error': 'UUID parameter is required',
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
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
#             'user': user_data,
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         })
        
#     except ValueError:
#         return Response({
#             'success': False,
#             'exists': False,
#             'is_valid': False,
#             'message': 'Invalid UUID format',
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         })
#     except Exception as e:
#         logger.error(f"UUID check error: {e}")
#         return Response({
#             'success': False,
#             'error': 'Failed to check UUID',
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
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
#         start_time = time.time()
        
#         user = self.get_object()
#         serializer = self.get_serializer(user)
        
#         data = serializer.data
#         data['processing_time_ms'] = round((time.time() - start_time) * 1000, 2)
        
#         return Response(data)


# # ==================== PPPOE CLIENT SELF-SERVICE VIEWS ====================
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# @rate_limited(max_calls=20, period=60, scope="pppoe_update")
# def pppoe_update_credentials(request):
#     """
#     PPPoE client self-service credential update
#     Only accessible to PPPoE clients after login
#     """
#     start_time = time.time()
    
#     try:
#         user = request.user
        
#         # Only PPPoE clients can update their credentials
#         if not user.is_pppoe_client:
#             logger.warning(f"Non-PPPoE user attempted credential update: {user.username}")
#             return Response({
#                 'error': 'Only PPPoE clients can update credentials',
#                 'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         serializer = PPPoECredentialUpdateSerializer(data=request.data)
        
#         if not serializer.is_valid():
#             logger.warning(f"PPPoE credential update validation failed: {serializer.errors}")
#             return Response({
#                 'error': 'Validation failed',
#                 'details': serializer.errors,
#                 'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         # Update credentials
#         updates = user.update_pppoe_credentials(
#             username=serializer.validated_data.get('username'),
#             password=serializer.validated_data.get('password')
#         )
        
#         logger.info(f"PPPoE credentials updated by client: {user.username}")
        
#         return Response({
#             'success': True,
#             'message': 'PPPoE credentials updated successfully',
#             'updates': updates['updates'],
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         })
        
#     except Exception as e:
#         logger.error(f"PPPoE credential update error: {e}")
#         return Response({
#             'error': str(e),
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         }, status=status.HTTP_400_BAD_REQUEST)


# # ==================== USER TYPE CHECK VIEWS ====================
# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def check_user_type(request):
#     """
#     Check if current user has specific user type
#     Used by frontend for conditional rendering
#     """
#     start_time = time.time()
#     user_type = request.GET.get('user_type')
    
#     if not user_type:
#         return Response({
#             'error': 'user_type parameter is required',
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         }, status=status.HTTP_400_BAD_REQUEST)
    
#     has_type = request.user.user_type == user_type
    
#     return Response({
#         'has_type': has_type,
#         'user_type': request.user.user_type,
#         'requested_type': user_type,
#         'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#     })


# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def check_connection_type(request):
#     """
#     Check if current user has specific connection type
#     Used by client landing pages
#     """
#     start_time = time.time()
#     connection_type = request.GET.get('connection_type')
    
#     if not connection_type:
#         return Response({
#             'error': 'connection_type parameter is required',
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         }, status=status.HTTP_400_BAD_REQUEST)
    
#     # For authenticated users, connection_type is always 'admin'
#     if request.user.is_authenticated_user:
#         has_type = (connection_type == 'admin')
#     else:
#         has_type = request.user.connection_type == connection_type
    
#     return Response({
#         'has_type': has_type,
#         'connection_type': request.user.connection_type,
#         'requested_type': connection_type,
#         'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#     })


# # ==================== CLIENT LOOKUP VIEWS ====================
# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_client_by_phone(request):
#     """
#     Get client details by phone number
#     Only accessible to authenticated users (for UserManagement app)
#     """
#     start_time = time.time()
#     phone = request.GET.get('phone')
    
#     if not phone:
#         return Response({
#             'error': 'Phone parameter is required',
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         }, status=status.HTTP_400_BAD_REQUEST)
    
#     try:
#         user = UserAccount.get_client_by_phone(phone)
        
#         if not user:
#             return Response({
#                 'success': False,
#                 'message': 'Client not found',
#                 'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#             }, status=status.HTTP_404_NOT_FOUND)
        
#         return Response({
#             'success': True,
#             'client': user.to_dict(),
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         })
        
#     except Exception as e:
#         logger.error(f"Client lookup error: {e}")
#         return Response({
#             'error': 'Failed to lookup client',
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# # ==================== AUTHENTICATED USER CREATION ====================
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def create_authenticated_user(request):
#     """
#     Create new authenticated user (staff/admin)
#     Only accessible to existing authenticated users with proper permissions
#     """
#     start_time = time.time()
    
#     try:
#         # Only admins can create new authenticated users
#         if request.user.user_type != 'admin':
#             logger.warning(f"Non-admin user attempted to create authenticated user: {request.user.username}")
#             return Response({
#                 'error': 'Only admin users can create new authenticated users',
#                 'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         logger.info(f"Authenticated user creation attempt by admin {request.user.username}")
        
#         serializer = AuthenticatedUserCreateSerializer(data=request.data)
        
#         if not serializer.is_valid():
#             logger.warning(f"Authenticated user validation failed: {serializer.errors}")
#             return Response({
#                 'error': 'Validation failed',
#                 'details': serializer.errors,
#                 'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#             }, status=status.HTTP_400_BAD_REQUEST)
        
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
#             },
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         }, status=status.HTTP_201_CREATED)
        
#     except Exception as e:
#         logger.error(f"Authenticated user creation error: {e}", exc_info=True)
#         return Response({
#             'error': 'Failed to create authenticated user',
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         }, status=status.HTTP_400_BAD_REQUEST)


# # ==================== BULK OPERATIONS ====================
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def bulk_check_phones(request):
#     """
#     Bulk check multiple phone numbers
#     Useful for admin dashboard operations
#     """
#     start_time = time.time()
    
#     try:
#         # Only admin/staff can use bulk operations
#         if request.user.user_type not in ['admin', 'staff']:
#             logger.warning(f"Non-admin/staff attempted bulk operation: {request.user.username}")
#             return Response({
#                 'error': 'Only admin or staff can use bulk operations',
#                 'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         phones = request.data.get('phones', [])
        
#         if not phones or not isinstance(phones, list):
#             return Response({
#                 'error': 'Phones must be a list of phone numbers',
#                 'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         logger.info(f"Bulk phone check requested by {request.user.username}: {len(phones)} phones")
        
#         results = []
#         for phone in phones[:100]:  # Limit to 100 phones per request
#             try:
#                 normalized = PhoneValidation.normalize_kenyan_phone(str(phone))
#                 is_valid = PhoneValidation.is_valid_kenyan_phone(normalized)
                
#                 user = None
#                 exists = False
#                 is_active = False
                
#                 if is_valid:
#                     user = UserAccount.get_client_by_phone(normalized, active_only=False)
#                     exists = user is not None
#                     is_active = exists and user.is_active
                
#                 results.append({
#                     'phone': phone,
#                     'normalized': normalized,
#                     'is_valid': is_valid,
#                     'exists': exists,
#                     'is_active': is_active,
#                     'user_id': str(user.id) if user else None,
#                     'username': user.username if user else None,
#                     'connection_type': user.connection_type if user else None,
#                 })
                
#             except Exception as e:
#                 results.append({
#                     'phone': phone,
#                     'error': str(e),
#                     'is_valid': False,
#                     'exists': False,
#                 })
        
#         return Response({
#             'success': True,
#             'count': len(results),
#             'results': results,
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         })
        
#     except Exception as e:
#         logger.error(f"Bulk phone check error: {e}", exc_info=True)
#         return Response({
#             'error': 'Failed to process bulk request',
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




# @api_view(['POST'])
# @permission_classes([AllowAny])
# def debug_signup(request):
#     """
#     Debug endpoint to see what's happening with signup
#     """
#     import json
#     logger.warning("=" * 60)
#     logger.warning("DEBUG SIGNUP REQUEST")
#     logger.warning("=" * 60)
#     logger.warning(f"Request data: {json.dumps(request.data, indent=2)}")
    
#     try:
#         # Try to use Djoser's actual view
#         from djoser.views import UserViewSet
#         viewset = UserViewSet()
#         viewset.request = request
#         viewset.format_kwarg = None
        
#         # Create serializer
#         from djoser.serializers import UserCreateSerializer
#         serializer = UserCreateSerializer(data=request.data)
        
#         if serializer.is_valid():
#             logger.warning("✅ Djoser serializer is valid")
#             user = serializer.save()
#             logger.warning(f"✅ User created: {user.email}")
#             return Response({
#                 'success': True,
#                 'message': 'User created via debug endpoint',
#                 'user_id': str(user.id)
#             })
#         else:
#             logger.warning(f"❌ Djoser serializer errors: {serializer.errors}")
#             return Response({
#                 'success': False,
#                 'errors': serializer.errors
#             }, status=400)
            
#     except Exception as e:
#         logger.error(f"❌ Debug signup error: {str(e)}", exc_info=True)
#         return Response({
#             'success': False,
#             'error': str(e)
#         }, status=500)








"""
AUTHENTICATION APP - Enhanced API Views
UPDATED: Added client search and creation endpoints for hotspot portal
UPDATED: Improved error handling and response consistency
UPDATED: Added proper permission classes for client endpoints
FIXED: Replaced 'created_at' with 'date_joined' in client responses
"""

from rest_framework.decorators import api_view, permission_classes, action
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
from django.db import transaction
from django.db.models import Q
import time
import logging
import json
import uuid

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
    EmailValidationSerializer,
    PPPoECredentialUpdateSerializer,
    AuthenticatedUserCreateSerializer,
    DjoserUserSerializer,
    ClientSearchSerializer,
    ClientCreateSerializer,
    ClientResponseSerializer
)

# Import signals for testing and debugging
try:
    from authentication.signals import (
        emit_client_account_creation,
        emit_pppoe_credentials,
        test_signal_connection,
        health_check_signals,
        SignalCacheManager
    )
    SIGNALS_AVAILABLE = True
except ImportError:
    SIGNALS_AVAILABLE = False
    logger = logging.getLogger(__name__)
    logger.warning("Authentication signals not available")

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


# ==================== EMAIL VALIDATION ENDPOINTS ====================
@api_view(['POST'])
@permission_classes([AllowAny])
@rate_limited(max_calls=200, period=60, scope="email_validation")
def validate_email(request):
    """
    Validate email format and check existence
    Specifically for authenticated user registration (Djoser)
    """
    start_time = time.time()
    
    try:
        serializer = EmailValidationSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'error': 'Invalid email',
                'details': serializer.errors,
                'processing_time_ms': round((time.time() - start_time) * 1000, 2)
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        })
        
    except Exception as e:
        logger.error(f"Email validation error: {e}")
        return Response({
            'success': False,
            'error': 'Email validation failed',
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
@rate_limited(max_calls=300, period=60, scope="check_email")
def check_email(request):
    """
    GET endpoint to check if email exists for authenticated users
    Used by signup form for Djoser registration
    """
    start_time = time.time()
    email = request.GET.get('email')
    
    if not email:
        return Response({
            'success': False,
            'error': 'Email parameter is required',
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        from authentication.serializers import ValidationAlgorithms
        
        if not ValidationAlgorithms.is_valid_email(email):
            return Response({
                'success': False,
                'exists': False,
                'is_valid': False,
                'message': 'Invalid email format',
                'processing_time_ms': round((time.time() - start_time) * 1000, 2)
            })
        
        # Check existence for authenticated users (staff/admin) only
        exists = UserAccount.objects.filter(
            email__iexact=email,
            user_type__in=['staff', 'admin']
        ).exists()
        
        return Response({
            'success': True,
            'exists': exists,
            'is_valid': True,
            'email': email,
            'message': 'Email found' if exists else 'Email available for registration',
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        })
        
    except Exception as e:
        logger.error(f"Email check error: {e}")
        return Response({
            'success': False,
            'error': 'Failed to check email',
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== CLIENT MANAGEMENT ENDPOINTS (NEW) ====================
# These endpoints are specifically for the hotspot portal to find/create clients

@api_view(['GET'])
@permission_classes([AllowAny])  # Public for hotspot portal
@rate_limited(max_calls=300, period=60, scope="client_search")
def client_search(request):
    """
    PUBLIC ENDPOINT - Search for client by phone number
    Used by hotspot portal to find existing clients
    """
    start_time = time.time()
    phone = request.GET.get('phone_number')
    
    if not phone:
        return Response({
            'success': False,
            'error': 'phone_number parameter is required',
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Validate and normalize phone
        if not PhoneValidation.is_valid_kenyan_phone(phone):
            return Response({
                'success': False,
                'error': 'Invalid phone number format',
                'is_valid': False,
                'processing_time_ms': round((time.time() - start_time) * 1000, 2)
            }, status=status.HTTP_400_BAD_REQUEST)
        
        normalized = PhoneValidation.normalize_kenyan_phone(phone)
        
        # Search for client (active or inactive)
        user = UserAccount.get_client_by_phone(normalized, active_only=False)
        
        if user:
            # Return client data - FIXED: changed created_at to date_joined
            return Response({
                'success': True,
                'found': True,
                'client': [{
                    'id': str(user.id),
                    'phone_number': user.phone_number,
                    'phone_number_display': user.get_phone_display(),
                    'username': user.username,
                    'connection_type': user.connection_type,
                    'is_active': user.is_active,
                    'source': user.source,
                    'date_joined': user.date_joined.isoformat() if user.date_joined else None,  # FIXED
                }],
                'processing_time_ms': round((time.time() - start_time) * 1000, 2)
            })
        else:
            # No client found
            return Response({
                'success': True,
                'found': False,
                'client': [],
                'message': 'No client found with this phone number',
                'processing_time_ms': round((time.time() - start_time) * 1000, 2)
            })
        
    except Exception as e:
        logger.error(f"Client search error: {e}", exc_info=True)
        return Response({
            'success': False,
            'error': 'Failed to search for client',
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])  # Public for hotspot portal
@rate_limited(max_calls=100, period=60, scope="client_create")
def client_create_hotspot(request):
    """
    PUBLIC ENDPOINT - Create a new hotspot client
    Used by hotspot portal when phone number not found
    """
    start_time = time.time()
    
    try:
        phone = request.data.get('phone_number')
        
        if not phone:
            return Response({
                'success': False,
                'error': 'phone_number is required',
                'processing_time_ms': round((time.time() - start_time) * 1000, 2)
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate phone
        if not PhoneValidation.is_valid_kenyan_phone(phone):
            return Response({
                'success': False,
                'error': 'Invalid phone number format',
                'processing_time_ms': round((time.time() - start_time) * 1000, 2)
            }, status=status.HTTP_400_BAD_REQUEST)
        
        normalized = PhoneValidation.normalize_kenyan_phone(phone)
        
        # Check if client already exists
        existing = UserAccount.get_client_by_phone(normalized, active_only=False)
        if existing:
            return Response({
                'success': True,
                'message': 'Client already exists',
                'client': {
                    'id': str(existing.id),
                    'phone_number': existing.phone_number,
                    'phone_number_display': existing.get_phone_display(),
                    'username': existing.username,
                    'connection_type': existing.connection_type,
                    'is_active': existing.is_active,
                    'source': existing.source,
                    'date_joined': existing.date_joined.isoformat() if existing.date_joined else None,  # FIXED
                },
                'created': False,
                'processing_time_ms': round((time.time() - start_time) * 1000, 2)
            })
        
        # Create new client using manager
        with transaction.atomic():
            user = UserAccount.objects.create_client_user(
                phone_number=normalized,
                connection_type='hotspot',
                source='captive_portal'
            )
        
        logger.info(f"New hotspot client created via portal: {user.username}")
        
        return Response({
            'success': True,
            'message': 'Client created successfully',
            'client': {
                'id': str(user.id),
                'phone_number': user.phone_number,
                'phone_number_display': user.get_phone_display(),
                'username': user.username,
                'connection_type': user.connection_type,
                'is_active': user.is_active,
                'source': user.source,
                'date_joined': user.date_joined.isoformat() if user.date_joined else None,  # FIXED
            },
            'created': True,
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Client creation error: {e}", exc_info=True)
        return Response({
            'success': False,
            'error': 'Failed to create client',
            'details': str(e) if settings.DEBUG else None,
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Protected for admin dashboard
@rate_limited(max_calls=200, period=60, scope="client_detail")
def client_detail(request, client_id):
    """
    PROTECTED ENDPOINT - Get detailed client information
    Used by admin dashboard for client management
    """
    start_time = time.time()
    
    try:
        # Only admin/staff can access
        if request.user.user_type not in ['admin', 'staff']:
            return Response({
                'success': False,
                'error': 'Permission denied',
                'processing_time_ms': round((time.time() - start_time) * 1000, 2)
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            user = UserAccount.objects.get(id=client_id, user_type='client')
        except UserAccount.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Client not found',
                'processing_time_ms': round((time.time() - start_time) * 1000, 2)
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Return comprehensive client data
        return Response({
            'success': True,
            'client': user.to_dict(include_sensitive=request.user.is_staff),
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        })
        
    except Exception as e:
        logger.error(f"Client detail error: {e}", exc_info=True)
        return Response({
            'success': False,
            'error': 'Failed to get client details',
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])  # Protected for admin dashboard
@rate_limited(max_calls=50, period=60, scope="client_bulk_lookup")
def client_bulk_lookup(request):
    """
    PROTECTED ENDPOINT - Bulk lookup multiple clients by phone numbers
    Used by admin dashboard for batch operations
    """
    start_time = time.time()
    
    try:
        # Only admin/staff can access
        if request.user.user_type not in ['admin', 'staff']:
            return Response({
                'success': False,
                'error': 'Permission denied',
                'processing_time_ms': round((time.time() - start_time) * 1000, 2)
            }, status=status.HTTP_403_FORBIDDEN)
        
        phones = request.data.get('phones', [])
        
        if not phones or not isinstance(phones, list):
            return Response({
                'success': False,
                'error': 'phones must be a list of phone numbers',
                'processing_time_ms': round((time.time() - start_time) * 1000, 2)
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Limit batch size
        if len(phones) > 100:
            phones = phones[:100]
        
        results = []
        for phone in phones:
            try:
                normalized = PhoneValidation.normalize_kenyan_phone(str(phone))
                is_valid = PhoneValidation.is_valid_kenyan_phone(normalized)
                
                user = None
                if is_valid:
                    user = UserAccount.get_client_by_phone(normalized, active_only=False)
                
                results.append({
                    'phone': phone,
                    'normalized': normalized if is_valid else None,
                    'is_valid': is_valid,
                    'exists': user is not None,
                    'client_id': str(user.id) if user else None,
                    'username': user.username if user else None,
                    'connection_type': user.connection_type if user else None,
                    'is_active': user.is_active if user else None,
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
            'results': results,
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        })
        
    except Exception as e:
        logger.error(f"Bulk lookup error: {e}", exc_info=True)
        return Response({
            'success': False,
            'error': 'Failed to process bulk lookup',
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== CAPTIVE PORTAL VIEWS ====================
@api_view(['POST'])
@permission_classes([AllowAny])
@rate_limited(max_calls=50, period=60, scope="captive_registration")
def captive_portal_register(request):
    """
    Captive portal registration endpoint (PUBLIC)
    Called when user enters phone on hotspot landing page
    """
    start_time = time.time()
    
    try:
        logger.info(f"Captive portal registration attempt from {request.META.get('REMOTE_ADDR')}")
        
        serializer = CaptivePortalRegistrationSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if not serializer.is_valid():
            logger.warning(f"Captive portal validation failed: {serializer.errors}")
            return Response({
                'success': False,
                'error': 'Invalid phone number',
                'details': serializer.errors,
                'processing_time_ms': round((time.time() - start_time) * 1000, 2)
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
                'date_joined': user.date_joined.isoformat() if user.date_joined else None,  # FIXED for consistency
            },
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        }
        
        logger.info(f"Captive portal registration: {user.username}, created={created}")
        
        return Response(response_data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Captive portal registration error: {e}", exc_info=True)
        return Response({
            'success': False,
            'error': 'Registration failed. Please try again.',
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
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
        start_time = time.time()
        
        try:
            # Only admin/staff can create clients via dashboard
            if request.user.user_type not in ['admin', 'staff']:
                logger.warning(f"Unauthorized hotspot client creation attempt by {request.user.username}")
                return Response({
                    'error': 'Only admin or staff can create clients',
                    'processing_time_ms': round((time.time() - start_time) * 1000, 2)
                }, status=status.HTTP_403_FORBIDDEN)
            
            logger.info(f"Hotspot client creation attempt by {request.user.username}")
            
            serializer = self.get_serializer(data=request.data)
            
            if not serializer.is_valid():
                logger.warning(f"Hotspot client validation failed: {serializer.errors}")
                return Response({
                    'error': 'Validation failed',
                    'details': serializer.errors,
                    'processing_time_ms': round((time.time() - start_time) * 1000, 2)
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user = serializer.save()
            
            logger.info(f"Hotspot client created: {user.username} by {request.user.username}")
            
            return Response({
                'success': True,
                'message': 'Hotspot client created successfully',
                'client': {
                    'id': str(user.id),
                    'username': user.username,
                    'phone_number': user.phone_number,
                    'phone_number_display': user.get_phone_display(),
                    'source': user.source,
                    'date_joined': user.date_joined.isoformat() if user.date_joined else None,  # FIXED for consistency
                },
                'processing_time_ms': round((time.time() - start_time) * 1000, 2)
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Admin hotspot client creation error: {e}", exc_info=True)
            return Response({
                'error': 'Failed to create hotspot client',
                'details': str(e) if settings.DEBUG else None,
                'processing_time_ms': round((time.time() - start_time) * 1000, 2)
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
        start_time = time.time()
        
        try:
            # Only admin/staff can create PPPoE clients via dashboard
            if request.user.user_type not in ['admin', 'staff']:
                logger.warning(f"Unauthorized PPPoE client creation attempt by {request.user.username}")
                return Response({
                    'error': 'Only admin or staff can create PPPoE clients',
                    'processing_time_ms': round((time.time() - start_time) * 1000, 2)
                }, status=status.HTTP_403_FORBIDDEN)
            
            logger.info(f"PPPoE client creation attempt by {request.user.username}")
            
            serializer = self.get_serializer(data=request.data)
            
            if not serializer.is_valid():
                logger.warning(f"PPPoE client validation failed: {serializer.errors}")
                return Response({
                    'error': 'Validation failed',
                    'details': serializer.errors,
                    'processing_time_ms': round((time.time() - start_time) * 1000, 2)
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user = serializer.save()
            
            # Get credentials from context (set by serializer)
            credentials = serializer.context.get('pppoe_credentials', {})
            
            logger.info(f"PPPoE client created: {user.username} with PPPoE username: {user.pppoe_username}")
            
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
                    'date_joined': user.date_joined.isoformat() if user.date_joined else None,  # FIXED for consistency
                },
                'sms_data': credentials,  # For UserManagement app to send SMS
                'processing_time_ms': round((time.time() - start_time) * 1000, 2)
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Admin PPPoE client creation error: {e}", exc_info=True)
            return Response({
                'error': 'Failed to create PPPoE client',
                'details': str(e) if settings.DEBUG else None,
                'processing_time_ms': round((time.time() - start_time) * 1000, 2)
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
        logger.debug(f"PPPoE auth attempt from {request.META.get('REMOTE_ADDR')}")
        
        serializer = PPPoEAuthSerializer(data=request.data)
        
        if not serializer.is_valid():
            logger.warning(f"Invalid PPPoE auth request from {request.META.get('REMOTE_ADDR')}: {serializer.errors}")
            return Response({
                'authenticated': False,
                'message': 'Invalid credentials',
                'processing_time_ms': round((time.time() - start_time) * 1000, 2)
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
        logger.error(f"PPPoE authentication error: {e}", exc_info=True)
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
    start_time = time.time()
    
    try:
        serializer = PhoneValidationSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'error': 'Invalid phone number',
                'details': serializer.errors,
                'processing_time_ms': round((time.time() - start_time) * 1000, 2)
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        })
        
    except Exception as e:
        logger.error(f"Phone validation error: {e}")
        return Response({
            'success': False,
            'error': 'Phone validation failed',
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
@rate_limited(max_calls=200, period=60, scope="uuid_validation")
def validate_uuid(request):
    """
    Validate UUID and check if user exists
    """
    start_time = time.time()
    
    try:
        serializer = UUIDValidationSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'error': 'Invalid UUID',
                'details': serializer.errors,
                'processing_time_ms': round((time.time() - start_time) * 1000, 2)
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        })
        
    except Exception as e:
        logger.error(f"UUID validation error: {e}")
        return Response({
            'success': False,
            'error': 'UUID validation failed',
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
@rate_limited(max_calls=300, period=60, scope="check_phone")
def check_phone(request):
    """
    GET endpoint to check if phone number exists for clients
    Used by hotspot landing page and admin dashboard
    """
    start_time = time.time()
    phone = request.GET.get('phone')
    
    if not phone:
        return Response({
            'success': False,
            'error': 'Phone parameter is required',
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        normalized = PhoneValidation.normalize_kenyan_phone(phone)
        
        if not PhoneValidation.is_valid_kenyan_phone(normalized):
            return Response({
                'success': False,
                'exists': False,
                'is_valid': False,
                'message': 'Invalid phone number format',
                'processing_time_ms': round((time.time() - start_time) * 1000, 2)
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
            'message': 'Client found' if exists else 'Client not found',
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
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
                'date_joined': user.date_joined.isoformat() if user.date_joined else None,  # FIXED for consistency
            }
        
        return Response(response_data)
        
    except Exception as e:
        logger.error(f"Phone check error: {e}")
        return Response({
            'success': False,
            'error': 'Failed to check phone number',
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
@rate_limited(max_calls=300, period=60, scope="check_uuid")
def check_uuid(request):
    """
    GET endpoint to check if UUID exists
    """
    start_time = time.time()
    user_uuid = request.GET.get('uuid')
    
    if not user_uuid:
        return Response({
            'success': False,
            'error': 'UUID parameter is required',
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
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
            'user': user_data,
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        })
        
    except ValueError:
        return Response({
            'success': False,
            'exists': False,
            'is_valid': False,
            'message': 'Invalid UUID format',
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        })
    except Exception as e:
        logger.error(f"UUID check error: {e}")
        return Response({
            'success': False,
            'error': 'Failed to check UUID',
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
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
        start_time = time.time()
        
        user = self.get_object()
        serializer = self.get_serializer(user)
        
        data = serializer.data
        data['processing_time_ms'] = round((time.time() - start_time) * 1000, 2)
        
        return Response(data)


# ==================== PPPOE CLIENT SELF-SERVICE VIEWS ====================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@rate_limited(max_calls=20, period=60, scope="pppoe_update")
def pppoe_update_credentials(request):
    """
    PPPoE client self-service credential update
    Only accessible to PPPoE clients after login
    """
    start_time = time.time()
    
    try:
        user = request.user
        
        # Only PPPoE clients can update their credentials
        if not user.is_pppoe_client:
            logger.warning(f"Non-PPPoE user attempted credential update: {user.username}")
            return Response({
                'error': 'Only PPPoE clients can update credentials',
                'processing_time_ms': round((time.time() - start_time) * 1000, 2)
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = PPPoECredentialUpdateSerializer(data=request.data)
        
        if not serializer.is_valid():
            logger.warning(f"PPPoE credential update validation failed: {serializer.errors}")
            return Response({
                'error': 'Validation failed',
                'details': serializer.errors,
                'processing_time_ms': round((time.time() - start_time) * 1000, 2)
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update credentials
        updates = user.update_pppoe_credentials(
            username=serializer.validated_data.get('username'),
            password=serializer.validated_data.get('password')
        )
        
        logger.info(f"PPPoE credentials updated by client: {user.username}")
        
        return Response({
            'success': True,
            'message': 'PPPoE credentials updated successfully',
            'updates': updates['updates'],
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        })
        
    except Exception as e:
        logger.error(f"PPPoE credential update error: {e}")
        return Response({
            'error': str(e),
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        }, status=status.HTTP_400_BAD_REQUEST)


# ==================== USER TYPE CHECK VIEWS ====================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_user_type(request):
    """
    Check if current user has specific user type
    Used by frontend for conditional rendering
    """
    start_time = time.time()
    user_type = request.GET.get('user_type')
    
    if not user_type:
        return Response({
            'error': 'user_type parameter is required',
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        }, status=status.HTTP_400_BAD_REQUEST)
    
    has_type = request.user.user_type == user_type
    
    return Response({
        'has_type': has_type,
        'user_type': request.user.user_type,
        'requested_type': user_type,
        'processing_time_ms': round((time.time() - start_time) * 1000, 2)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_connection_type(request):
    """
    Check if current user has specific connection type
    Used by client landing pages
    """
    start_time = time.time()
    connection_type = request.GET.get('connection_type')
    
    if not connection_type:
        return Response({
            'error': 'connection_type parameter is required',
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # For authenticated users, connection_type is always 'admin'
    if request.user.is_authenticated_user:
        has_type = (connection_type == 'admin')
    else:
        has_type = request.user.connection_type == connection_type
    
    return Response({
        'has_type': has_type,
        'connection_type': request.user.connection_type,
        'requested_type': connection_type,
        'processing_time_ms': round((time.time() - start_time) * 1000, 2)
    })


# ==================== CLIENT LOOKUP VIEWS (DEPRECATED - Use client_search instead) ====================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_client_by_phone(request):
    """
    DEPRECATED - Use client_search instead
    Get client details by phone number (authenticated only)
    """
    start_time = time.time()
    phone = request.GET.get('phone')
    
    if not phone:
        return Response({
            'error': 'Phone parameter is required',
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = UserAccount.get_client_by_phone(phone)
        
        if not user:
            return Response({
                'success': False,
                'message': 'Client not found',
                'processing_time_ms': round((time.time() - start_time) * 1000, 2)
            }, status=status.HTTP_404_NOT_FOUND)
        
        return Response({
            'success': True,
            'client': user.to_dict(),
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        })
        
    except Exception as e:
        logger.error(f"Client lookup error: {e}")
        return Response({
            'error': 'Failed to lookup client',
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== AUTHENTICATED USER CREATION ====================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_authenticated_user(request):
    """
    Create new authenticated user (staff/admin)
    Only accessible to existing authenticated users with proper permissions
    """
    start_time = time.time()
    
    try:
        # Only admins can create new authenticated users
        if request.user.user_type != 'admin':
            logger.warning(f"Non-admin user attempted to create authenticated user: {request.user.username}")
            return Response({
                'error': 'Only admin users can create new authenticated users',
                'processing_time_ms': round((time.time() - start_time) * 1000, 2)
            }, status=status.HTTP_403_FORBIDDEN)
        
        logger.info(f"Authenticated user creation attempt by admin {request.user.username}")
        
        serializer = AuthenticatedUserCreateSerializer(data=request.data)
        
        if not serializer.is_valid():
            logger.warning(f"Authenticated user validation failed: {serializer.errors}")
            return Response({
                'error': 'Validation failed',
                'details': serializer.errors,
                'processing_time_ms': round((time.time() - start_time) * 1000, 2)
            }, status=status.HTTP_400_BAD_REQUEST)
        
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
                'date_joined': user.date_joined.isoformat() if user.date_joined else None,  # FIXED for consistency
            },
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Authenticated user creation error: {e}", exc_info=True)
        return Response({
            'error': 'Failed to create authenticated user',
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        }, status=status.HTTP_400_BAD_REQUEST)


# ==================== BULK OPERATIONS ====================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_check_phones(request):
    """
    Bulk check multiple phone numbers
    Useful for admin dashboard operations
    """
    start_time = time.time()
    
    try:
        # Only admin/staff can use bulk operations
        if request.user.user_type not in ['admin', 'staff']:
            logger.warning(f"Non-admin/staff attempted bulk operation: {request.user.username}")
            return Response({
                'error': 'Only admin or staff can use bulk operations',
                'processing_time_ms': round((time.time() - start_time) * 1000, 2)
            }, status=status.HTTP_403_FORBIDDEN)
        
        phones = request.data.get('phones', [])
        
        if not phones or not isinstance(phones, list):
            return Response({
                'error': 'Phones must be a list of phone numbers',
                'processing_time_ms': round((time.time() - start_time) * 1000, 2)
            }, status=status.HTTP_400_BAD_REQUEST)
        
        logger.info(f"Bulk phone check requested by {request.user.username}: {len(phones)} phones")
        
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
                    'date_joined': user.date_joined.isoformat() if user and user.date_joined else None,  # FIXED for consistency
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
            'results': results,
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        })
        
    except Exception as e:
        logger.error(f"Bulk phone check error: {e}", exc_info=True)
        return Response({
            'error': 'Failed to process bulk request',
            'processing_time_ms': round((time.time() - start_time) * 1000, 2)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def debug_signup(request):
    """
    Debug endpoint to see what's happening with signup
    Only available in DEBUG mode
    """
    if not settings.DEBUG:
        return Response({
            'success': False,
            'error': 'Debug endpoint not available in production'
        }, status=status.HTTP_404_NOT_FOUND)
    
    import json
    logger.warning("=" * 60)
    logger.warning("DEBUG SIGNUP REQUEST")
    logger.warning("=" * 60)
    logger.warning(f"Request data: {json.dumps(request.data, indent=2)}")
    
    try:
        # Try to use Djoser's actual view
        from djoser.views import UserViewSet
        viewset = UserViewSet()
        viewset.request = request
        viewset.format_kwarg = None
        
        # Create serializer
        from djoser.serializers import UserCreateSerializer
        serializer = UserCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            logger.warning("✅ Djoser serializer is valid")
            user = serializer.save()
            logger.warning(f"✅ User created: {user.email}")
            return Response({
                'success': True,
                'message': 'User created via debug endpoint',
                'user_id': str(user.id)
            })
        else:
            logger.warning(f"❌ Djoser serializer errors: {serializer.errors}")
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=400)
            
    except Exception as e:
        logger.error(f"❌ Debug signup error: {str(e)}", exc_info=True)
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)