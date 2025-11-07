





# from pathlib import Path
# from decouple import config
# from django.core.exceptions import ImproperlyConfigured
# from celery.schedules import crontab
# from datetime import timedelta
# from dotenv import load_dotenv
# import os

# load_dotenv()

# # Base Directory
# BASE_DIR = Path(__file__).resolve().parent.parent

# # Security
# SECRET_KEY = config('SECRET_KEY', default='default-insecure-secret-key')
# DEBUG = config('DEBUG', cast=bool, default=False)
# ALLOWED_HOSTS = ['127.0.0.1', 'localhost', '0.0.0.0']

# # Installed Apps
# INSTALLED_APPS = [
#     'django.contrib.admin',
#     'django.contrib.auth',
#     'django.contrib.contenttypes',
#     'django.contrib.sessions',
#     'django.contrib.messages',
#     'django.contrib.staticfiles',
#     'django.contrib.sites',
#     'django_crontab',
#     'django_extensions',

#     'authentication',
#     'user_management',
#     'internet_plans',
#     'network_management',
#     'payments',
#     'support',
#     'account',
#     'dashboard',
#     'otp_auth',

#     'rest_framework',
#     'drf_spectacular',
#     'djoser',
#     'rest_framework_simplejwt',
#     'corsheaders',
# ]

# SITE_ID = 1
# AUTH_USER_MODEL = 'authentication.UserAccount'
# AUTHENTICATION_BACKENDS = ['django.contrib.auth.backends.ModelBackend']

# # =======================
# # ✅ Twilio SendGrid Email Configuration
# # =======================
# EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
# EMAIL_HOST = "smtp.sendgrid.net"
# EMAIL_PORT = 587
# EMAIL_USE_TLS = True
# EMAIL_HOST_USER = "apikey"  # Required by SendGrid
# EMAIL_HOST_PASSWORD = config("SENDGRID_API_KEY")  # Your API key from .env
# DEFAULT_FROM_EMAIL = config("FROM_EMAIL", default="noreply06790n@gmail.com")

# # =======================
# # REST Framework Configuration
# # =======================
# REST_FRAMEWORK = {
#     'DEFAULT_PERMISSION_CLASSES': [
#         'rest_framework.permissions.IsAuthenticated',
#     ],
#     'DEFAULT_AUTHENTICATION_CLASSES': (
#         'rest_framework_simplejwt.authentication.JWTAuthentication',
#     ),
#     'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
# }

# # JWT Configuration
# SIMPLE_JWT = {
#     'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
#     'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
#     'AUTH_HEADER_TYPES': ('Bearer',),
#     'USER_ID_FIELD': 'id',
#     'USER_ID_CLAIM': 'user_id',
# }

# # Djoser Settings
# DJOSER = {
#     'LOGIN_FIELD': 'email',
#     'USER_CREATE_PASSWORD_RETYPE': True,
#     'SET_USERNAME_RETYPE': True,
#     'SET_PASSWORD_RETYPE': True,
#     'PASSWORD_RESET_CONFIRM_URL': 'password/reset/confirm/{uid}/{token}/',
#     'USERNAME_RESET_CONFIRM_URL': 'email/reset/confirm/{uid}/{token}/',
#     'ACTIVATION_URL': 'activate/{uid}/{token}/',
#     'SEND_ACTIVATION_EMAIL': True,
#     'SEND_CONFIRMATION_EMAIL': True,
#     'PASSWORD_CHANGED_EMAIL_CONFIRMATION': True,
#     'USERNAME_CHANGED_EMAIL_CONFIRMATION': True,
#     'HIDE_USERS': False,
#     'PERMISSIONS': {
#         'user': ['rest_framework.permissions.IsAuthenticated'],
#         'user_list': ['rest_framework.permissions.IsAdminUser'],
#     },
#     'SERIALIZERS': {
#         'user_create': 'authentication.serializers.DjoserUserCreateSerializer',
#         'user': 'authentication.serializers.UserSerializer',
#         'current_user': 'authentication.serializers.UserSerializer',
#         'user_delete': 'djoser.serializers.UserDeleteSerializer',
#     },
#     'SET_STAFF_STATUS': False,
# }

# # =======================
# # M-Pesa Configuration
# # =======================
# MPESA_ENCRYPTION_KEY = config('MPESA_ENCRYPTION_KEY', default=None)
# if not MPESA_ENCRYPTION_KEY:
#     raise ImproperlyConfigured("MPESA_ENCRYPTION_KEY is not set. Add it to your .env file.")

# # =======================
# # Celery and Redis Configuration
# # =======================
# CELERY_BROKER_URL = 'redis://127.0.0.1:6379/0'
# CELERY_RESULT_BACKEND = 'redis://127.0.0.1:6379/0'
# CELERY_ACCEPT_CONTENT = ['json']
# CELERY_TASK_SERIALIZER = 'json'
# CELERY_RESULT_SERIALIZER = 'json'
# CELERY_TIMEZONE = 'UTC'

# CELERY_BEAT_SCHEDULE = {
#     'check-data-usage-and-notify': {
#         'task': 'analytics.tasks.check_data_usage_and_notify',
#         'schedule': timedelta(hours=1),
#     },
#     'create-daily-analytics-snapshot': {
#         'task': 'analytics.tasks.create_daily_analytics_snapshot',
#         'schedule': crontab(hour=0, minute=0),
#     },
#     'send-payment-reminders': {
#         'task': 'analytics.tasks.send_payment_reminders',
#         'schedule': crontab(hour=9, minute=0),
#     },
# }

# # =======================
# # Middleware & CORS
# # =======================
# MIDDLEWARE = [
#     'django.middleware.security.SecurityMiddleware',
#     'django.contrib.sessions.middleware.SessionMiddleware',
#     'corsheaders.middleware.CorsMiddleware',
#     'django.middleware.common.CommonMiddleware',
#     'account.middleware.CustomCsrfMiddleware',
#     'django.contrib.auth.middleware.AuthenticationMiddleware',
#     'django.contrib.messages.middleware.MessageMiddleware',
#     'django.middleware.clickjacking.XFrameOptionsMiddleware',
# ]

# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:8000",
#     "http://127.0.0.1:8000",
#     "http://127.0.0.1:5173",
#     "http://localhost:5173",
#     "http://localhost:5174",
#     "http://127.0.0.1:5174",
# ]
# CORS_ALLOW_CREDENTIALS = True
# CORS_ALLOW_METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
# CORS_ALLOW_HEADERS = [
#     "accept",
#     "accept-encoding",
#     "authorization",
#     "content-type",
#     "dnt",
#     "origin",
#     "user-agent",
#     "x-csrftoken",
#     "x-requested-with",
# ]

# # =======================
# # Templates & URLs
# # =======================
# ROOT_URLCONF = 'interlink_logic.urls'
# TEMPLATES = [
#     {
#         'BACKEND': 'django.template.backends.django.DjangoTemplates',
#         'DIRS': [],
#         'APP_DIRS': True,
#         'OPTIONS': {
#             'context_processors': [
#                 'django.template.context_processors.debug',
#                 'django.template.context_processors.request',
#                 'django.contrib.auth.context_processors.auth',
#                 'django.contrib.messages.context_processors.messages',
#             ],
#         },
#     },
# ]
# WSGI_APPLICATION = 'interlink_logic.wsgi.application'

# # =======================
# # Database (MySQL)
# # =======================
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'OPTIONS': {"read_default_file": "/etc/mysql/my.cnf"},
#     }
# }

# # =======================
# # Redis Cache
# # =======================
# CACHES = {
#     'default': {
#         'BACKEND': 'django_redis.cache.RedisCache',
#         'LOCATION': 'redis://127.0.0.1:6379/1',
#         'OPTIONS': {'CLIENT_CLASS': 'django_redis.client.DefaultClient'},
#     }
# }

# # =======================
# # Static & Media Files
# # =======================
# STATIC_URL = '/static/'
# STATICFILES_DIRS = [
#     os.path.join(BASE_DIR, 'static'),
#     os.path.join(BASE_DIR, 'static/dashboard'),
#     os.path.join(BASE_DIR, 'static/landing'),
# ]
# STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
# MEDIA_URL = '/media/'
# MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# # Debug Static Files Check
# if DEBUG:
#     print("\n=== Static Files Verification ===")
#     print(f"BASE_DIR: {BASE_DIR}")
#     print(f"STATIC_URL: {STATIC_URL}")
#     print(f"STATIC_ROOT: {STATIC_ROOT}")
#     for d in STATICFILES_DIRS:
#         print(f" - {d} | Exists: {os.path.exists(d)}")

# # =======================
# # Misc
# # =======================
# DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
# LANGUAGE_CODE = 'en-us'
# TIME_ZONE = config('TIME_ZONE', default='UTC')
# USE_I18N = True
# USE_TZ = True

# SITE_DOMAIN = "localhost:8000"
# BASE_URL = f"http://{SITE_DOMAIN}"








# from pathlib import Path
# from decouple import config
# from django.core.exceptions import ImproperlyConfigured
# from celery.schedules import crontab
# from datetime import timedelta
# from dotenv import load_dotenv
# import os

# load_dotenv()

# # Base Directory
# BASE_DIR = Path(__file__).resolve().parent.parent

# # Security
# SECRET_KEY = config('SECRET_KEY', default='default-insecure-secret-key')
# DEBUG = config('DEBUG', cast=bool, default=False)
# ALLOWED_HOSTS = ['127.0.0.1', 'localhost', '0.0.0.0']


# ENABLE_WEBSOCKETS = True  # Enable WebSockets in developme

# # Installed Apps
# INSTALLED_APPS = [
#     'django.contrib.admin',
#     'django.contrib.auth',
#     'django.contrib.contenttypes',
#     'django.contrib.sessions',
#     'django.contrib.messages',
#     'django.contrib.staticfiles',
#     'django.contrib.sites',
#     'django_crontab',
#     'django_extensions',

#     'authentication',
#     'user_management',
#     'internet_plans',
#     'network_management',
#     'payments',
#     'support',
#     'account',
#     'dashboard',
#     'otp_auth',

#     'rest_framework',
#     'drf_spectacular',
#     'djoser',
#     'rest_framework_simplejwt',
#     'corsheaders',
#     'channels',  # For WebSocket support with Redis
#     'django_extensions',  # Useful development commands
#     'debug_toolbar',     # Debug toolbar

#      # API Documentation (development)
#     'drf_yasg',
    
#     # Health checks (optional)
#     'health_check',
#     'health_check.db',
#     'health_check.cache',
# ]


# # Channels Configuration (if using WebSockets)
# if ENABLE_WEBSOCKETS:
#     INSTALLED_APPS += ['channels']
#     ASGI_APPLICATION = 'your_project.asgi.application'

# SITE_ID = 1
# AUTH_USER_MODEL = 'authentication.UserAccount'
# AUTHENTICATION_BACKENDS = ['django.contrib.auth.backends.ModelBackend']

# # =======================
# # ✅ Twilio SendGrid Email Configuration
# # =======================
# EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
# EMAIL_HOST = "smtp.sendgrid.net"
# EMAIL_PORT = 587
# EMAIL_USE_TLS = True
# EMAIL_HOST_USER = "apikey"  # Required by SendGrid
# EMAIL_HOST_PASSWORD = config("SENDGRID_API_KEY")  # Your API key from .env
# DEFAULT_FROM_EMAIL = config("FROM_EMAIL", default="noreply06790n@gmail.com")

# # =======================
# # REST Framework Configuration
# # =======================
# REST_FRAMEWORK = {
#     'DEFAULT_PERMISSION_CLASSES': [
#         'rest_framework.permissions.IsAuthenticated',
#     ],
#     'DEFAULT_AUTHENTICATION_CLASSES': (
#         'rest_framework_simplejwt.authentication.JWTAuthentication',
#     ),
#     'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
# }

# # JWT Configuration
# SIMPLE_JWT = {
#     'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
#     'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
#     'AUTH_HEADER_TYPES': ('Bearer',),
#     'USER_ID_FIELD': 'id',
#     'USER_ID_CLAIM': 'user_id',
# }

# # Djoser Settings
# DJOSER = {
#     'LOGIN_FIELD': 'email',
#     'USER_CREATE_PASSWORD_RETYPE': True,
#     'SET_USERNAME_RETYPE': True,
#     'SET_PASSWORD_RETYPE': True,
#     'PASSWORD_RESET_CONFIRM_URL': 'password/reset/confirm/{uid}/{token}/',
#     'USERNAME_RESET_CONFIRM_URL': 'email/reset/confirm/{uid}/{token}/',
#     'ACTIVATION_URL': 'activate/{uid}/{token}/',
#     'SEND_ACTIVATION_EMAIL': True,
#     'SEND_CONFIRMATION_EMAIL': True,
#     'PASSWORD_CHANGED_EMAIL_CONFIRMATION': True,
#     'USERNAME_CHANGED_EMAIL_CONFIRMATION': True,
#     'HIDE_USERS': False,
#     'PERMISSIONS': {
#         'user': ['rest_framework.permissions.IsAuthenticated'],
#         'user_list': ['rest_framework.permissions.IsAdminUser'],
#     },
#     'SERIALIZERS': {
#         'user_create': 'authentication.serializers.DjoserUserCreateSerializer',
#         'user': 'authentication.serializers.UserSerializer',
#         'current_user': 'authentication.serializers.UserSerializer',
#         'user_delete': 'djoser.serializers.UserDeleteSerializer',
#     },
#     'SET_STAFF_STATUS': False,
# }

# # =======================
# # M-Pesa Configuration
# # =======================
# MPESA_ENCRYPTION_KEY = config('MPESA_ENCRYPTION_KEY', default=None)
# if not MPESA_ENCRYPTION_KEY:
#     raise ImproperlyConfigured("MPESA_ENCRYPTION_KEY is not set. Add it to your .env file.")

# # =======================
# # 🔄 UPDATED: Redis Configuration for Development (Fixed Authentication)
# # =======================
# REDIS_HOST = config('REDIS_HOST', default='127.0.0.1')
# REDIS_PORT = config('REDIS_PORT', default=6379, cast=int)
# REDIS_DB = config('REDIS_DB', default=0, cast=int)
# REDIS_PASSWORD = config('REDIS_PASSWORD', default=None)

# # Build Redis URL and options conditionally
# if REDIS_PASSWORD:
#     REDIS_URL = f'redis://:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}'
# else:
#     REDIS_URL = f'redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}'

# # =======================
# # 🔄 UPDATED: Redis Cache Configuration (Fixed Authentication)
# # =======================
# cache_options = {
#     'CLIENT_CLASS': 'django_redis.client.DefaultClient',
#     'SOCKET_CONNECT_TIMEOUT': 5,
#     'SOCKET_TIMEOUT': 5,
#     'RETRY_ON_TIMEOUT': True,
# }

# # Only add password to options if it's provided
# if REDIS_PASSWORD:
#     cache_options['PASSWORD'] = REDIS_PASSWORD

# CACHES = {
#     'default': {
#         'BACKEND': 'django_redis.cache.RedisCache',
#         'LOCATION': f'redis://{REDIS_HOST}:{REDIS_PORT}/1',
#         'OPTIONS': cache_options,
#         'KEY_PREFIX': 'interlink',
#         'TIMEOUT': 300,
#     }
# }

# # ✅ ADDED: Session Configuration with Redis (Optional but recommended)
# SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
# SESSION_CACHE_ALIAS = 'default'

# # =======================
# # 🔄 UPDATED: Celery Configuration with Redis (Fixed Authentication)
# # =======================
# CELERY_BROKER_URL = REDIS_URL
# CELERY_RESULT_BACKEND = REDIS_URL
# CELERY_ACCEPT_CONTENT = ['json']
# CELERY_TASK_SERIALIZER = 'json'
# CELERY_RESULT_SERIALIZER = 'json'
# CELERY_TIMEZONE = 'UTC'

# CELERY_BEAT_SCHEDULE = {
#     'check-data-usage-and-notify': {
#         'task': 'analytics.tasks.check_data_usage_and_notify',
#         'schedule': timedelta(hours=1),
#     },
#     'create-daily-analytics-snapshot': {
#         'task': 'analytics.tasks.create_daily_analytics_snapshot',
#         'schedule': crontab(hour=0, minute=0),
#     },
#     'send-payment-reminders': {
#         'task': 'analytics.tasks.send_payment_reminders',
#         'schedule': crontab(hour=9, minute=0),
#     },
# }

# # =======================
# # 🔄 UPDATED: Channels Configuration for WebSockets with Redis
# # =======================
# ASGI_APPLICATION = 'interlink_logic.asgi.application'

# CHANNEL_LAYERS = {
#     'default': {
#         'BACKEND': 'channels_redis.core.RedisChannelLayer',
#         'CONFIG': {
#             "hosts": [(REDIS_HOST, REDIS_PORT)],
#             "capacity": 1500,
#             "expiry": 10,
#         },
#     },
# }

# # =======================
# # Middleware & CORS
# # =======================
# MIDDLEWARE = [
#     'django.middleware.security.SecurityMiddleware',
#     'django.contrib.sessions.middleware.SessionMiddleware',
#     'corsheaders.middleware.CorsMiddleware',
#     'django.middleware.common.CommonMiddleware',
#     'account.middleware.CustomCsrfMiddleware',
#     'django.contrib.auth.middleware.AuthenticationMiddleware',
#     'django.contrib.messages.middleware.MessageMiddleware',
#     'django.middleware.clickjacking.XFrameOptionsMiddleware',
#     'network_management.middleware.audit_middleware.RouterAuditMiddleware',
#     'network_management.middleware.audit_middleware.AuditLogCleanupMiddleware',
# ]

# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:8000",
#     "http://127.0.0.1:8000",
#     "http://127.0.0.1:5173",
#     "http://localhost:5173",
#     "http://localhost:5174",
#     "http://127.0.0.1:5174",
# ]
# CORS_ALLOW_CREDENTIALS = True
# CORS_ALLOW_METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
# CORS_ALLOW_HEADERS = [
#     "accept",
#     "accept-encoding",
#     "authorization",
#     "content-type",
#     "dnt",
#     "origin",
#     "user-agent",
#     "x-csrftoken",
#     "x-requested-with",
# ]

# # =======================
# # Templates & URLs
# # =======================
# ROOT_URLCONF = 'interlink_logic.urls'
# TEMPLATES = [
#     {
#         'BACKEND': 'django.template.backends.django.DjangoTemplates',
#         'DIRS': [],
#         'APP_DIRS': True,
#         'OPTIONS': {
#             'context_processors': [
#                 'django.template.context_processors.debug',
#                 'django.template.context_processors.request',
#                 'django.contrib.auth.context_processors.auth',
#                 'django.contrib.messages.context_processors.messages',
#             ],
#         },
#     },
# ]
# WSGI_APPLICATION = 'interlink_logic.wsgi.application'

# # =======================
# # Database (MySQL) - NO CHANGES NEEDED
# # =======================
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'OPTIONS': {"read_default_file": "/etc/mysql/my.cnf"},
#     }
# }

# # =======================
# # Static & Media Files
# # =======================
# STATIC_URL = '/static/'
# STATICFILES_DIRS = [
#     os.path.join(BASE_DIR, 'static'),
#     os.path.join(BASE_DIR, 'static/dashboard'),
#     os.path.join(BASE_DIR, 'static/landing'),
# ]
# STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
# MEDIA_URL = '/media/'
# MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# # Debug Static Files Check
# if DEBUG:
#     print("\n=== Static Files Verification ===")
#     print(f"BASE_DIR: {BASE_DIR}")
#     print(f"STATIC_URL: {STATIC_URL}")
#     print(f"STATIC_ROOT: {STATIC_ROOT}")
#     for d in STATICFILES_DIRS:
#         print(f" - {d} | Exists: {os.path.exists(d)}")

# # =======================
# # Misc
# # =======================
# DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
# LANGUAGE_CODE = 'en-us'
# TIME_ZONE = config('TIME_ZONE', default='UTC')
# USE_I18N = True
# USE_TZ = True

# SITE_DOMAIN = "localhost:8000"
# BASE_URL = f"http://{SITE_DOMAIN}"















from pathlib import Path
from decouple import config
from django.core.exceptions import ImproperlyConfigured
from celery.schedules import crontab
from datetime import timedelta
from dotenv import load_dotenv
import os

load_dotenv()

# Base Directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Security
SECRET_KEY = config('SECRET_KEY', default='default-insecure-secret-key')
DEBUG = config('DEBUG', cast=bool, default=True)  # Set to True for development
ALLOWED_HOSTS = ['127.0.0.1', 'localhost', '0.0.0.0']

ENABLE_WEBSOCKETS = True  # Enable WebSockets in development

# Installed Apps
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    
    # Third-party apps
    'django_crontab',
    'rest_framework',
    'drf_spectacular',
    'djoser',
    'rest_framework_simplejwt',
    'corsheaders',
    'channels',  # For WebSocket support
    
    # Development tools
    'debug_toolbar',
    'django_extensions',
    
    # Health checks
    'health_check',
    'health_check.db',
    'health_check.cache',
    'health_check.storage',
    
    # custom apps
    'authentication',
    'user_management',
    'internet_plans',
    'network_management',
    'payments',
    'support',
    'account',
    'dashboard',
    'otp_auth',
]

# Debug Toolbar Configuration
if DEBUG:
    INTERNAL_IPS = [
        '127.0.0.1',
        'localhost',
    ]
    
    # Add debug toolbar middleware
    MIDDLEWARE = [
        'debug_toolbar.middleware.DebugToolbarMiddleware',
        'django.middleware.security.SecurityMiddleware',
        'django.contrib.sessions.middleware.SessionMiddleware',
        'corsheaders.middleware.CorsMiddleware',
        'django.middleware.common.CommonMiddleware',
        'account.middleware.CustomCsrfMiddleware',
        'django.contrib.auth.middleware.AuthenticationMiddleware',
        'django.contrib.messages.middleware.MessageMiddleware',
        'django.middleware.clickjacking.XFrameOptionsMiddleware',
        'network_management.middleware.audit_middleware.RouterAuditMiddleware',
        'network_management.middleware.audit_middleware.AuditLogCleanupMiddleware',
    ]
else:
    MIDDLEWARE = [
        'django.middleware.security.SecurityMiddleware',
        'django.contrib.sessions.middleware.SessionMiddleware',
        'corsheaders.middleware.CorsMiddleware',
        'django.middleware.common.CommonMiddleware',
        'account.middleware.CustomCsrfMiddleware',
        'django.contrib.auth.middleware.AuthenticationMiddleware',
        'django.contrib.messages.middleware.MessageMiddleware',
        'django.middleware.clickjacking.XFrameOptionsMiddleware',
        'network_management.middleware.audit_middleware.RouterAuditMiddleware',
        'network_management.middleware.audit_middleware.AuditLogCleanupMiddleware',
    ]

SITE_ID = 1
AUTH_USER_MODEL = 'authentication.UserAccount'
AUTHENTICATION_BACKENDS = ['django.contrib.auth.backends.ModelBackend']

# =======================
# ✅ Twilio SendGrid Email Configuration
# =======================
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.sendgrid.net"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = "apikey"  # Required by SendGrid
EMAIL_HOST_PASSWORD = config("SENDGRID_API_KEY")  # Your API key from .env
DEFAULT_FROM_EMAIL = config("FROM_EMAIL", default="noreply06790n@gmail.com")

# =======================
# REST Framework Configuration
# =======================
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# DRF Spectacular Settings
SPECTACULAR_SETTINGS = {
    'TITLE': 'Network Management System API - DEVELOPMENT',
    'DESCRIPTION': 'Development API for managing network routers, users, and monitoring',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'SWAGGER_UI_SETTINGS': {
        'persistAuthorization': True,
        'displayRequestDuration': True,
    },
    'COMPONENT_SPLIT_REQUEST': True,
}

# JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# Djoser Settings
DJOSER = {
    'LOGIN_FIELD': 'email',
    'USER_CREATE_PASSWORD_RETYPE': True,
    'SET_USERNAME_RETYPE': True,
    'SET_PASSWORD_RETYPE': True,
    'PASSWORD_RESET_CONFIRM_URL': 'password/reset/confirm/{uid}/{token}/',
    'USERNAME_RESET_CONFIRM_URL': 'email/reset/confirm/{uid}/{token}/',
    'ACTIVATION_URL': 'activate/{uid}/{token}/',
    'SEND_ACTIVATION_EMAIL': True,
    'SEND_CONFIRMATION_EMAIL': True,
    'PASSWORD_CHANGED_EMAIL_CONFIRMATION': True,
    'USERNAME_CHANGED_EMAIL_CONFIRMATION': True,
    'HIDE_USERS': False,
    'PERMISSIONS': {
        'user': ['rest_framework.permissions.IsAuthenticated'],
        'user_list': ['rest_framework.permissions.IsAdminUser'],
    },
    'SERIALIZERS': {
        'user_create': 'authentication.serializers.DjoserUserCreateSerializer',
        'user': 'authentication.serializers.UserSerializer',
        'current_user': 'authentication.serializers.UserSerializer',
        'user_delete': 'djoser.serializers.UserDeleteSerializer',
    },
    'SET_STAFF_STATUS': False,
}

# =======================
# M-Pesa Configuration
# =======================
MPESA_ENCRYPTION_KEY = config('MPESA_ENCRYPTION_KEY', default=None)
if not MPESA_ENCRYPTION_KEY:
    raise ImproperlyConfigured("MPESA_ENCRYPTION_KEY is not set. Add it to your .env file.")

# =======================
# Redis Configuration for Development
# =======================
REDIS_HOST = config('REDIS_HOST', default='127.0.0.1')
REDIS_PORT = config('REDIS_PORT', default=6379, cast=int)
REDIS_DB = config('REDIS_DB', default=0, cast=int)
REDIS_PASSWORD = config('REDIS_PASSWORD', default=None)

# Build Redis URL and options conditionally
if REDIS_PASSWORD:
    REDIS_URL = f'redis://:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}'
else:
    REDIS_URL = f'redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}'

# =======================
# Redis Cache Configuration
# =======================
cache_options = {
    'CLIENT_CLASS': 'django_redis.client.DefaultClient',
    'SOCKET_CONNECT_TIMEOUT': 5,
    'SOCKET_TIMEOUT': 5,
    'RETRY_ON_TIMEOUT': True,
}

# Only add password to options if it's provided
if REDIS_PASSWORD:
    cache_options['PASSWORD'] = REDIS_PASSWORD

CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': f'redis://{REDIS_HOST}:{REDIS_PORT}/1',
        'OPTIONS': cache_options,
        'KEY_PREFIX': 'interlink',
        'TIMEOUT': 300,
    }
}

# Session Configuration with Redis
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

# =======================
# Celery Configuration with Redis
# =======================
CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'

CELERY_BEAT_SCHEDULE = {
    'check-data-usage-and-notify': {
        'task': 'analytics.tasks.check_data_usage_and_notify',
        'schedule': timedelta(hours=1),
    },
    'create-daily-analytics-snapshot': {
        'task': 'analytics.tasks.create_daily_analytics_snapshot',
        'schedule': crontab(hour=0, minute=0),
    },
    'send-payment-reminders': {
        'task': 'analytics.tasks.send_payment_reminders',
        'schedule': crontab(hour=9, minute=0),
    },
}

# =======================
# Channels Configuration for WebSockets with Redis
# =======================
ASGI_APPLICATION = 'interlink_logic.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [(REDIS_HOST, REDIS_PORT)],
            "capacity": 1500,
            "expiry": 10,
        },
    },
}

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

# =======================
# Templates & URLs
# =======================
ROOT_URLCONF = 'interlink_logic.urls'
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
WSGI_APPLICATION = 'interlink_logic.wsgi.application'

# =======================
# Database (MySQL)
# =======================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'OPTIONS': {"read_default_file": "/etc/mysql/my.cnf"},
    }
}

# =======================
# Static & Media Files
# =======================
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
    os.path.join(BASE_DIR, 'static/dashboard'),
    os.path.join(BASE_DIR, 'static/landing'),
]
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Debug Static Files Check
if DEBUG:
    print("\n=== Static Files Verification ===")
    print(f"BASE_DIR: {BASE_DIR}")
    print(f"STATIC_URL: {STATIC_URL}")
    print(f"STATIC_ROOT: {STATIC_ROOT}")
    for d in STATICFILES_DIRS:
        print(f" - {d} | Exists: {os.path.exists(d)}")

# =======================
# Misc
# =======================
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
LANGUAGE_CODE = 'en-us'
TIME_ZONE = config('TIME_ZONE', default='UTC')
USE_I18N = True
USE_TZ = True

SITE_DOMAIN = "localhost:8000"
BASE_URL = f"http://{SITE_DOMAIN}"

# Logging for development
if DEBUG:
    LOGGING = {
        'version': 1,
        'disable_existing_loggers': False,
        'handlers': {
            'console': {
                'level': 'DEBUG',
                'class': 'logging.StreamHandler',
            },
        },
        'root': {
            'handlers': ['console'],
            'level': 'INFO',
        },
    }