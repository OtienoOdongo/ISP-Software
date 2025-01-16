from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.request import Request
from django.shortcuts import get_object_or_404
from .models import Plan
from .serializers import PlanSerializer
import logging

logger = logging.getLogger(__name__)

class PlanView(APIView):
    """
    Handles CRUD operations for Internet Plans.
    """

    def get(self, request: Request, *args, **kwargs) -> Response:
        """
        Retrieve all Internet plans.
        """
        plans = Plan.objects.all()
        serializer = PlanSerializer(plans, many=True)
        return Response(serializer.data)

    def post(self, request: Request, *args, **kwargs) -> Response:
        """
        Create a new Internet plan.
        """
        serializer = PlanSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info("Created new Internet plan with ID: %s", serializer.instance.id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.warning("Failed to create Internet plan: %s", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request: Request, pk: int, *args, **kwargs) -> Response:
        """
        Update an existing Internet plan.
        """
        plan = get_object_or_404(Plan, pk=pk)
        serializer = PlanSerializer(plan, data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info("Updated Internet plan with ID: %s", pk)
            return Response(serializer.data)
        logger.warning("Failed to update Internet plan with ID: %s, errors: %s", pk, serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request: Request, pk: int, *args, **kwargs) -> Response:
        """
        Delete an Internet plan.
        """
        plan = get_object_or_404(Plan, pk=pk)
        plan.delete()
        logger.info("Deleted Internet plan with ID: %s", pk)
        return Response(status=status.HTTP_204_NO_CONTENT)