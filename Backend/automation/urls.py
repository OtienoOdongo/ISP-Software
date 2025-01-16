from django.urls import path
from .views import (
    AutomatedAlertListView,
    AutomatedAlertDetailView,
    ScheduledMaintenanceListView,
    ScheduledMaintenanceDetailView,
    TaskAutomationListView,
    TaskAutomationDetailView,
)

urlpatterns = [
    # Automated Alerts
    path('automated-alerts/', AutomatedAlertListView.as_view(), name='automated-alerts'),
    path('automated-alerts/<int:pk>/', AutomatedAlertDetailView.as_view(), name='automated-alert-detail'),

    # Scheduled Maintenance
    path('scheduled-maintenance/', ScheduledMaintenanceListView.as_view(), name='scheduled-maintenance'),
    path('scheduled-maintenance/<int:pk>/', ScheduledMaintenanceDetailView.as_view(), name='scheduled-maintenance-detail'),

    # Task Automation
    path('task-automation/', TaskAutomationListView.as_view(), name='task-automation'),
    path('task-automation/<int:pk>/', TaskAutomationDetailView.as_view(), name='task-automation-detail'),
]
