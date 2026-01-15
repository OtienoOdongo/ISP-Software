
# """
# AUTHENTICATION APP - URL Configuration
# Only authentication-related endpoints
# """

# from django.urls import path, include, re_path
# from rest_framework.routers import DefaultRouter
# from authentication.views import (
#     HotspotClientCreateView,
#     PPPoEClientCreateView,
#     pppoe_authenticate,
#     validate_phone,
#     validate_uuid,
#     check_phone,
#     check_uuid,
#     check_email,
#     check_user_type,
#     check_connection_type,
#     pppoe_update_credentials,
#     get_client_by_phone,
#     create_authenticated_user,
#     UserMeViewSet
# )

# # Initialize router
# router = DefaultRouter()
# router.register(r'users/me', UserMeViewSet, basename='userme')

# urlpatterns = [
#     # ==================== DJOSER AUTHENTICATION ====================
#     # Djoser handles authenticated user (admin/staff) authentication
#     # Email + password login, registration, password reset, etc.
#     re_path(r'^', include('djoser.urls')),
#     re_path(r'^', include('djoser.urls.jwt')),
    
#     # ==================== CLIENT CREATION (UserManagement app uses these) ====================
#     path('clients/hotspot/create/', HotspotClientCreateView.as_view(), 
#          name='hotspot-client-create'),
#     path('clients/pppoe/create/', PPPoEClientCreateView.as_view(), 
#          name='pppoe-client-create'),
    
#     # ==================== AUTHENTICATION ENDPOINTS ====================
#     # PPPoE authentication for routers
#     path('auth/pppoe/', pppoe_authenticate, name='pppoe-authenticate'),
    
#     # ==================== VALIDATION ENDPOINTS ====================
#     # POST validation
#     path('validate/phone/', validate_phone, name='validate-phone'),
#     path('validate/uuid/', validate_uuid, name='validate-uuid'),
    
#     # GET validation (for frontend forms)
#     path('check/phone/', check_phone, name='check-phone'),
#     path('check/uuid/', check_uuid, name='check-uuid'),
#     path('check/email/', check_email, name='check-email'),
#     path('check/user-type/', check_user_type, name='check-user-type'),
#     path('check/connection-type/', check_connection_type, name='check-connection-type'),
    
#     # ==================== USER PROFILE ====================
#     # Current user profile (handled by router)
#     path('', include(router.urls)),
    
#     # ==================== PPPOE CLIENT SELF-SERVICE ====================
#     # PPPoE clients can update their own credentials
#     path('pppoe/update-credentials/', pppoe_update_credentials, 
#          name='pppoe-update-credentials'),
    
#     # ==================== ADMIN/STAFF MANAGEMENT ====================
#     # Create new authenticated users (admin only)
#     path('authenticated-users/create/', create_authenticated_user, 
#          name='create-authenticated-user'),
    
#     # ==================== CLIENT LOOKUP ====================
#     # Lookup client by phone (for UserManagement app)
#     path('clients/lookup/', get_client_by_phone, name='get-client-by-phone'),
# ]

# # Note: SMS functionality is handled by UserManagement app
# # This app only provides the data (credentials) for SMS sending
# # Internet plans are handled by InternetPlans app
# # Statistics and health checks are handled by separate apps








"""
AUTHENTICATION APP - URL Configuration
Only authentication-related endpoints
Supports both admin dashboard and captive portal workflows
"""

from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from authentication.views import (
    # Captive Portal Views
    captive_portal_register,
    
    # Admin Client Creation Views
    HotspotClientCreateView,
    PPPoEClientCreateView,
    
    # Authentication Views
    pppoe_authenticate,
    
    # Validation Views
    validate_phone,
    validate_uuid,
    check_phone,
    check_uuid,
    check_email,
    check_user_type,
    check_connection_type,
    
    # User Profile Views
    pppoe_update_credentials,
    get_client_by_phone,
    create_authenticated_user,
    bulk_check_phones,
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
    
    # ==================== CAPTIVE PORTAL ENDPOINTS (PUBLIC) ====================
    # These endpoints are public and used by hotspot landing page
    path('captive/register/', captive_portal_register, name='captive-portal-register'),
    
    # ==================== ADMIN DASHBOARD CLIENT CREATION ====================
    # These endpoints require authentication (admin/staff only)
    path('admin/clients/hotspot/create/', HotspotClientCreateView.as_view(), 
         name='admin-hotspot-client-create'),
    path('admin/clients/pppoe/create/', PPPoEClientCreateView.as_view(), 
         name='admin-pppoe-client-create'),
    
    # ==================== AUTHENTICATION ENDPOINTS ====================
    # PPPoE authentication for routers (public endpoint)
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
    path('admin/authenticated-users/create/', create_authenticated_user, 
         name='create-authenticated-user'),
    
    # ==================== CLIENT LOOKUP ====================
    # Lookup client by phone (for UserManagement app, admin/staff only)
    path('admin/clients/lookup/', get_client_by_phone, name='get-client-by-phone'),
    
    # ==================== BULK OPERATIONS ====================
    # Bulk phone check (admin/staff only)
    path('admin/bulk/check-phones/', bulk_check_phones, name='bulk-check-phones'),
]

# Note: SMS functionality is handled by UserManagement app
# This app only provides the data (credentials) for SMS sending
# Internet plans are handled by InternetPlans app
# Statistics and health checks are handled by separate apps