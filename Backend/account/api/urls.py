from django.urls import path, include
from rest_framework.routers import DefaultRouter
from account.api.views.admin_profile import AdminProfileViewSet, RecentActivityViewSet, \
NetworkHealthViewSet, ServerStatusViewSet, UserProfileViewSet

router = DefaultRouter()
router.register(r'admin-profiles', AdminProfileViewSet)
router.register(r'recent-activities', RecentActivityViewSet)
router.register(r'network-health', NetworkHealthViewSet)
router.register(r'server-status', ServerStatusViewSet)
router.register(r'user-profile', UserProfileViewSet)

urlpatterns = [
    path('', include(router.urls)),
]