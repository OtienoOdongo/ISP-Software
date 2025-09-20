# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import AllowAny
# from rest_framework.response import Response
# from rest_framework import generics
# from .models import UserAccount
# from .serializers import ClientCreateSerializer




# class ClientCreateView(generics.CreateAPIView):
#     serializer_class = ClientCreateSerializer
#     permission_classes = [AllowAny]

# @api_view(['GET'])
# @permission_classes([AllowAny])
# def check_email(request):
#     email = request.GET.get('email')
#     if not email:
#         return Response({'error': 'Email parameter is required'}, status=400)
#     exists = UserAccount.objects.filter(email=email).exists()
#     return Response({'exists': exists})









# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import AllowAny
# from rest_framework.response import Response
# from rest_framework import generics
# from .models import UserAccount
# from .serializers import ClientCreateSerializer

# class ClientCreateView(generics.CreateAPIView):
#     serializer_class = ClientCreateSerializer
#     permission_classes = [AllowAny]

# @api_view(['GET'])
# @permission_classes([AllowAny])
# def check_email(request):
#     email = request.GET.get('email')
#     if not email:
#         return Response({'error': 'Email parameter is required'}, status=400)
#     exists = UserAccount.objects.filter(email=email).exists()
#     return Response({'exists': exists})









# authentication/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.viewsets import GenericViewSet
from rest_framework.mixins import RetrieveModelMixin
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q, Count
from django.core.cache import cache
from typing import Dict, Any, List
import time
from functools import lru_cache

from .models import UserAccount
from .serializers import ClientCreateSerializer, UserMeSerializer

# Rate limiting and caching decorators
def rate_limited(max_calls=100, period=60):
    """Token bucket algorithm for rate limiting"""
    def decorator(view_func):
        call_times = []
        
        def wrapped_view(request, *args, **kwargs):
            current_time = time.time()
            # Remove calls outside the period
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
    """Response caching decorator"""
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

class ClientCreateView(generics.CreateAPIView):
    serializer_class = ClientCreateSerializer
    permission_classes = [AllowAny]
    
    @method_decorator(csrf_exempt)
    @method_decorator(rate_limited(max_calls=50, period=60))
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

class UserMeViewSet(GenericViewSet, RetrieveModelMixin):
    """Optimized viewset for /users/me/ endpoint"""
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
    """Cached email existence check with LRU cache"""
    return UserAccount.objects.filter(
        Q(email=email) & Q(is_active=True)
    ).exists()

@api_view(['GET'])
@permission_classes([AllowAny])
@rate_limited(max_calls=200, period=60)
@cached_response(timeout=300)
def check_email(request):
    """Optimized email check endpoint"""
    email = request.GET.get('email')
    if not email:
        return Response({'error': 'Email parameter is required'}, status=400)
    
    exists = _check_email_exists(email)
    return Response({'exists': exists})

@api_view(['HEAD', 'GET'])
@permission_classes([IsAuthenticated])
def user_me_head_fix(request):
    """Efficient HEAD request handler"""
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
    """Optimized user type checking"""
    user_type = request.GET.get('user_type')
    if not user_type:
        return Response({'error': 'user_type parameter is required'}, status=400)
    
    has_type = request.user.user_type == user_type
    return Response({'has_type': has_type})

# Additional optimized endpoints
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats(request):
    """Optimized user statistics endpoint"""
    cache_key = 'user_stats_global'
    cached_stats = cache.get(cache_key)
    
    if cached_stats:
        return Response(cached_stats)
    
    # Efficient aggregation using Django's ORM
    stats = UserAccount.objects.aggregate(
        total_users=Count('id'),
        active_users=Count('id', filter=Q(is_active=True)),
        admin_users=Count('id', filter=Q(user_type='admin')),
        superadmin_users=Count('id', filter=Q(user_type='superadmin')),
        client_users=Count('id', filter=Q(user_type='client')),
    )
    
    # Add recent activity
    stats['recently_joined'] = UserAccount.objects.filter(
        date_joined__gte=timezone.now() - timezone.timedelta(days=7)
    ).count()
    
    cache.set(cache_key, stats, 300)  # Cache for 5 minutes
    return Response(stats)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_user_operation(request):
    """Efficient bulk user operations"""
    user_ids = request.data.get('user_ids', [])
    operation = request.data.get('operation')
    
    if not user_ids or not operation:
        return Response({'error': 'Missing parameters'}, status=400)
    
    # Use bulk operations for efficiency
    if operation == 'deactivate':
        updated = UserAccount.objects.filter(
            id__in=user_ids
        ).update(is_active=False)
    elif operation == 'activate':
        updated = UserAccount.objects.filter(
            id__in=user_ids
        ).update(is_active=True)
    else:
        return Response({'error': 'Invalid operation'}, status=400)
    
    # Invalidate relevant caches
    cache.delete_many([f'user_display_{uid}' for uid in user_ids])
    cache.delete('user_stats_global')
    
    return Response({'updated': updated})