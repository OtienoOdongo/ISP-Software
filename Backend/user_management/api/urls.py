from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserProfileViewSet, UserActivityViewSet, PlanViewSet, \
    UserPlanViewSet, UserBillingViewSet, PaymentViewSet


router = DefaultRouter()
router.register(r'users', UserProfileViewSet)
router.register(r'activities', UserActivityViewSet)
router.register(r'plans', PlanViewSet)
router.register(r'userplans', UserPlanViewSet)
router.register(r'userbilling', UserBillingViewSet)
router.register(r'payments', PaymentViewSet)


urlpatterns = [
    path('', include(router.urls)),
]
