# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
# from . import views

# router = DefaultRouter()
# router.register(r'users', views.UserViewSet)

# urlpatterns = [
#     path('', views.UserViewSet.as_view({'get': 'api_root'}), name='api_root'),
#     path('', include(router.urls)),

#     # JWT Authentication Endpoints
#     path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
#     path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

#     # Custom Authentication Endpoints
#     path('login/', views.UserViewSet.as_view({'post': 'login'}), name='login'),
#     path('signup/', views.UserViewSet.as_view({'post': 'signup'}), name='signup'),
#     path('verify-email/<uidb64>/<token>/', views.UserViewSet.as_view({'get': 'verify_email'}), name='verify_email'),
#     path('forgot-password/', views.UserViewSet.as_view({'post': 'forgot_password'}), name='forgot_password'),
#     path('reset-password/<uidb64>/<token>/', views.UserViewSet.as_view({'post': 'reset_password'}), name='reset_password'),
# ]



# from django.urls import path, include, re_path
# from django.views.generic import TemplateView


# urlpatterns = [
#     path('auth/', include('djoser.urls')),
#     path('auth/', include('djoser.urls.jwt')),
# ]


# urlpatterns += [re_path(r'^.*', TemplateView.as_view(template_name='index.html'))]


from django.urls import path, include

urlpatterns = [
    path('', include('djoser.urls')),  # Base Djoser authentication endpoints
    path('', include('djoser.urls.jwt')),  # JWT authentication endpoints
]
