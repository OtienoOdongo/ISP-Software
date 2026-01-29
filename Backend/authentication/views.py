



# """
# AUTHENTICATION APP - API Views
# Handles only authentication-related endpoints
# Clear separation of concerns:
# - Admin dashboard client creation (authenticated)
# - Captive portal registration (public)
# - PPPoE authentication for routers
# - Validation endpoints
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
#     PPPoECredentialUpdateSerializer,
#     AuthenticatedUserCreateSerializer
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


# # ==================== DEBUG VIEWS FOR SIGNAL TESTING ====================
# @api_view(['GET'])
# @permission_classes([AllowAny])
# def debug_signal_health(request):
#     """Debug endpoint to check signal system health"""
#     try:
#         if not SIGNALS_AVAILABLE:
#             return Response({
#                 'status': 'warning',
#                 'message': 'Signals module not available',
#                 'signals_available': False
#             })
        
#         health = health_check_signals()
#         return Response({
#             'status': 'ok',
#             'signals_available': True,
#             'health': health
#         })
#     except Exception as e:
#         logger.error(f"Signal health check error: {e}")
#         return Response({
#             'status': 'error',
#             'error': str(e),
#             'signals_available': SIGNALS_AVAILABLE
#         }, status=500)


# @api_view(['GET'])
# @permission_classes([AllowAny])
# def debug_signal_test(request):
#     """Debug endpoint to test signal connectivity"""
#     try:
#         if not SIGNALS_AVAILABLE:
#             return Response({
#                 'status': 'warning',
#                 'message': 'Signals module not available'
#             })
        
#         results = test_signal_connection()
#         return Response({
#             'status': 'ok',
#             'tests': results
#         })
#     except Exception as e:
#         logger.error(f"Signal test error: {e}")
#         return Response({
#             'status': 'error',
#             'error': str(e)
#         }, status=500)


# @api_view(['GET'])
# @permission_classes([AllowAny])
# def debug_signal_stats(request):
#     """Debug endpoint to get signal statistics"""
#     try:
#         if not SIGNALS_AVAILABLE:
#             return Response({
#                 'status': 'warning',
#                 'message': 'Signals module not available'
#             })
        
#         stats = SignalCacheManager.get_signal_stats()
#         return Response({
#             'status': 'ok',
#             'stats': stats
#         })
#     except Exception as e:
#         logger.error(f"Signal stats error: {e}")
#         return Response({
#             'status': 'error',
#             'error': str(e)
#         }, status=500)


# # ==================== DEBUG USER CREATION VIEW ====================
# @api_view(['POST'])
# @permission_classes([AllowAny])
# def debug_user_create(request):
#     """
#     Debug endpoint for user creation with detailed logging
#     Helps diagnose HTTP 400 errors
#     """
#     start_time = time.time()
    
#     logger.warning("=" * 60)
#     logger.warning("DEBUG USER CREATION REQUEST")
#     logger.warning("=" * 60)
    
#     # Log request details
#     logger.warning(f"Method: {request.method}")
#     logger.warning(f"Path: {request.path}")
#     logger.warning(f"Content-Type: {request.content_type}")
#     logger.warning(f"IP: {request.META.get('REMOTE_ADDR', 'unknown')}")
#     logger.warning(f"User-Agent: {request.META.get('HTTP_USER_AGENT', 'Unknown')}")
    
#     # Parse and log request body
#     try:
#         if request.content_type == 'application/json':
#             body = request.body.decode('utf-8')
#             logger.warning(f"Raw Body: {body}")
#             try:
#                 data = json.loads(body)
#                 # Hide passwords in logs
#                 safe_data = data.copy()
#                 if 'password' in safe_data:
#                     safe_data['password'] = '[REDACTED]'
#                 if 'confirm_password' in safe_data:
#                     safe_data['confirm_password'] = '[REDACTED]'
#                 logger.warning(f"Parsed Data: {json.dumps(safe_data, indent=2)}")
#             except json.JSONDecodeError as e:
#                 logger.warning(f"JSON Parse Error: {e}")
#                 data = {}
#         else:
#             logger.warning(f"POST Data: {dict(request.POST)}")
#             data = dict(request.POST)
#     except Exception as e:
#         logger.warning(f"Error parsing request: {e}")
#         data = {}
    
#     errors = []
    
#     # Check required fields
#     required_fields = ['username', 'email', 'password']
#     for field in required_fields:
#         if field not in data:
#             errors.append(f"{field} is required")
    
#     if errors:
#         logger.warning(f"Validation errors: {errors}")
#         return Response({
#             'success': False,
#             'errors': errors,
#             'received_data': {k: v for k, v in data.items() if k not in ['password', 'confirm_password']},
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         }, status=status.HTTP_400_BAD_REQUEST)
    
#     # Check if user exists
#     from django.contrib.auth import get_user_model
#     User = get_user_model()
    
#     if User.objects.filter(username=data['username']).exists():
#         errors.append('Username already exists')
    
#     if User.objects.filter(email=data['email']).exists():
#         errors.append('Email already exists')
    
#     if errors:
#         logger.warning(f"User exists errors: {errors}")
#         return Response({
#             'success': False,
#             'errors': errors,
#             'received_data': {k: v for k, v in data.items() if k not in ['password', 'confirm_password']},
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         }, status=status.HTTP_400_BAD_REQUEST)
    
#     # Try to create user
#     try:
#         user = User.objects.create_user(
#             username=data['username'],
#             email=data['email'],
#             password=data['password']
#         )
        
#         # Add extra fields if provided
#         extra_fields = ['phone_number', 'name', 'user_type', 'connection_type']
#         for field in extra_fields:
#             if field in data:
#                 setattr(user, field, data[field])
        
#         user.save()
        
#         logger.warning(f"✅ User created successfully: {user.username}")
#         logger.warning(f"User ID: {user.id}")
#         logger.warning(f"Email: {user.email}")
#         logger.warning(f"User Type: {user.user_type}")
        
#         # Test signal emission if available
#         if SIGNALS_AVAILABLE:
#             try:
#                 result = emit_client_account_creation(
#                     user_id=str(user.id),
#                     username=user.username,
#                     phone_number=getattr(user, 'phone_number', '+254700000000'),
#                     connection_type=getattr(user, 'connection_type', 'hotspot'),
#                     client_name=getattr(user, 'name', ''),
#                     created_by_admin=True
#                 )
#                 logger.warning(f"Signal emission result: {result['success']}")
#                 if not result['success']:
#                     logger.warning(f"Signal error: {result.get('error')}")
#             except Exception as e:
#                 logger.warning(f"Signal emission error: {e}")
        
#         return Response({
#             'success': True,
#             'user_id': user.id,
#             'username': user.username,
#             'email': user.email,
#             'message': 'User created successfully',
#             'signals_emitted': SIGNALS_AVAILABLE,
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         }, status=status.HTTP_201_CREATED)
        
#     except Exception as e:
#         logger.warning(f"❌ Error creating user: {str(e)}")
#         import traceback
#         logger.warning(f"Traceback: {traceback.format_exc()}")
        
#         return Response({
#             'success': False,
#             'errors': [str(e)],
#             'received_data': {k: v for k, v in data.items() if k not in ['password', 'confirm_password']},
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         }, status=status.HTTP_400_BAD_REQUEST)


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
#     GET endpoint to check if phone number exists
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


# @api_view(['GET'])
# @permission_classes([AllowAny])
# @rate_limited(max_calls=300, period=60, scope="check_email")
# def check_email(request):
#     """
#     GET endpoint to check if email exists
#     Used by dashboard for email validation
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
#             'message': 'Email found' if exists else 'Email not found',
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         })
        
#     except Exception as e:
#         logger.error(f"Email check error: {e}")
#         return Response({
#             'success': False,
#             'error': 'Failed to check email',
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


# # ==================== FIX FOR THE MAIN USER CREATION ENDPOINT ====================
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def create_user_debug(request):
#     """
#     Main user creation endpoint with detailed debugging
#     This is the endpoint that's returning HTTP 400
#     """
#     start_time = time.time()
    
#     # Log everything for debugging
#     logger.warning("=" * 60)
#     logger.warning("MAIN USER CREATION ENDPOINT CALLED")
#     logger.warning("=" * 60)
    
#     # Log request details
#     logger.warning(f"Request user: {request.user.username} ({request.user.user_type})")
#     logger.warning(f"Request method: {request.method}")
#     logger.warning(f"Request path: {request.path}")
#     logger.warning(f"Content-Type: {request.content_type}")
    
#     try:
#         # Parse request body
#         if request.content_type == 'application/json':
#             body = request.body.decode('utf-8')
#             logger.warning(f"Request body (raw): {body}")
#             try:
#                 data = json.loads(body)
#                 # Create safe copy for logging (without passwords)
#                 safe_data = data.copy()
#                 if 'password' in safe_data:
#                     safe_data['password'] = '[REDACTED]'
#                 logger.warning(f"Request body (parsed): {json.dumps(safe_data, indent=2)}")
#             except json.JSONDecodeError as e:
#                 logger.error(f"JSON decode error: {e}")
#                 return Response({
#                     'success': False,
#                     'error': 'Invalid JSON format',
#                     'details': str(e),
#                     'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#                 }, status=status.HTTP_400_BAD_REQUEST)
#         else:
#             logger.warning(f"Request POST data: {dict(request.POST)}")
#             data = dict(request.POST)
        
#         # Determine which serializer to use based on user type
#         if data.get('user_type') in ['admin', 'staff']:
#             logger.warning("Using AuthenticatedUserCreateSerializer")
#             serializer = AuthenticatedUserCreateSerializer(data=data)
#         elif data.get('connection_type') == 'pppoe':
#             logger.warning("Using PPPoEClientCreateSerializer")
#             serializer = PPPoEClientCreateSerializer(data=data)
#         else:
#             logger.warning("Using HotspotClientCreateSerializer")
#             serializer = HotspotClientCreateSerializer(data=data)
        
#         # Validate
#         if not serializer.is_valid():
#             logger.warning(f"Serializer validation failed: {serializer.errors}")
#             return Response({
#                 'success': False,
#                 'error': 'Validation failed',
#                 'details': serializer.errors,
#                 'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         # Save user
#         try:
#             user = serializer.save()
#             logger.warning(f"✅ User created successfully: {user.username} ({user.user_type})")
            
#             return Response({
#                 'success': True,
#                 'message': 'User created successfully',
#                 'user': {
#                     'id': str(user.id),
#                     'username': user.username,
#                     'email': getattr(user, 'email', None),
#                     'user_type': user.user_type,
#                     'connection_type': user.connection_type,
#                 },
#                 'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#             }, status=status.HTTP_201_CREATED)
            
#         except Exception as save_error:
#             logger.error(f"Error saving user: {save_error}", exc_info=True)
#             return Response({
#                 'success': False,
#                 'error': 'Failed to create user',
#                 'details': str(save_error) if settings.DEBUG else None,
#                 'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#             }, status=status.HTTP_400_BAD_REQUEST)
            
#     except Exception as e:
#         logger.error(f"Unexpected error in create_user: {e}", exc_info=True)
#         return Response({
#             'success': False,
#             'error': 'Internal server error',
#             'details': str(e) if settings.DEBUG else None,
#             'processing_time_ms': round((time.time() - start_time) * 1000, 2)
#         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)






"""
AUTHENTICATION APP - Enhanced API Views
Fixed Djoser compatibility and clear separation of concerns:
- Djoser endpoints for authenticated user registration/login
- Admin dashboard client creation (authenticated)
- Captive portal registration (public)
- PPPoE authentication for routers
- Validation endpoints
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
import time
import logging
import json

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
    DjoserUserSerializer
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
        # This is CRITICAL: Djoser registration is for authenticated users only
        exists = UserAccount.objects.filter(
            email__iexact=email,
            user_type__in=['staff', 'admin']  # Only check for authenticated users
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
        # Log request for debugging
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


# ==================== CLIENT LOOKUP VIEWS ====================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_client_by_phone(request):
    """
    Get client details by phone number
    Only accessible to authenticated users (for UserManagement app)
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
    """
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