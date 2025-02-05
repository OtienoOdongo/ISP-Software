from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate, login, logout
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import SessionAuthentication
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from .models import User
from .serializers import UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    """
    A viewset for managing user-related operations including login, signup, and logout.

    Attributes:
        queryset (QuerySet): All User objects.
        serializer_class (Serializer): UserSerializer for serialization.
        authentication_classes (list): List of authentication classes for JWT and Session.

    Methods:
        login: Authenticates user and issues JWT tokens.
        logout: Logs out user and blacklists the refresh token.
        signup: Registers new user and sends verification email.
        verify_email: Verifies user's email address.
        forgot_password: Initiates password reset process by sending an email.
        reset_password: Allows password reset with a valid token.
        send_verification_email: Helper method to send verification email.
        send_password_reset_email: Helper method to send password reset email.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    authentication_classes = [JWTAuthentication, SessionAuthentication]

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        """
        Authenticate a user and return JWT tokens.

        Args:
            request (Request): Contains user credentials (email and password).

        Returns:
            Response: JWT tokens and user data if login is successful, error otherwise.
        """
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(request, username=email, password=password)

        if user is not None:
            if not user.is_verified:
                return Response({'error': 'Email not verified. Please check your email.'}, status=400)

            login(request, user)
            user.last_login = timezone.now()
            user.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            })
        else:
            return Response({'error': 'Invalid credentials'}, status=400)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def logout(self, request):
        """
        Log out the current user and blacklist the refresh token.

        Args:
            request (Request): Contains the refresh token for blacklisting.

        Returns:
            Response: Confirmation of logout or error message.
        """
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            logout(request)
            return Response({'detail': 'Successfully logged out.'})
        except Exception as e:
            return Response({'detail': str(e)}, status=400)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def signup(self, request):
        """
        Register a new user and send a verification email.

        Args:
            request (Request): Contains new user data.

        Returns:
            Response: Confirmation message or validation errors.
        """
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            self.send_verification_email(user)
            return Response({'detail': 'User created. Please check your email to verify your account.'})
        return Response(serializer.errors, status=400)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def verify_email(self, request, uidb64, token):
        """
        Verify the user's email address.

        Args:
            request (Request): HTTP GET request.
            uidb64 (str): Base64 encoded user ID.
            token (str): Email verification token.

        Returns:
            Response: Success message or error if verification fails.
        """
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            user.is_verified = True
            user.save()
            return Response({'detail': 'Email verified successfully.'})
        else:
            return Response({'detail': 'Invalid verification link.'}, status=400)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def forgot_password(self, request):
        """
        Send a password reset email to the user.

        Args:
            request (Request): Contains the email for password reset.

        Returns:
            Response: Success message or error if user doesn't exist.
        """
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            self.send_password_reset_email(user)
            return Response({'detail': 'Password reset email sent.'})
        except User.DoesNotExist:
            return Response({'error': 'User with this email does not exist.'}, status=400)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def reset_password(self, request, uidb64, token):
        """
        Reset the user's password with a valid token.

        Args:
            request (Request): Contains new password.
            uidb64 (str): Base64 encoded user ID.
            token (str): Password reset token.

        Returns:
            Response: Success message or error if reset fails.
        """
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            new_password = request.data.get('new_password')
            user.set_password(new_password)
            user.save()
            return Response({'detail': 'Password reset successfully.'})
        else:
            return Response({'detail': 'Invalid reset link.'}, status=400)

    def send_verification_email(self, user):
        """
        Send a verification email to the user.

        Args:
            user (User): The user to send the verification email to.
        """
        subject = "Verify Your Email"
        message = render_to_string('verification_email.html', {
            'user': user,
            'uid': urlsafe_base64_encode(force_bytes(user.pk)),
            'token': default_token_generator.make_token(user),
        })
        send_mail(subject, message, 'noreply@example.com', [user.email])

    def send_password_reset_email(self, user):
        """
        Send a password reset email to the user.

        Args:
            user (User): The user to send the password reset email to.
        """
        subject = "Reset Your Password"
        message = render_to_string('password_reset_email.html', {
            'user': user,
            'uid': urlsafe_base64_encode(force_bytes(user.pk)),
            'token': default_token_generator.make_token(user),
        })
        send_mail(subject, message, 'noreply@example.com', [user.email])