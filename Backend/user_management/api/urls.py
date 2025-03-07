from django.urls import path, include
from rest_framework.routers import DefaultRouter
from user_management.api.views.user_views import UserProfileViewSet
from user_management.api.views.activity_views import UserActivityViewSet
from user_management.api.views.plan_views import PlanViewSet, UserPlanViewSet
from user_management.api.views.billing_views import UserBillingViewSet, PaymentViewSet


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
