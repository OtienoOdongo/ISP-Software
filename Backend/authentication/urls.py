








# from django.urls import path, include, re_path
# from rest_framework.response import Response
# from .views import (
#     check_email, check_phone, HotspotClientCreateView, PPPoEClientCreateView,
#     PPPoECredentialView, user_me_head_fix, UserMeViewSet, check_user_type,
#     check_connection_type, user_stats, bulk_user_operation
# )
# from rest_framework.routers import DefaultRouter
# from django.core.cache import cache
# from django.views.decorators.cache import cache_page
# from django.views.decorators.vary import vary_on_cookie

# router = DefaultRouter()
# router.register(r'users/me', UserMeViewSet, basename='userme')
# router.register(r'users/me/pppoe-credentials', PPPoECredentialView, basename='pppoe-credentials')

# urlpatterns = [
#     re_path(r'^', include('djoser.urls')),
#     re_path(r'^', include('djoser.urls.jwt')),
    
#     # Client creation endpoints
#     path('clients/hotspot/', HotspotClientCreateView.as_view(), name='hotspot-client-create'),
#     path('clients/pppoe/', PPPoEClientCreateView.as_view(), name='pppoe-client-create'),
    
#     # Validation endpoints
#     path('check-email/', check_email, name='check_email'),
#     path('check-phone/', check_phone, name='check_phone'),
#     path('check-user-type/', check_user_type, name='check_user_type'),
#     path('check-connection-type/', check_connection_type, name='check_connection_type'),
    
#     # Stats and operations
#     path('stats/', user_stats, name='user_stats'),
#     path('bulk-operation/', bulk_user_operation, name='bulk_user_operation'),
    
#     # Router URLs
#     path('', include(router.urls)),
    
#     # Temporary fix endpoint
#     path('auth/users/me/head-fix/', user_me_head_fix, name='user-me-head-fix'),
# ]

# def patch_djoser_head_method():
#     try:
#         from djoser.views import UserViewSet
        
#         original_retrieve = UserViewSet.retrieve
        
#         def optimized_retrieve(self, request, *args, **kwargs):
#             if request.method == 'HEAD':
#                 return Response(
#                     status=200,
#                     headers={
#                         'X-User-Exists': 'true',
#                         'Content-Type': 'application/json'
#                     }
#                 )
            
#             cache_key = f"djoser_user_{request.user.id if request.user.is_authenticated else 'anon'}"
#             cached_data = cache.get(cache_key)
            
#             if cached_data:
#                 return Response(cached_data)
            
#             response = original_retrieve(self, request, *args, **kwargs)
            
#             if response.status_code == 200:
#                 cache.set(cache_key, response.data, 300)
            
#             return response
        
#         UserViewSet.retrieve = optimized_retrieve
#         print("Djoser UserViewSet successfully patched with optimizations")
        
#     except ImportError as e:
#         print(f"Djoser patching failed: {e}")
#     except Exception as e:
#         print(f"Unexpected error during Djoser patching: {e}")

# def preload_common_views():
#     try:
#         from django.urls import get_resolver
        
#         resolver = get_resolver()
#         common_patterns = ['check-email', 'check-phone', 'users/me', 'auth/jwt']
        
#         for pattern in common_patterns:
#             try:
#                 resolver.resolve(f'/api/{pattern}/')
#             except:
#                 pass
        
#         print("URL patterns preloaded successfully")
        
#     except Exception as e:
#         print(f"URL preloading failed: {e}")

# patch_djoser_head_method()
# preload_common_views()







from django.urls import path, include, re_path
from rest_framework.response import Response
from .views import (
    check_email, check_phone, HotspotClientCreateView, PPPoEClientCreateView,
    PPPoECredentialView, user_me_head_fix, UserMeViewSet, check_user_type,
    check_connection_type, user_stats, bulk_user_operation,
    pppoe_authenticate  # Add this import
)
from rest_framework.routers import DefaultRouter
from django.db.models import Count

from django.core.cache import cache
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_cookie

router = DefaultRouter()
router.register(r'users/me', UserMeViewSet, basename='userme')
router.register(r'users/me/pppoe-credentials', PPPoECredentialView, basename='pppoe-credentials')

urlpatterns = [
    re_path(r'^', include('djoser.urls')),
    re_path(r'^', include('djoser.urls.jwt')),
    
    # Client creation endpoints
    path('clients/hotspot/', HotspotClientCreateView.as_view(), name='hotspot-client-create'),
    path('clients/pppoe/', PPPoEClientCreateView.as_view(), name='pppoe-client-create'),
    
    # PPPoE Authentication endpoint - ADD THIS
    path('clients/pppoe-authenticate/', pppoe_authenticate, name='pppoe-authenticate'),
    
    # Validation endpoints
    path('check-email/', check_email, name='check_email'),
    path('check-phone/', check_phone, name='check_phone'),
    path('check-user-type/', check_user_type, name='check_user_type'),
    path('check-connection-type/', check_connection_type, name='check_connection_type'),
    
    # Stats and operations
    path('stats/', user_stats, name='user_stats'),
    path('bulk-operation/', bulk_user_operation, name='bulk_user_operation'),
    
    # Router URLs
    path('', include(router.urls)),
    
    # Temporary fix endpoint
    path('auth/users/me/head-fix/', user_me_head_fix, name='user-me-head-fix'),
]

def patch_djoser_head_method():
    """
    Patch Djoser's UserViewSet to optimize HEAD requests and add caching
    """
    try:
        from djoser.views import UserViewSet
        
        original_retrieve = UserViewSet.retrieve
        
        def optimized_retrieve(self, request, *args, **kwargs):
            if request.method == 'HEAD':
                return Response(
                    status=200,
                    headers={
                        'X-User-Exists': 'true',
                        'Content-Type': 'application/json',
                        'X-Cache-Optimized': 'true'
                    }
                )
            
            # Generate cache key based on user and request
            cache_key = f"djoser_user_{request.user.id if request.user.is_authenticated else 'anon'}_{request.get_full_path()}"
            cached_data = cache.get(cache_key)
            
            if cached_data:
                return Response(cached_data)
            
            response = original_retrieve(self, request, *args, **kwargs)
            
            if response.status_code == 200:
                # Cache successful responses for 5 minutes
                cache.set(cache_key, response.data, 300)
            
            return response
        
        UserViewSet.retrieve = optimized_retrieve
        print("✅ Djoser UserViewSet successfully patched with HEAD optimization and caching")
        
    except ImportError as e:
        print(f"❌ Djoser patching failed: {e}")
    except Exception as e:
        print(f"❌ Unexpected error during Djoser patching: {e}")

def preload_common_views():
    """
    Preload common URL patterns to improve first-request performance
    """
    try:
        from django.urls import get_resolver
        
        resolver = get_resolver()
        common_patterns = [
            'check-email', 
            'check-phone', 
            'users/me', 
            'auth/jwt',
            'clients/hotspot',
            'clients/pppoe',
            'clients/pppoe-authenticate',
            'stats'
        ]
        
        preload_count = 0
        for pattern in common_patterns:
            try:
                resolver.resolve(f'/api/{pattern}/')
                preload_count += 1
            except:
                pass
        
        print(f"✅ URL patterns preloaded successfully: {preload_count}/{len(common_patterns)} patterns cached")
        
    except Exception as e:
        print(f"❌ URL preloading failed: {e}")

def initialize_cache():
    """
    Initialize cache with common data to improve performance
    """
    try:
        from .models import UserAccount
        
        # Cache user counts
        user_counts = UserAccount.objects.aggregate(
            total_users=Count('id'),
            active_users=Count('id', filter={'is_active': True}),
            admin_users=Count('id', filter={'user_type__in': ['admin', 'superadmin']}),
            client_users=Count('id', filter={'user_type': 'client'}),
        )
        
        cache.set('user_counts_initial', user_counts, 3600)  # Cache for 1 hour
        print("✅ Initial cache data loaded successfully")
        
    except Exception as e:
        print(f"❌ Cache initialization failed: {e}")

def optimize_api_performance():
    """
    Main function to optimize API performance by applying all optimizations
    """
    print("🚀 Starting API performance optimization...")
    
    # Apply all optimizations
    patch_djoser_head_method()
    preload_common_views()
    initialize_cache()
    
    print("✅ All API optimizations completed successfully!")

# Apply optimizations when module is imported
optimize_api_performance()