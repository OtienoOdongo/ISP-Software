# test_auth_config.py
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'interlink_logic.settings')
django.setup()

from django.conf import settings
from authentication.models import UserAccount

print("Testing Authentication Configuration:")
print(f"1. AUTH_USER_MODEL: {settings.AUTH_USER_MODEL}")
print(f"2. DJOSER serializers configured: {'user_create' in settings.DJOSER['SERIALIZERS']}")

# Test user creation
try:
    user = UserAccount.objects.create_user(
        email='test@example.com',
        password='TestPass123!@#',
        name='Test User'
    )
    print(f"3. User creation test: SUCCESS (User ID: {user.id})")
    user.delete()
except Exception as e:
    print(f"3. User creation test: FAILED - {e}")