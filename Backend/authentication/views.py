# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import AllowAny
# from rest_framework.response import Response
# from rest_framework import generics
# from .models import UserAccount
# from .serializers import ClientCreateSerializer




# class ClientCreateView(generics.CreateAPIView):
#     serializer_class = ClientCreateSerializer
#     permission_classes = [AllowAny]

# @api_view(['GET'])
# @permission_classes([AllowAny])
# def check_email(request):
#     email = request.GET.get('email')
#     if not email:
#         return Response({'error': 'Email parameter is required'}, status=400)
#     exists = UserAccount.objects.filter(email=email).exists()
#     return Response({'exists': exists})









from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import generics
from .models import UserAccount
from .serializers import ClientCreateSerializer

class ClientCreateView(generics.CreateAPIView):
    serializer_class = ClientCreateSerializer
    permission_classes = [AllowAny]

@api_view(['GET'])
@permission_classes([AllowAny])
def check_email(request):
    email = request.GET.get('email')
    if not email:
        return Response({'error': 'Email parameter is required'}, status=400)
    exists = UserAccount.objects.filter(email=email).exists()
    return Response({'exists': exists})