

# from django.urls import path, include, re_path
# from rest_framework.response import Response
# from authentication.views import (
#     check_email, check_phone, HotspotClientCreateView, PPPoEClientCreateView,
#     PPPoECredentialViewSet,  
#     user_me_head_fix, UserMeViewSet, check_user_type,
#     check_connection_type, user_stats, bulk_user_operation,
#     pppoe_authenticate, admin_pppoe_setup
# )
# from rest_framework.routers import DefaultRouter
# from django.db.models import Count

# from django.core.cache import cache
# from django.views.decorators.cache import cache_page
# from django.views.decorators.vary import vary_on_cookie

# router = DefaultRouter()
# router.register(r'users/me', UserMeViewSet, basename='userme')
# router.register(r'users/me/pppoe-credentials', PPPoECredentialViewSet, basename='pppoe-credentials')  # FIX: Changed here too

# urlpatterns = [
#     re_path(r'^', include('djoser.urls')),
#     re_path(r'^', include('djoser.urls.jwt')),
    
#     # Client creation endpoints
#     path('clients/hotspot/', HotspotClientCreateView.as_view(), name='hotspot-client-create'),
#     path('clients/pppoe/', PPPoEClientCreateView.as_view(), name='pppoe-client-create'),
    
#     path('clients/pppoe-authenticate/', pppoe_authenticate, name='pppoe-authenticate'),
#     path('admin/pppoe-setup/', admin_pppoe_setup, name='admin-pppoe-setup'),
    
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
#     """
#     Patch Djoser's UserViewSet to optimize HEAD requests and add caching
#     """
#     try:
#         from djoser.views import UserViewSet
        
#         original_retrieve = UserViewSet.retrieve
        
#         def optimized_retrieve(self, request, *args, **kwargs):
#             if request.method == 'HEAD':
#                 return Response(
#                     status=200,
#                     headers={
#                         'X-User-Exists': 'true',
#                         'Content-Type': 'application/json',
#                         'X-Cache-Optimized': 'true'
#                     }
#                 )
            
#             # Generate cache key based on user and request
#             cache_key = f"djoser_user_{request.user.id if request.user.is_authenticated else 'anon'}_{request.get_full_path()}"
#             cached_data = cache.get(cache_key)
            
#             if cached_data:
#                 return Response(cached_data)
            
#             response = original_retrieve(self, request, *args, **kwargs)
            
#             if response.status_code == 200:
#                 # Cache successful responses for 5 minutes
#                 cache.set(cache_key, response.data, 300)
            
#             return response
        
#         UserViewSet.retrieve = optimized_retrieve
#         print("✅ Djoser UserViewSet successfully patched with HEAD optimization and caching")
        
#     except ImportError as e:
#         print(f"❌ Djoser patching failed: {e}")
#     except Exception as e:
#         print(f"❌ Unexpected error during Djoser patching: {e}")

# def preload_common_views():
#     """
#     Preload common URL patterns to improve first-request performance
#     """
#     try:
#         from django.urls import get_resolver
        
#         resolver = get_resolver()
#         common_patterns = [
#             'check-email', 
#             'check-phone', 
#             'users/me', 
#             'auth/jwt',
#             'clients/hotspot',
#             'clients/pppoe',
#             'clients/pppoe-authenticate',
#             'stats'
#         ]
        
#         preload_count = 0
#         for pattern in common_patterns:
#             try:
#                 resolver.resolve(f'/api/{pattern}/')
#                 preload_count += 1
#             except:
#                 pass
        
#         print(f"✅ URL patterns preloaded successfully: {preload_count}/{len(common_patterns)} patterns cached")
        
#     except Exception as e:
#         print(f"❌ URL preloading failed: {e}")

# def initialize_cache():
#     """
#     Initialize cache with common data to improve performance
#     """
#     try:
#         from .models import UserAccount
        
#         # Cache user counts
#         user_counts = UserAccount.objects.aggregate(
#             total_users=Count('id'),
#             active_users=Count('id', filter={'is_active': True}),
#             admin_users=Count('id', filter={'user_type__in': ['admin', 'superadmin']}),
#             client_users=Count('id', filter={'user_type': 'client'}),
#         )
        
#         cache.set('user_counts_initial', user_counts, 3600)  # Cache for 1 hour
#         print("✅ Initial cache data loaded successfully")
        
#     except Exception as e:
#         print(f"❌ Cache initialization failed: {e}")

# def optimize_api_performance():
#     """
#     Main function to optimize API performance by applying all optimizations
#     """
#     print("🚀 Starting API performance optimization...")
    
#     # Apply all optimizations
#     patch_djoser_head_method()
#     preload_common_views()
#     initialize_cache()
    
#     print("✅ All API optimizations completed successfully!")

# # Apply optimizations when module is imported
# optimize_api_performance()














"""
AUTHENTICATION APP - URL Configuration
Only authentication-related endpoints
"""

from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from authentication.views import (
    HotspotClientCreateView,
    PPPoEClientCreateView,
    pppoe_authenticate,
    validate_phone,
    validate_uuid,
    check_phone,
    check_uuid,
    check_email,
    check_user_type,
    check_connection_type,
    pppoe_update_credentials,
    get_client_by_phone,
    create_authenticated_user,
    UserMeViewSet
)

# Initialize router
router = DefaultRouter()
router.register(r'users/me', UserMeViewSet, basename='userme')

urlpatterns = [
    # ==================== DJOSER AUTHENTICATION ====================
    # Djoser handles authenticated user (admin/staff) authentication
    # Email + password login, registration, password reset, etc.
    re_path(r'^', include('djoser.urls')),
    re_path(r'^', include('djoser.urls.jwt')),
    
    # ==================== CLIENT CREATION (UserManagement app uses these) ====================
    path('clients/hotspot/create/', HotspotClientCreateView.as_view(), 
         name='hotspot-client-create'),
    path('clients/pppoe/create/', PPPoEClientCreateView.as_view(), 
         name='pppoe-client-create'),
    
    # ==================== AUTHENTICATION ENDPOINTS ====================
    # PPPoE authentication for routers
    path('auth/pppoe/', pppoe_authenticate, name='pppoe-authenticate'),
    
    # ==================== VALIDATION ENDPOINTS ====================
    # POST validation
    path('validate/phone/', validate_phone, name='validate-phone'),
    path('validate/uuid/', validate_uuid, name='validate-uuid'),
    
    # GET validation (for frontend forms)
    path('check/phone/', check_phone, name='check-phone'),
    path('check/uuid/', check_uuid, name='check-uuid'),
    path('check/email/', check_email, name='check-email'),
    path('check/user-type/', check_user_type, name='check-user-type'),
    path('check/connection-type/', check_connection_type, name='check-connection-type'),
    
    # ==================== USER PROFILE ====================
    # Current user profile (handled by router)
    path('', include(router.urls)),
    
    # ==================== PPPOE CLIENT SELF-SERVICE ====================
    # PPPoE clients can update their own credentials
    path('pppoe/update-credentials/', pppoe_update_credentials, 
         name='pppoe-update-credentials'),
    
    # ==================== ADMIN/STAFF MANAGEMENT ====================
    # Create new authenticated users (admin only)
    path('authenticated-users/create/', create_authenticated_user, 
         name='create-authenticated-user'),
    
    # ==================== CLIENT LOOKUP ====================
    # Lookup client by phone (for UserManagement app)
    path('clients/lookup/', get_client_by_phone, name='get-client-by-phone'),
]

# Note: SMS functionality is handled by UserManagement app
# This app only provides the data (credentials) for SMS sending
# Internet plans are handled by InternetPlans app
# Statistics and health checks are handled by separate apps








