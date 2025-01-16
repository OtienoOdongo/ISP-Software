from django.urls import path
from . import views

app_name = "support_maintenance"

urlpatterns = [
    path("support-tickets/", views.SupportTicketListCreateView.as_view(), name="support-ticket-list"),
    path("support-tickets/<int:pk>/", views.SupportTicketRetrieveUpdateDestroyView.as_view(), name="support-ticket-detail"),
    path("knowledge-base/", views.KnowledgeBaseListCreateView.as_view(), name="knowledge-base"),
    path("knowledge-base/<int:pk>/", views.KnowledgeBaseRetrieveUpdateDestroyView.as_view(), name="knowledge-base-detail"),
    path("remote-access/", views.RemoteSupportAccessView.as_view(), name="remote-access"),
    path("firmware-updates/", views.FirmwareUpdatesListCreateView.as_view(), name="firmware-updates"),
]
