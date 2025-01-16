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


# URL patterns for user management API endpoints.
# Uses a DefaultRouter to automatically generate RESTful URL routes for the UserProfileViewSet.
# Patterns:
# - /users/ : List and Create user profiles
# - /users/{id}/ : Retrieve, Update, Delete a specific user profile
# - /activities/ : List and Create user activities
# - /activities/{id}/ : Retrieve, Update, Delete a specific activity
# - /plans/ : List and Create plans
# - /plans/{id}/ : Retrieve, Update, Delete a specific plan
# - /userplans/ : List and Create user plan associations
# - /userplans/{id}/ : Retrieve, Update, Delete a specific user plan
urlpatterns = [
    path('', include(router.urls)),
]
