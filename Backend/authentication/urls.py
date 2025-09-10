# from django.urls import path, include

# urlpatterns = [
#     path('', include('djoser.urls')),  # Base Djoser authentication endpoints
#     path('', include('djoser.urls.jwt')),  # JWT authentication endpoints
# ]



from django.urls import path, include, re_path
from .views import check_email
from .views import ClientCreateView

urlpatterns = [
    re_path(r'^', include('djoser.urls')),        # base djoser endpoints 
    re_path(r'^', include('djoser.urls.jwt')),    # jwt endpoints 
    path('check-email/', check_email, name='check_email'),  # custom endpoint 
     path('clients/', ClientCreateView.as_view(), name='client-create'),
]
