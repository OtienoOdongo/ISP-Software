

# # authentication/views.py
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import AllowAny, IsAuthenticated
# from rest_framework.response import Response
# from rest_framework import generics, status
# from rest_framework.viewsets import GenericViewSet
# from rest_framework.mixins import RetrieveModelMixin
# from django.utils.decorators import method_decorator
# from django.views.decorators.csrf import csrf_exempt
# from django.db.models import Q, Count
# from django.core.cache import cache
# from typing import Dict, Any, List
# import time
# from functools import lru_cache

# from .models import UserAccount
# from .serializers import ClientCreateSerializer, UserMeSerializer

# # Rate limiting and caching decorators
# def rate_limited(max_calls=100, period=60):
#     """Token bucket algorithm for rate limiting"""
#     def decorator(view_func):
#         call_times = []
        
#         def wrapped_view(request, *args, **kwargs):
#             current_time = time.time()
#             # Remove calls outside the period
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
#     """Response caching decorator"""
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

# class ClientCreateView(generics.CreateAPIView):
#     serializer_class = ClientCreateSerializer
#     permission_classes = [AllowAny]
    
#     @method_decorator(csrf_exempt)
#     @method_decorator(rate_limited(max_calls=50, period=60))
#     def dispatch(self, *args, **kwargs):
#         return super().dispatch(*args, **kwargs)

# class UserMeViewSet(GenericViewSet, RetrieveModelMixin):
#     """Optimized viewset for /users/me/ endpoint"""
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
#     """Cached email existence check with LRU cache"""
#     return UserAccount.objects.filter(
#         Q(email=email) & Q(is_active=True)
#     ).exists()

# @api_view(['GET'])
# @permission_classes([AllowAny])
# @rate_limited(max_calls=200, period=60)
# @cached_response(timeout=300)
# def check_email(request):
#     """Optimized email check endpoint"""
#     email = request.GET.get('email')
#     if not email:
#         return Response({'error': 'Email parameter is required'}, status=400)
    
#     exists = _check_email_exists(email)
#     return Response({'exists': exists})

# @api_view(['HEAD', 'GET'])
# @permission_classes([IsAuthenticated])
# def user_me_head_fix(request):
#     """Efficient HEAD request handler"""
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
#     """Optimized user type checking"""
#     user_type = request.GET.get('user_type')
#     if not user_type:
#         return Response({'error': 'user_type parameter is required'}, status=400)
    
#     has_type = request.user.user_type == user_type
#     return Response({'has_type': has_type})

# # Additional optimized endpoints
# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def user_stats(request):
#     """Optimized user statistics endpoint"""
#     cache_key = 'user_stats_global'
#     cached_stats = cache.get(cache_key)
    
#     if cached_stats:
#         return Response(cached_stats)
    
#     # Efficient aggregation using Django's ORM
#     stats = UserAccount.objects.aggregate(
#         total_users=Count('id'),
#         active_users=Count('id', filter=Q(is_active=True)),
#         admin_users=Count('id', filter=Q(user_type='admin')),
#         superadmin_users=Count('id', filter=Q(user_type='superadmin')),
#         client_users=Count('id', filter=Q(user_type='client')),
#     )
    
#     # Add recent activity
#     stats['recently_joined'] = UserAccount.objects.filter(
#         date_joined__gte=timezone.now() - timezone.timedelta(days=7)
#     ).count()
    
#     cache.set(cache_key, stats, 300)  # Cache for 5 minutes
#     return Response(stats)

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def bulk_user_operation(request):
#     """Efficient bulk user operations"""
#     user_ids = request.data.get('user_ids', [])
#     operation = request.data.get('operation')
    
#     if not user_ids or not operation:
#         return Response({'error': 'Missing parameters'}, status=400)
    
#     # Use bulk operations for efficiency
#     if operation == 'deactivate':
#         updated = UserAccount.objects.filter(
#             id__in=user_ids
#         ).update(is_active=False)
#     elif operation == 'activate':
#         updated = UserAccount.objects.filter(
#             id__in=user_ids
#         ).update(is_active=True)
#     else:
#         return Response({'error': 'Invalid operation'}, status=400)
    
#     # Invalidate relevant caches
#     cache.delete_many([f'user_display_{uid}' for uid in user_ids])
#     cache.delete('user_stats_global')
    
#     return Response({'updated': updated})




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

from .models import UserAccount
from .serializers import (
    HotspotClientCreateSerializer, PPPoEClientCreateSerializer, 
    PPPoECredentialSerializer, UserMeSerializer
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
    Authenticate PPPoE users for router login
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
        
        # Find user by PPPoE username
        try:
            user = UserAccount.objects.get(
                pppoe_username=username,
                connection_type='pppoe',
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
            
            logger.info(f"PPPoE authentication successful for: {username}")
            
            return Response({
                'authenticated': True,
                'message': 'PPPoE authentication successful',
                'client': {
                    'id': user.id,
                    'client_id': user.client_id,
                    'phone_number': str(user.phone_number),
                    'username': user.pppoe_username,
                    'connection_type': user.connection_type,
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

