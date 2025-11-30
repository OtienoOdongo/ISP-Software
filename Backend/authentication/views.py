


# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import AllowAny, IsAuthenticated
# from rest_framework.response import Response
# from rest_framework import generics, status
# from rest_framework.viewsets import GenericViewSet
# from rest_framework.mixins import RetrieveModelMixin, UpdateModelMixin
# from django.utils.decorators import method_decorator
# from django.views.decorators.csrf import csrf_exempt
# from django.db.models import Q, Count
# from django.core.cache import cache
# from typing import Dict, Any, List
# import time
# from django.utils import timezone
# from functools import lru_cache
# import logging

# from .models import UserAccount
# from .serializers import (
#     HotspotClientCreateSerializer, PPPoEClientCreateSerializer, 
#     PPPoECredentialSerializer, UserMeSerializer
# )

# logger = logging.getLogger(__name__)


# def rate_limited(max_calls=100, period=60):
#     def decorator(view_func):
#         call_times = []
        
#         def wrapped_view(request, *args, **kwargs):
#             current_time = time.time()
#             call_times[:] = [t for t in call_times if current_time - t < period]
            
#             if len(call_times) >= max_calls:
#                 return Response(
#                     {'error': 'Rate limit exceeded'}, 
#                     status=status.HTTP_429_TOO_MANY_REQUESTS
#                 )
            
#             call_times.append(current_time)
#             return view_func(request, *args, **kwargs)
        
#         return wrapped_view
#     return decorator

# def cached_response(timeout=300):
#     def decorator(view_func):
#         def wrapped_view(request, *args, **kwargs):
#             cache_key = f"view_{view_func.__name__}_{request.get_full_path()}"
#             cached_response = cache.get(cache_key)
            
#             if cached_response:
#                 return Response(cached_response)
            
#             response = view_func(request, *args, **kwargs)
#             if response.status_code == 200:
#                 cache.set(cache_key, response.data, timeout)
            
#             return response
#         return wrapped_view
#     return decorator

# class HotspotClientCreateView(generics.CreateAPIView):
#     serializer_class = HotspotClientCreateSerializer
#     permission_classes = [AllowAny]
    
#     @method_decorator(csrf_exempt)
#     @method_decorator(rate_limited(max_calls=50, period=60))
#     def dispatch(self, *args, **kwargs):
#         return super().dispatch(*args, **kwargs)

# class PPPoEClientCreateView(generics.CreateAPIView):
#     serializer_class = PPPoEClientCreateSerializer
#     permission_classes = [AllowAny]
    
#     @method_decorator(csrf_exempt)
#     @method_decorator(rate_limited(max_calls=50, period=60))
#     def dispatch(self, *args, **kwargs):
#         return super().dispatch(*args, **kwargs)

# class PPPoECredentialView(GenericViewSet, RetrieveModelMixin, UpdateModelMixin):
#     serializer_class = PPPoECredentialSerializer
#     permission_classes = [IsAuthenticated]
    
#     def get_object(self):
#         return self.request.user
    
#     @cached_response(timeout=60)
#     def retrieve(self, request, *args, **kwargs):
#         if not request.user.is_pppoe_client:
#             return Response(
#                 {'error': 'User is not a PPPoE client'}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         instance = self.get_object()
#         serializer = self.get_serializer(instance)
#         return Response(serializer.data)
    
#     def update(self, request, *args, **kwargs):
#         if not request.user.is_pppoe_client:
#             return Response(
#                 {'error': 'User is not a PPPoE client'}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         instance = self.get_object()
        
#         # Only allow resetting credentials, not manual setting
#         if request.data.get('reset_credentials', False):
#             instance.reset_pppoe_credentials()
#             serializer = self.get_serializer(instance)
#             return Response(serializer.data)
#         else:
#             return Response(
#                 {'error': 'Only credential reset is allowed'}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )

# class UserMeViewSet(GenericViewSet, RetrieveModelMixin):
#     serializer_class = UserMeSerializer
#     permission_classes = [IsAuthenticated]
    
#     def get_object(self):
#         return self.request.user
    
#     @cached_response(timeout=60)
#     def retrieve(self, request, *args, **kwargs):
#         instance = self.get_object()
#         serializer = self.get_serializer(instance)
        
#         if request.method == 'HEAD':
#             return Response(headers=self.get_head_headers(serializer.data))
        
#         return Response(serializer.data)
    
#     def get_head_headers(self, data: Dict[str, Any]) -> Dict[str, str]:
#         import json
#         content = json.dumps(data)
#         return {
#             'Content-Type': 'application/json',
#             'Content-Length': str(len(content)),
#             'X-Cache-Timestamp': str(time.time()),
#         }

# @lru_cache(maxsize=1000)
# def _check_email_exists(email: str) -> bool:
#     return UserAccount.objects.filter(
#         Q(email=email) & Q(is_active=True)
#     ).exists()

# @lru_cache(maxsize=1000)
# def _check_phone_exists(phone: str) -> bool:
#     return UserAccount.objects.filter(
#         Q(phone_number=phone) & Q(is_active=True)
#     ).exists()

# @api_view(['GET'])
# @permission_classes([AllowAny])
# @rate_limited(max_calls=200, period=60)
# @cached_response(timeout=300)
# def check_email(request):
#     email = request.GET.get('email')
#     if not email:
#         return Response({'error': 'Email parameter is required'}, status=400)
    
#     exists = _check_email_exists(email)
#     return Response({'exists': exists})

# @api_view(['GET'])
# @permission_classes([AllowAny])
# @rate_limited(max_calls=200, period=60)
# @cached_response(timeout=300)
# def check_phone(request):
#     phone = request.GET.get('phone')
#     if not phone:
#         return Response({'error': 'Phone parameter is required'}, status=400)
    
#     exists = _check_phone_exists(phone)
#     return Response({'exists': exists})

# @api_view(['HEAD', 'GET'])
# @permission_classes([IsAuthenticated])
# def user_me_head_fix(request):
#     if request.method == 'HEAD':
#         return Response(
#             status=status.HTTP_200_OK,
#             headers={'X-User-Id': str(request.user.id)}
#         )
    
#     serializer = UserMeSerializer(request.user)
#     return Response(serializer.data)

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# @cached_response(timeout=60)
# def check_user_type(request):
#     user_type = request.GET.get('user_type')
#     if not user_type:
#         return Response({'error': 'user_type parameter is required'}, status=400)
    
#     has_type = request.user.user_type == user_type
#     return Response({'has_type': has_type})

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# @cached_response(timeout=60)
# def check_connection_type(request):
#     connection_type = request.GET.get('connection_type')
#     if not connection_type:
#         return Response({'error': 'connection_type parameter is required'}, status=400)
    
#     has_type = request.user.connection_type == connection_type
#     return Response({'has_type': has_type})

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def user_stats(request):
#     cache_key = 'user_stats_global'
#     cached_stats = cache.get(cache_key)
    
#     if cached_stats:
#         return Response(cached_stats)
    
#     stats = UserAccount.objects.aggregate(
#         total_users=Count('id'),
#         active_users=Count('id', filter=Q(is_active=True)),
#         admin_users=Count('id', filter=Q(user_type='admin')),
#         superadmin_users=Count('id', filter=Q(user_type='superadmin')),
#         client_users=Count('id', filter=Q(user_type='client')),
#         hotspot_clients=Count('id', filter=Q(user_type='client', connection_type='hotspot')),
#         pppoe_clients=Count('id', filter=Q(user_type='client', connection_type='pppoe')),
#     )
    
#     stats['recently_joined'] = UserAccount.objects.filter(
#         date_joined__gte=timezone.now() - timezone.timedelta(days=7)
#     ).count()
    
#     cache.set(cache_key, stats, 300)
#     return Response(stats)

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def bulk_user_operation(request):
#     user_ids = request.data.get('user_ids', [])
#     operation = request.data.get('operation')
    
#     if not user_ids or not operation:
#         return Response({'error': 'Missing parameters'}, status=400)
    
#     if operation == 'deactivate':
#         updated = UserAccount.objects.filter(
#             id__in=user_ids
#         ).update(is_active=False)
#     elif operation == 'activate':
#         updated = UserAccount.objects.filter(
#             id__in=user_ids
#         ).update(is_active=True)
#     elif operation == 'reset_pppoe':
#         updated = 0
#         for user in UserAccount.objects.filter(id__in=user_ids, connection_type='pppoe'):
#             user.reset_pppoe_credentials()
#             updated += 1
#     else:
#         return Response({'error': 'Invalid operation'}, status=400)
    
#     cache.delete_many([f'user_display_{uid}' for uid in user_ids])
#     cache.delete('user_stats_global')
    
#     return Response({'updated': updated})


# @api_view(['POST'])
# @permission_classes([AllowAny])
# @rate_limited(max_calls=50, period=60)
# def pppoe_authenticate(request):
#     """
#     Authenticate PPPoE users for router login
#     """
#     try:
#         username = request.data.get('username', '').strip()
#         password = request.data.get('password', '').strip()
        
#         logger.info(f"PPPoE authentication attempt for username: {username}")
        
#         if not username or not password:
#             return Response(
#                 {'error': 'Username and password are required'}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         # Find user by PPPoE username
#         try:
#             user = UserAccount.objects.get(
#                 pppoe_username=username,
#                 connection_type='pppoe',
#                 is_active=True
#             )
#         except UserAccount.DoesNotExist:
#             logger.warning(f"PPPoE user not found: {username}")
#             return Response(
#                 {'error': 'Invalid PPPoE credentials'}, 
#                 status=status.HTTP_401_UNAUTHORIZED
#             )
        
#         # Verify password
#         decrypted_password = user.get_pppoe_password_decrypted()
#         if decrypted_password and password == decrypted_password:
#             # Update last login and activate PPPoE
#             user.last_pppoe_login = timezone.now()
#             user.pppoe_active = True
#             user.save()
            
#             logger.info(f"PPPoE authentication successful for: {username}")
            
#             return Response({
#                 'authenticated': True,
#                 'message': 'PPPoE authentication successful',
#                 'client': {
#                     'id': user.id,
#                     'client_id': user.client_id,
#                     'phone_number': str(user.phone_number),
#                     'username': user.pppoe_username,
#                     'connection_type': user.connection_type,
#                 }
#             })
#         else:
#             logger.warning(f"PPPoE authentication failed for: {username}")
#             return Response(
#                 {'error': 'Invalid PPPoE credentials'}, 
#                 status=status.HTTP_401_UNAUTHORIZED
#             )
            
#     except Exception as e:
#         logger.error(f"PPPoE authentication error: {str(e)}", exc_info=True)
#         return Response(
#             {'error': 'Authentication service temporarily unavailable'}, 
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR
#         )










from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.viewsets import GenericViewSet
from rest_framework.mixins import RetrieveModelMixin, UpdateModelMixin
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q, Count
from django.core.cache import cache
from typing import Dict, Any, List
import time
from django.utils import timezone
from functools import lru_cache
import logging

from authentication.models import UserAccount
from authentication.serializers import (
    HotspotClientCreateSerializer, PPPoEClientCreateSerializer, 
    PPPoECredentialSerializer, UserMeSerializer, AdminPPPoESetupSerializer, 
    PPPoEAuthResponseSerializer  
)

logger = logging.getLogger(__name__)


def rate_limited(max_calls=100, period=60):
    def decorator(view_func):
        call_times = []
        
        def wrapped_view(request, *args, **kwargs):
            current_time = time.time()
            call_times[:] = [t for t in call_times if current_time - t < period]
            
            if len(call_times) >= max_calls:
                return Response(
                    {'error': 'Rate limit exceeded'}, 
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )
            
            call_times.append(current_time)
            return view_func(request, *args, **kwargs)
        
        return wrapped_view
    return decorator

def cached_response(timeout=300):
    def decorator(view_func):
        def wrapped_view(request, *args, **kwargs):
            cache_key = f"view_{view_func.__name__}_{request.get_full_path()}"
            cached_response = cache.get(cache_key)
            
            if cached_response:
                return Response(cached_response)
            
            response = view_func(request, *args, **kwargs)
            if response.status_code == 200:
                cache.set(cache_key, response.data, timeout)
            
            return response
        return wrapped_view
    return decorator

class HotspotClientCreateView(generics.CreateAPIView):
    serializer_class = HotspotClientCreateSerializer
    permission_classes = [AllowAny]
    
    @method_decorator(csrf_exempt)
    @method_decorator(rate_limited(max_calls=50, period=60))
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

class PPPoEClientCreateView(generics.CreateAPIView):
    serializer_class = PPPoEClientCreateSerializer
    permission_classes = [AllowAny]
    
    @method_decorator(csrf_exempt)
    @method_decorator(rate_limited(max_calls=50, period=60))
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

class PPPoECredentialView(GenericViewSet, RetrieveModelMixin, UpdateModelMixin):
    serializer_class = PPPoECredentialSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    @cached_response(timeout=60)
    def retrieve(self, request, *args, **kwargs):
        if not request.user.is_pppoe_client:
            return Response(
                {'error': 'User is not a PPPoE client'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        if not request.user.is_pppoe_client:
            return Response(
                {'error': 'User is not a PPPoE client'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        instance = self.get_object()
        
        # Only allow resetting credentials, not manual setting
        if request.data.get('reset_credentials', False):
            instance.reset_pppoe_credentials()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        else:
            return Response(
                {'error': 'Only credential reset is allowed'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class UserMeViewSet(GenericViewSet, RetrieveModelMixin):
    serializer_class = UserMeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    @cached_response(timeout=60)
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        if request.method == 'HEAD':
            return Response(headers=self.get_head_headers(serializer.data))
        
        return Response(serializer.data)
    
    def get_head_headers(self, data: Dict[str, Any]) -> Dict[str, str]:
        import json
        content = json.dumps(data)
        return {
            'Content-Type': 'application/json',
            'Content-Length': str(len(content)),
            'X-Cache-Timestamp': str(time.time()),
        }

@lru_cache(maxsize=1000)
def _check_email_exists(email: str) -> bool:
    return UserAccount.objects.filter(
        Q(email=email) & Q(is_active=True)
    ).exists()

@lru_cache(maxsize=1000)
def _check_phone_exists(phone: str) -> bool:
    return UserAccount.objects.filter(
        Q(phone_number=phone) & Q(is_active=True)
    ).exists()

@api_view(['GET'])
@permission_classes([AllowAny])
@rate_limited(max_calls=200, period=60)
@cached_response(timeout=300)
def check_email(request):
    email = request.GET.get('email')
    if not email:
        return Response({'error': 'Email parameter is required'}, status=400)
    
    exists = _check_email_exists(email)
    return Response({'exists': exists})

@api_view(['GET'])
@permission_classes([AllowAny])
@rate_limited(max_calls=200, period=60)
@cached_response(timeout=300)
def check_phone(request):
    phone = request.GET.get('phone')
    if not phone:
        return Response({'error': 'Phone parameter is required'}, status=400)
    
    exists = _check_phone_exists(phone)
    return Response({'exists': exists})

@api_view(['HEAD', 'GET'])
@permission_classes([IsAuthenticated])
def user_me_head_fix(request):
    if request.method == 'HEAD':
        return Response(
            status=status.HTTP_200_OK,
            headers={'X-User-Id': str(request.user.id)}
        )
    
    serializer = UserMeSerializer(request.user)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@cached_response(timeout=60)
def check_user_type(request):
    user_type = request.GET.get('user_type')
    if not user_type:
        return Response({'error': 'user_type parameter is required'}, status=400)
    
    has_type = request.user.user_type == user_type
    return Response({'has_type': has_type})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@cached_response(timeout=60)
def check_connection_type(request):
    connection_type = request.GET.get('connection_type')
    if not connection_type:
        return Response({'error': 'connection_type parameter is required'}, status=400)
    
    has_type = request.user.connection_type == connection_type
    return Response({'has_type': has_type})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats(request):
    cache_key = 'user_stats_global'
    cached_stats = cache.get(cache_key)
    
    if cached_stats:
        return Response(cached_stats)
    
    stats = UserAccount.objects.aggregate(
        total_users=Count('id'),
        active_users=Count('id', filter=Q(is_active=True)),
        admin_users=Count('id', filter=Q(user_type='admin')),
        superadmin_users=Count('id', filter=Q(user_type='superadmin')),
        client_users=Count('id', filter=Q(user_type='client')),
        hotspot_clients=Count('id', filter=Q(user_type='client', connection_type='hotspot')),
        pppoe_clients=Count('id', filter=Q(user_type='client', connection_type='pppoe')),
    )
    
    stats['recently_joined'] = UserAccount.objects.filter(
        date_joined__gte=timezone.now() - timezone.timedelta(days=7)
    ).count()
    
    cache.set(cache_key, stats, 300)
    return Response(stats)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_user_operation(request):
    user_ids = request.data.get('user_ids', [])
    operation = request.data.get('operation')
    
    if not user_ids or not operation:
        return Response({'error': 'Missing parameters'}, status=400)
    
    if operation == 'deactivate':
        updated = UserAccount.objects.filter(
            id__in=user_ids
        ).update(is_active=False)
    elif operation == 'activate':
        updated = UserAccount.objects.filter(
            id__in=user_ids
        ).update(is_active=True)
    elif operation == 'reset_pppoe':
        updated = 0
        for user in UserAccount.objects.filter(id__in=user_ids, connection_type='pppoe'):
            user.reset_pppoe_credentials()
            updated += 1
    else:
        return Response({'error': 'Invalid operation'}, status=400)
    
    cache.delete_many([f'user_display_{uid}' for uid in user_ids])
    cache.delete('user_stats_global')
    
    return Response({'updated': updated})


@api_view(['POST'])
@permission_classes([AllowAny])
@rate_limited(max_calls=50, period=60)
def pppoe_authenticate(request):
    """
    🔥 ENHANCED PPPoE Authentication - Supports both clients and admins with JWT tokens
    """
    try:
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '').strip()
        
        logger.info(f"PPPoE authentication attempt for username: {username}")
        
        if not username or not password:
            return Response(
                {'error': 'Username and password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Find user by PPPoE username - INCLUDES ADMINS NOW
        try:
            user = UserAccount.objects.get(
                pppoe_username=username,
                is_active=True
            )
        except UserAccount.DoesNotExist:
            logger.warning(f"PPPoE user not found: {username}")
            return Response(
                {'error': 'Invalid PPPoE credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Verify password
        decrypted_password = user.get_pppoe_password_decrypted()
        if decrypted_password and password == decrypted_password:
            # Update last login and activate PPPoE
            user.last_pppoe_login = timezone.now()
            user.pppoe_active = True
            user.save()
            
            # 🔥 CRITICAL FIX: Generate JWT tokens for API access
            try:
                from rest_framework_simplejwt.tokens import RefreshToken
                refresh = RefreshToken.for_user(user)
                
                # Prepare user data based on type
                user_data = {
                    'id': user.id,
                    'username': user.pppoe_username,
                    'connection_type': user.connection_type,
                    'user_type': user.user_type,
                    'is_admin': user.user_type in ['admin', 'superadmin'],
                }
                
                # Add type-specific fields
                if user.user_type == 'client':
                    user_data.update({
                        'client_id': user.client_id,
                        'phone_number': str(user.phone_number) if user.phone_number else None,
                    })
                else:
                    user_data.update({
                        'name': user.name,
                        'email': user.email,
                    })
                
                logger.info(f"PPPoE authentication successful for: {username} (Type: {user.user_type})")
                
                return Response({
                    'authenticated': True,
                    'message': 'PPPoE authentication successful',
                    'access_token': str(refresh.access_token),
                    'refresh_token': str(refresh),
                    'client': user_data
                })
                
            except ImportError:
                logger.error("JWT tokens not available - falling back to basic auth")
                return Response({
                    'authenticated': True,
                    'message': 'PPPoE authentication successful (JWT not available)',
                    'client': {
                        'id': user.id,
                        'username': user.pppoe_username,
                        'user_type': user.user_type,
                        'is_admin': user.user_type in ['admin', 'superadmin'],
                    }
                })
                
        else:
            logger.warning(f"PPPoE authentication failed for: {username}")
            return Response(
                {'error': 'Invalid PPPoE credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
            
    except Exception as e:
        logger.error(f"PPPoE authentication error: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Authentication service temporarily unavailable'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_pppoe_setup(request):
    """
    🔥 NEW: Allow admins to setup PPPoE credentials for themselves
    """
    try:
        user = request.user
        
        # Only allow admins to setup PPPoE
        if user.user_type not in ['admin', 'superadmin']:
            return Response(
                {'error': 'Only admin users can setup PPPoE credentials'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username:
            return Response(
                {'error': 'PPPoE username is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if username is already taken
        if UserAccount.objects.filter(pppoe_username=username).exclude(id=user.id).exists():
            return Response(
                {'error': 'PPPoE username already taken'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update user with PPPoE credentials
        user.pppoe_username = username
        if password:
            from ..models import CredentialEncryption
            user.pppoe_password = CredentialEncryption.encrypt(password)
        else:
            # Auto-generate password if not provided
            from ..models import IDGenerator
            user.pppoe_password = CredentialEncryption.encrypt(
                IDGenerator.generate_pppoe_password()
            )
        
        user.connection_type = 'pppoe'  # Allow admin to use PPPoE
        user.save()
        
        logger.info(f"Admin PPPoE setup completed for: {user.email}")
        
        return Response({
            'success': True,
            'message': 'PPPoE credentials setup successfully',
            'pppoe_username': user.pppoe_username,
            'auto_generated_password': not bool(password)
        })
        
    except Exception as e:
        logger.error(f"Admin PPPoE setup error: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to setup PPPoE credentials'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    

# Update the admin_pppoe_setup view to use the new serializer
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_pppoe_setup(request):
    """
    Allow admins to setup PPPoE credentials for themselves
    """
    try:
        user = request.user
        
        # Only allow admins to setup PPPoE
        if user.user_type not in ['admin', 'superadmin']:
            return Response(
                {'error': 'Only admin users can setup PPPoE credentials'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = AdminPPPoESetupSerializer(
            data=request.data, 
            context={'request': request}
        )
        
        if serializer.is_valid():
            result = serializer.save()
            
            logger.info(f"Admin PPPoE setup completed for: {user.email}")
            
            return Response({
                'success': True,
                'message': 'PPPoE credentials setup successfully',
                'pppoe_username': result['setup_result']['username'],
                'auto_generated_password': result['setup_result']['auto_generated'],
                'bandwidth': result['bandwidth'],
                'priority': result['priority']
            })
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        logger.error(f"Admin PPPoE setup error: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to setup PPPoE credentials'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )