






# """
# AUTHENTICATION APP - URL Configuration
# Only authentication-related endpoints
# Supports both admin dashboard and captive portal workflows
# """

# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from authentication.views import (
#     # Captive Portal Views
#     captive_portal_register,
    
#     # Admin Client Creation Views
#     HotspotClientCreateView,
#     PPPoEClientCreateView,
    
#     # Authentication Views
#     pppoe_authenticate,
    
#     # Validation Views
#     validate_phone,
#     validate_uuid,
#     check_phone,
#     check_uuid,
#     check_email,
#     check_user_type,
#     check_connection_type,
    
#     # User Profile Views
#     pppoe_update_credentials,
#     get_client_by_phone,
#     create_authenticated_user,
#     bulk_check_phones,
#     UserMeViewSet
# )

# # Initialize router
# router = DefaultRouter()
# router.register(r'users/me', UserMeViewSet, basename='userme')

# urlpatterns = [
#     # ==================== DJOSER AUTHENTICATION ====================
#     # Djoser handles authenticated user (admin/staff) authentication
#     # Email + password login, registration, password reset, etc.
#     # These will be accessible at: /api/auth/users/, /api/auth/jwt/create/, etc.
#     path('', include('djoser.urls')),
#     path('', include('djoser.urls.jwt')),
    
#     # ==================== CAPTIVE PORTAL ENDPOINTS (PUBLIC) ====================
#     # Accessible at: /api/auth/captive/register/
#     path('captive/register/', captive_portal_register, name='captive-portal-register'),
    
#     # ==================== ADMIN DASHBOARD CLIENT CREATION ====================
#     # Accessible at: /api/auth/admin/clients/hotspot/create/
#     path('admin/clients/hotspot/create/', HotspotClientCreateView.as_view(), 
#          name='admin-hotspot-client-create'),
#     # Accessible at: /api/auth/admin/clients/pppoe/create/
#     path('admin/clients/pppoe/create/', PPPoEClientCreateView.as_view(), 
#          name='admin-pppoe-client-create'),
    
#     # ==================== AUTHENTICATION ENDPOINTS ====================
#     # PPPoE authentication for routers (public endpoint)
#     # Accessible at: /api/auth/auth/pppoe/
#     path('auth/pppoe/', pppoe_authenticate, name='pppoe-authenticate'),
    
#     # ==================== VALIDATION ENDPOINTS ====================
#     # POST validation - Accessible at: /api/auth/validate/phone/
#     path('validate/phone/', validate_phone, name='validate-phone'),
#     # Accessible at: /api/auth/validate/uuid/
#     path('validate/uuid/', validate_uuid, name='validate-uuid'),
    
#     # GET validation (for frontend forms) 
#     # ⚠️ IMPORTANT: Your frontend calls /api/auth/check-email/ 
#     # So these URLs must NOT have 'auth/' prefix
#     # Accessible at: /api/auth/check-email/
#     path('check-email/', check_email, name='check-email'),
#     # Accessible at: /api/auth/check-phone/
#     path('check-phone/', check_phone, name='check-phone'),
#     # Accessible at: /api/auth/check-uuid/
#     path('check-uuid/', check_uuid, name='check-uuid'),
#     # Accessible at: /api/auth/check-user-type/
#     path('check-user-type/', check_user_type, name='check-user-type'),
#     # Accessible at: /api/auth/check-connection-type/
#     path('check-connection-type/', check_connection_type, name='check-connection-type'),
    
#     # ==================== USER PROFILE ====================
#     # Current user profile - Accessible at: /api/auth/users/me/
#     path('users/me/', UserMeViewSet.as_view({
#         'get': 'retrieve', 
#         'put': 'update', 
#         'patch': 'partial_update'
#     }), name='user-me'),
    
#     # ==================== PPPOE CLIENT SELF-SERVICE ====================
#     # Accessible at: /api/auth/pppoe/update-credentials/
#     path('pppoe/update-credentials/', pppoe_update_credentials, 
#          name='pppoe-update-credentials'),
    
#     # ==================== ADMIN/STAFF MANAGEMENT ====================
#     # Create new authenticated users (admin only)
#     # Accessible at: /api/auth/admin/authenticated-users/create/
#     path('admin/authenticated-users/create/', create_authenticated_user, 
#          name='create-authenticated-user'),
    
#     # ==================== CLIENT LOOKUP ====================
#     # Lookup client by phone - Accessible at: /api/auth/admin/clients/lookup/
#     path('admin/clients/lookup/', get_client_by_phone, name='get-client-by-phone'),
    
#     # ==================== BULK OPERATIONS ====================
#     # Bulk phone check - Accessible at: /api/auth/admin/bulk/check-phones/
#     path('admin/bulk/check-phones/', bulk_check_phones, name='bulk-check-phones'),
# ]

# # URL PATH MAPPING FOR FRONTEND:
# # ===============================
# # Frontend calls: /api/auth/check-email/ 
# #   → This file provides: path('check-email/', ...)
# #   → Main urls.py adds prefix: path('api/auth/', include('authentication.urls'))
# #   → Final URL: /api/auth/check-email/ ✅
# #
# # Frontend calls: /api/auth/users/ (for registration via Djoser)
# #   → This file provides: path('', include('djoser.urls'))
# #   → Djoser provides: path('users/', ...)
# #   → Final URL: /api/auth/users/ ✅
# #
# # Frontend calls: /api/auth/jwt/create/ (for JWT login)
# #   → This file provides: path('', include('djoser.urls.jwt'))
# #   → Djoser provides: path('jwt/create/', ...)
# #   → Final URL: /api/auth/jwt/create/ ✅










"""
AUTHENTICATION APP - Enhanced URL Configuration
Fixed Djoser integration with proper separation of endpoints:
- Djoser endpoints for authenticated user registration/login (email-based)
- Admin dashboard client creation (authenticated only)
- Captive portal registration (public)
- PPPoE authentication (public for routers)
- Validation endpoints for both email and phone
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from authentication.views import (
    # Email Validation (for Djoser registration)
    validate_email,
    check_email,
    
    # Captive Portal Views (Public)
    captive_portal_register,
    
    # Admin Client Creation Views (Authenticated only)
    HotspotClientCreateView,
    PPPoEClientCreateView,
    
    # Authentication Views
    pppoe_authenticate,
    
    # Validation Views
    validate_phone,
    validate_uuid,
    check_phone,
    check_uuid,
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
    # These will be accessible at: /api/auth/users/, /api/auth/jwt/create/, etc.
    # IMPORTANT: Djoser uses our custom DjoserUserCreateSerializer
    path('', include('djoser.urls')),
    path('', include('djoser.urls.jwt')),
    
    # ==================== EMAIL VALIDATION (FOR DJOSER) ====================
    # POST email validation - Accessible at: /api/auth/validate-email/
    path('validate-email/', validate_email, name='validate-email'),
    
    # GET email check (for frontend forms) - Accessible at: /api/auth/check-email/
    # This is the endpoint your frontend calls for email validation
    path('check-email/', check_email, name='check-email'),
    
    # ==================== CAPTIVE PORTAL ENDPOINTS (PUBLIC) ====================
    # Accessible at: /api/auth/captive/register/
    path('captive/register/', captive_portal_register, name='captive-portal-register'),
    
    # ==================== ADMIN DASHBOARD CLIENT CREATION ====================
    # Accessible at: /api/auth/admin/clients/hotspot/create/
    path('admin/clients/hotspot/create/', HotspotClientCreateView.as_view(), 
         name='admin-hotspot-client-create'),
    # Accessible at: /api/auth/admin/clients/pppoe/create/
    path('admin/clients/pppoe/create/', PPPoEClientCreateView.as_view(), 
         name='admin-pppoe-client-create'),
    
    # ==================== AUTHENTICATION ENDPOINTS ====================
    # PPPoE authentication for routers (public endpoint)
    # Accessible at: /api/auth/auth/pppoe/
    path('auth/pppoe/', pppoe_authenticate, name='pppoe-authenticate'),
    
    # ==================== VALIDATION ENDPOINTS ====================
    # POST validation - Accessible at: /api/auth/validate/phone/
    path('validate/phone/', validate_phone, name='validate-phone'),
    # Accessible at: /api/auth/validate/uuid/
    path('validate/uuid/', validate_uuid, name='validate-uuid'),
    
    # GET validation (for frontend forms)
    # Accessible at: /api/auth/check-phone/
    path('check-phone/', check_phone, name='check-phone'),
    # Accessible at: /api/auth/check-uuid/
    path('check-uuid/', check_uuid, name='check-uuid'),
    # Accessible at: /api/auth/check-user-type/
    path('check-user-type/', check_user_type, name='check-user-type'),
    # Accessible at: /api/auth/check-connection-type/
    path('check-connection-type/', check_connection_type, name='check-connection-type'),
    
    # ==================== USER PROFILE ====================
    # Current user profile - Accessible at: /api/auth/users/me/
    path('users/me/', UserMeViewSet.as_view({
        'get': 'retrieve', 
        'put': 'update', 
        'patch': 'partial_update'
    }), name='user-me'),
    
    # ==================== PPPOE CLIENT SELF-SERVICE ====================
    # Accessible at: /api/auth/pppoe/update-credentials/
    path('pppoe/update-credentials/', pppoe_update_credentials, 
         name='pppoe-update-credentials'),
    
    # ==================== ADMIN/STAFF MANAGEMENT ====================
    # Create new authenticated users (admin only)
    # Accessible at: /api/auth/admin/authenticated-users/create/
    path('admin/authenticated-users/create/', create_authenticated_user, 
         name='create-authenticated-user'),
    
    # ==================== CLIENT LOOKUP ====================
    # Lookup client by phone - Accessible at: /api/auth/admin/clients/lookup/
    path('admin/clients/lookup/', get_client_by_phone, name='get-client-by-phone'),
    
    # ==================== BULK OPERATIONS ====================
    # Bulk phone check - Accessible at: /api/auth/admin/bulk/check-phones/
    path('admin/bulk/check-phones/', bulk_check_phones, name='bulk-check-phones'),
]

# URL PATH MAPPING FOR FRONTEND:
# ===============================
# Frontend calls: /api/auth/check-email/ 
#   → This file provides: path('check-email/', ...)
#   → Main urls.py adds prefix: path('api/auth/', include('authentication.urls'))
#   → Final URL: /api/auth/check-email/ ✅
#
# Frontend calls: /api/auth/users/ (for registration via Djoser)
#   → This file provides: path('', include('djoser.urls'))
#   → Djoser provides: path('users/', ...)
#   → Final URL: /api/auth/users/ ✅
#
# Frontend calls: /api/auth/jwt/create/ (for JWT login)
#   → This file provides: path('', include('djoser.urls.jwt'))
#   → Djoser provides: path('jwt/create/', ...)
#   → Final URL: /api/auth/jwt/create/ ✅