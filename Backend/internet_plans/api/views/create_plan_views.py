from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination
from internet_plans.models.create_plan_models import InternetPlan
from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer
from rest_framework import status

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class InternetPlanListCreateView(APIView):
    pagination_class = StandardResultsSetPagination
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = InternetPlan.objects.all()
        queryset = self.apply_filters(queryset, request)
        queryset = self.apply_sorting(queryset, request)
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        serializer = InternetPlanSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = InternetPlanSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response({'error': 'Validation failed', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def apply_filters(self, queryset, request):
        if category := request.query_params.get('category'):
            queryset = queryset.filter(category=category)
        if plan_type := request.query_params.get('planType'):
            queryset = queryset.filter(plan_type=plan_type)
        if (active := request.query_params.get('active')) is not None:
            queryset = queryset.filter(active=active.lower() == 'true')
        if search := request.query_params.get('search'):
            queryset = queryset.filter(Q(name__icontains=search) | Q(description__icontains=search))
        return queryset

    def apply_sorting(self, queryset, request):
        sort_by = request.query_params.get('sort_by', 'name')
        sort_order = request.query_params.get('sort_order', 'asc')
        field_mapping = {
            'downloadSpeed': 'download_speed_value',
            'uploadSpeed': 'upload_speed_value',
            'expiry': 'expiry_value',
            'dataLimit': 'data_limit_value',
            'usageLimit': 'usage_limit_value',
            'planType': 'plan_type',
            'createdAt': 'created_at',
        }
        field = field_mapping.get(sort_by, sort_by)
        if sort_order == 'desc':
            field = f'-{field}'
        return queryset.order_by(field)

class InternetPlanDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        plan = get_object_or_404(InternetPlan, pk=pk)
        serializer = InternetPlanSerializer(plan)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        plan = get_object_or_404(InternetPlan, pk=pk)
        serializer = InternetPlanSerializer(plan, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        plan = get_object_or_404(InternetPlan, pk=pk)
        plan.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class PublicInternetPlanListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            queryset = InternetPlan.objects.filter(active=True)
            serializer = InternetPlanSerializer(queryset, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)