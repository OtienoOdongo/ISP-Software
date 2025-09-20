


# from django.urls import path, include, re_path
# from .views import check_email
# from .views import ClientCreateView

# urlpatterns = [
#     re_path(r'^', include('djoser.urls')),        # base djoser endpoints 
#     re_path(r'^', include('djoser.urls.jwt')),    # jwt endpoints 
#     path('check-email/', check_email, name='check_email'),  # custom endpoint 
#      path('clients/', ClientCreateView.as_view(), name='client-create'),
# ]







# authentication/urls.py
from django.urls import path, include, re_path
from rest_framework.response import Response
from .views import (
    check_email, ClientCreateView, user_me_head_fix, 
    UserMeViewSet, check_user_type, user_stats, bulk_user_operation
)
from rest_framework.routers import DefaultRouter
from django.core.cache import cache
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_cookie

# Optimized router configuration
router = DefaultRouter()
router.register(r'users/me', UserMeViewSet, basename='userme')

# URL patterns with caching and optimization
urlpatterns = [
    re_path(r'^', include('djoser.urls')),
    re_path(r'^', include('djoser.urls.jwt')),
    
    # Optimized endpoints
    path('check-email/', check_email, name='check_email'),
    path('clients/', ClientCreateView.as_view(), name='client-create'),
    path('check-user-type/', check_user_type, name='check_user_type'),
    path('stats/', user_stats, name='user_stats'),
    path('bulk-operation/', bulk_user_operation, name='bulk_user_operation'),
    
    # Router URLs
    path('', include(router.urls)),
    
    # Temporary fix endpoint
    path('auth/users/me/head-fix/', user_me_head_fix, name='user-me-head-fix'),
]

# Advanced Djoser patching with error handling
def patch_djoser_head_method():
    try:
        from djoser.views import UserViewSet
        
        original_retrieve = UserViewSet.retrieve
        
        def optimized_retrieve(self, request, *args, **kwargs):
            """Optimized retrieve with caching and HEAD support"""
            if request.method == 'HEAD':
                # Return minimal response for HEAD requests
                return Response(
                    status=200,
                    headers={
                        'X-User-Exists': 'true',
                        'Content-Type': 'application/json'
                    }
                )
            
            # Add caching for GET requests
            cache_key = f"djoser_user_{request.user.id if request.user.is_authenticated else 'anon'}"
            cached_data = cache.get(cache_key)
            
            if cached_data:
                return Response(cached_data)
            
            response = original_retrieve(self, request, *args, **kwargs)
            
            if response.status_code == 200:
                cache.set(cache_key, response.data, 300)  # Cache for 5 minutes
            
            return response
        
        UserViewSet.retrieve = optimized_retrieve
        print("Djoser UserViewSet successfully patched with optimizations")
        
    except ImportError as e:
        print(f"Djoser patching failed: {e}")
    except Exception as e:
        print(f"Unexpected error during Djoser patching: {e}")

# Apply patches on startup
patch_djoser_head_method()

# Additional optimization: preload common views
def preload_common_views():
    """Preload frequently accessed views for better performance"""
    try:
        from django.urls import get_resolver
        from django.core.cache import cache
        
        # Precompile URL patterns
        resolver = get_resolver()
        common_patterns = ['check-email', 'users/me', 'auth/jwt']
        
        for pattern in common_patterns:
            try:
                resolver.resolve(f'/api/{pattern}/')
            except:
                pass
        
        print("URL patterns preloaded successfully")
        
    except Exception as e:
        print(f"URL preloading failed: {e}")

# Run preloading
preload_common_views()