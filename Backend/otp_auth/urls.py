from django.urls import path
from .views import GenerateOTPView, VerifyOTPView

app_name = 'otp_auth'

urlpatterns = [
    path('generate/', GenerateOTPView.as_view(), name='generate_otp'),
    path('verify/', VerifyOTPView.as_view(), name='verify_otp'),
]