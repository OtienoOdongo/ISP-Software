from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.db.models import Q
from support.models import FAQ, SupportTicket
from support.serializers import FAQSerializer, SupportTicketSerializer
from user_management.models.user_profile import UserProfile

class FAQViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing FAQs, providing CRUD operations.
    """
    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        query = self.request.query_params.get('search', '')
        if query:
            return self.queryset.filter(
                Q(question__icontains=query) | Q(answer__icontains=query)
            )
        return self.queryset

class SupportTicketViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Support Tickets, providing CRUD operations.
    """
    queryset = SupportTicket.objects.all()
    serializer_class = SupportTicketSerializer
    permission_classes = [IsAdminUser]

    def create(self, request, *args, **kwargs):
        """
        Custom create method to ensure the user exists before creating a ticket.
        """
        user_id = request.data.get('user_id')
        if user_id:
            try:
                user = UserProfile.objects.get(id=user_id)
                request.data['user'] = user.id  
            except UserProfile.DoesNotExist:
                return Response({"error": "User does not exist"}, status=status.HTTP_400_BAD_REQUEST)
        return super().create(request, *args, **kwargs)