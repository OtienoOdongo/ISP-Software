from django.urls import path, include

urlpatterns = [
    path('', include('djoser.urls')),  # Base Djoser authentication endpoints
    path('', include('djoser.urls.jwt')),  # JWT authentication endpoints
]
