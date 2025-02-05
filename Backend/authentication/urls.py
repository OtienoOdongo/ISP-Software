from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)

urlpatterns = [
    path('', include(router.urls)),

    # JWT Authentication Endpoints
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Custom Authentication Endpoints
    path('login/', views.UserViewSet.as_view({'post': 'login'}), name='login'),
    path('signup/', views.UserViewSet.as_view({'post': 'signup'}), name='signup'),
    path('verify-email///', views.UserViewSet.as_view({'get': 'verify_email'}), name='verify_email'),
    path('forgot-password/', views.UserViewSet.as_view({'post': 'forgot_password'}), name='forgot_password'),
    path('reset-password///', views.UserViewSet.as_view({'post': 'reset_password'}), name='reset_password'),
]