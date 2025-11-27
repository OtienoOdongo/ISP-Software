# from django.urls import path
# from .views import DashboardView

# app_name = 'dashboard'

# urlpatterns = [
#     path('', DashboardView.as_view(), name='dashboard'),
# ]



# from django.urls import path
# from .views import DashboardView, DashboardHealthCheck

# app_name = 'dashboard'

# urlpatterns = [
#     path('', DashboardView.as_view(), name='dashboard'),
#     path('health/', DashboardHealthCheck.as_view(), name='dashboard-health'),
# ]




from django.urls import path
from .views import DashboardView, DashboardHealthCheck, DashboardMetricsAPI

app_name = 'dashboard'

urlpatterns = [
    path('', DashboardView.as_view(), name='dashboard'),
    path('health/', DashboardHealthCheck.as_view(), name='dashboard-health'),
    path('metrics/<str:metric_type>/', DashboardMetricsAPI.as_view(), name='dashboard-metrics'),
]