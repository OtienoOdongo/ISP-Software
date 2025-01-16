from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import SupportTicket, KnowledgeBaseArticle, RemoteSupportSession, FirmwareUpdate
from .serializers import (
    SupportTicketSerializer,
    KnowledgeBaseArticleSerializer,
    RemoteSupportSessionSerializer,
    FirmwareUpdateSerializer,
)


class UserSupportTicketsView(APIView):
    """
    Manages user support tickets.
    """

    def get(self, request):
        """
        Retrieve all support tickets.
        """
        tickets = SupportTicket.objects.all()
        serializer = SupportTicketSerializer(tickets, many=True)
        return Response(serializer.data)


class KnowledgeBaseView(APIView):
    """
    Manages knowledge base articles.
    """

    def get(self, request):
        """
        Retrieve all knowledge base articles.
        """
        articles = KnowledgeBaseArticle.objects.all()
        serializer = KnowledgeBaseArticleSerializer(articles, many=True)
        return Response(serializer.data)


class RemoteSupportAccessView(APIView):
    """
    Manages remote support sessions.
    """

    def get(self, request):
        """
        Retrieve all remote support sessions.
        """
        sessions = RemoteSupportSession.objects.all()
        serializer = RemoteSupportSessionSerializer(sessions, many=True)
        return Response(serializer.data)


class FirmwareUpdatesView(APIView):
    """
    Manages firmware updates for connected devices.
    """

    def get(self, request):
        """
        Retrieve all firmware updates.
        """
        updates = FirmwareUpdate.objects.all()
        serializer = FirmwareUpdateSerializer(updates, many=True)
        return Response(serializer.data)

    def post(self, request):
        """
        Add a new firmware update.
        """
        serializer = FirmwareUpdateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
