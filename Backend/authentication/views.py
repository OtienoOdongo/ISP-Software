# from rest_framework import viewsets
# from rest_framework.decorators import action
# from rest_framework.response import Response
# from rest_framework.permissions import AllowAny, IsAuthenticated
# from rest_framework.authentication import SessionAuthentication
# from rest_framework_simplejwt.authentication import JWTAuthentication
# from rest_framework_simplejwt.tokens import RefreshToken
# from django.contrib.auth import authenticate, login, logout
# from django.utils import timezone
# from django.urls import reverse  
# from django.core.mail import send_mail
# from django.template.loader import render_to_string
# from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
# from django.utils.encoding import force_bytes
# from django.contrib.auth.tokens import default_token_generator
# from .models import User
# from .serializers import UserSerializer

# class UserViewSet(viewsets.ModelViewSet):
#     queryset = User.objects.all()
#     serializer_class = UserSerializer
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     @action(detail=False, methods=['get'], permission_classes=[AllowAny])
#     def api_root(self, request):
#         return Response({
#             'login': reverse('login', request=request),
#             'signup': reverse('signup', request=request),
#             'token': reverse('token_obtain_pair', request=request),
#             'token_refresh': reverse('token_refresh', request=request),
#         })

#     @action(detail=False, methods=['post'], permission_classes=[AllowAny])
#     def login(self, request):
#         email = request.data.get('email')
#         password = request.data.get('password')
#         user = authenticate(request, username=email, password=password)

#         if user is not None:
#             if not user.is_verified:
#                 return Response({'error': 'Email not verified. Please check your email.'}, status=400)

#             login(request, user)
#             user.last_login = timezone.now()
#             user.save()
#             refresh = RefreshToken.for_user(user)
#             return Response({
#                 'refresh': str(refresh),
#                 'access': str(refresh.access_token),
#                 'user': UserSerializer(user).data
#             })
#         return Response({'error': 'Invalid credentials'}, status=400)

#     @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
#     def logout(self, request):
#         try:
#             refresh_token = request.data.get('refresh')
#             token = RefreshToken(refresh_token)
#             token.blacklist()
#             logout(request)
#             return Response({'detail': 'Successfully logged out.'})
#         except Exception as e:
#             return Response({'detail': str(e)}, status=400)

#     @action(detail=False, methods=['post'], permission_classes=[AllowAny])
#     def signup(self, request):
#         serializer = UserSerializer(data=request.data)
#         if serializer.is_valid():
#             user = serializer.save()
#             self.send_verification_email(user)
#             return Response({'detail': 'User created. Please check your email to verify your account.'})
#         return Response(serializer.errors, status=400)

#     def send_verification_email(self, user):
#         subject = "Verify Your Email"
#         message = render_to_string('verification_email.html', {
#             'user': user,
#             'uid': urlsafe_base64_encode(force_bytes(user.pk)),
#             'token': default_token_generator.make_token(user),
#         })
#         send_mail(subject, message, 'noreply@example.com', [user.email])

