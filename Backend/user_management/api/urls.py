# user_management/api/urls.py
from django.urls import path
from user_management.api.views.user_views import UserProfileAPIView
from user_management.api.views.activity_views import UserActivityAPIView
from user_management.api.views.plan_views import PlanAPIView, UserPlanAPIView
from user_management.api.views.billing_views import PaymentAPIView

urlpatterns = [
    # List all profiles or create a new profile
    path('user-profiles/', UserProfileAPIView.as_view(), name='user-profiles-list'),
    # Retrieve, update, or delete a specific profile
    path('user-profiles/<int:pk>/', UserProfileAPIView.as_view(), name='user-profiles-detail'),
    # Toggle status of a specific profile
    path('user-profiles/<int:pk>/toggle-status/', UserProfileAPIView.as_view(), name='user-profiles-toggle'),

    # User Activity Log
    path('user-activities/', UserActivityAPIView.as_view(), name='user-activities'),

    # Plan Assignment
    path('plans/', PlanAPIView.as_view(), name='plans'),
    path('user-plans/', UserPlanAPIView.as_view(), name='user-plans'),

    # Payment History
    path('payments/', PaymentAPIView.as_view(), name='payments'),
]