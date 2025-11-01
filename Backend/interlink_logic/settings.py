# from pathlib import Path
# from decouple import config
# from django.core.exceptions import ImproperlyConfigured
# from celery.schedules import crontab
# from datetime import timedelta
# from dotenv import load_dotenv
# load_dotenv()


# import os


# SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'default-insecure-secret-key')

# # Build paths inside the project like this: BASE_DIR / 'subdir'.
# BASE_DIR = Path(__file__).resolve().parent.parent

# # SECURITY WARNING: keep the secret key used in production secret!
# SECRET_KEY = config('SECRET_KEY')

# # SECURITY WARNING: don't run with debug turned on in production!
# DEBUG = config('DEBUG', cast=bool, default=False)

# ALLOWED_HOSTS = ['127.0.0.1', 'localhost', '0.0.0.0']

# # Application definition

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


# ENCRYPTED_FIELDS_KEYDIR = os.path.join(BASE_DIR, 'field_keys')

# MPESA_ENCRYPTION_KEY = config('MPESA_ENCRYPTION_KEY', default=None)
# if not MPESA_ENCRYPTION_KEY:
#     raise ImproperlyConfigured("MPESA_ENCRYPTION_KEY is not set. Add it to your environment or .env")



# SITE_ID = 1


# AUTH_USER_MODEL = 'authentication.UserAccount'

# AUTHENTICATION_BACKENDS = [
#     'django.contrib.auth.backends.ModelBackend',
# ]

# # Email Configuration
# # # App psswd => ziyh sivs ofiu vkwv
# EMAIL_BACKEND = config('EMAIL_BACKEND', default='django.core.mail.backends.smtp.EmailBackend')
# EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
# EMAIL_PORT = config('EMAIL_PORT', cast=int, default=587)
# EMAIL_USE_TLS = config('EMAIL_USE_TLS', cast=bool, default=True)
# EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='noreply06790n@gmail.com')
# EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='ziyhsivsofiuvkwv')

# # Rest Framework Configurations
# REST_FRAMEWORK = {
#      'DEFAULT_PERMISSION_CLASSES': [
#         'rest_framework.permissions.IsAuthenticated',  
#     ],
#     'DEFAULT_AUTHENTICATION_CLASSES': (
#         'rest_framework_simplejwt.authentication.JWTAuthentication',  
#     ),
#     'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
# }


# # SimpleJWT settings
# SIMPLE_JWT = {
#     'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
#     'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
#     'AUTH_HEADER_TYPES': ('Bearer',),
#     'USER_ID_FIELD': 'id',
#     'USER_ID_CLAIM': 'user_id',
# }




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

# AFRICAS_TALKING_USERNAME = 'your_username'
# AFRICAS_TALKING_API_KEY = 'your_api_key'


#  # Celery settings for Redis
# CELERY_BROKER_URL = 'redis://127.0.0.1:6379/0'  
# CELERY_RESULT_BACKEND = 'redis://127.0.0.1:6379/0'  
# CELERY_ACCEPT_CONTENT = ['json']
# CELERY_TASK_SERIALIZER = 'json'
# CELERY_RESULT_SERIALIZER = 'json'
# CELERY_TIMEZONE = 'UTC'  # Set timezone for Celery (adjust if needed)

# # Celery Beat schedule
# CELERY_BEAT_SCHEDULE = {
#     'check-data-usage-and-notify': {
#         'task': 'analytics.tasks.check_data_usage_and_notify',
#         'schedule': timedelta(hours=1),  # Run hourly
#     },
#     'create-daily-analytics-snapshot': {
#         'task': 'analytics.tasks.create_daily_analytics_snapshot',
#         'schedule': crontab(hour=0, minute=0),  # Run daily at midnight
#     },
#     'send-payment-reminders': {
#         'task': 'analytics.tasks.send_payment_reminders',
#         'schedule': crontab(hour=9, minute=0),  # Run daily at 9 AM
#     },
# }



# SITE_DOMAIN = "localhost:8000"
# BASE_URL = f"http://{SITE_DOMAIN}"


# MIDDLEWARE = [
#     'django.middleware.security.SecurityMiddleware',
#     'django.contrib.sessions.middleware.SessionMiddleware',
#     'corsheaders.middleware.CorsMiddleware',  
#     'django.middleware.common.CommonMiddleware',
#     'account.middleware.CustomCsrfMiddleware',  # Use the custom middleware
#     # 'django.middleware.csrf.CsrfViewMiddleware',
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

# # Database
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'OPTIONS': {
#             "read_default_file": "/etc/mysql/my.cnf",
#         },
#     }
# }

# # Redis
# CACHES = {
#     'default': {
#         'BACKEND': 'django_redis.cache.RedisCache',
#         'LOCATION': 'redis://127.0.0.1:6379/1',  
#         'OPTIONS': {
#             'CLIENT_CLASS': 'django_redis.client.DefaultClient',
#         }
#     }
# }

# # Password validation
# AUTH_PASSWORD_VALIDATORS = [
#     {
#         'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
#     },
# ]


# # Internationalization
# LANGUAGE_CODE = 'en-us'
# TIME_ZONE = config('TIME_ZONE', default='UTC')
# USE_I18N = True
# USE_L10N = True
# USE_TZ = True

# # # Logging Configuration
# # LOGGING = {
# #     'version': 1,
# #     'disable_existing_loggers': False,
# #     'handlers': {
# #         'file': {
# #             'level': 'DEBUG',
# #             'class': 'logging.FileHandler',
# #             'filename': os.path.join(BASE_DIR, 'debug.log'),
# #         },
# #     },
# #     'loggers': {
# #         'django': {
# #             'handlers': ['file'],
# #             'level': 'DEBUG',
# #             'propagate': True,
# #         },
# #     },
# # }

# # Default primary key field type
# DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'






# # Static files (CSS, JavaScript, Images)
# STATIC_URL = '/static/'  # Ensure this is the correct prefix for static files
# STATICFILES_DIRS = [
#     os.path.join(BASE_DIR, 'static'),  # General static files
#     os.path.join(BASE_DIR, 'static/dashboard'),  # Dashboard static files
#     os.path.join(BASE_DIR, 'static/landing'),  # Landing page static files
# ]
# STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')  # Where collectstatic will place files

# STATICFILES_FINDERS = [
#     'django.contrib.staticfiles.finders.FileSystemFinder',
#     'django.contrib.staticfiles.finders.AppDirectoriesFinder',
# ]

# # Media files
# MEDIA_URL = '/media/'
# MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# # Debugging for static files
# if DEBUG:
#     print("\n=== Static Files Verification ===")
#     print(f"BASE_DIR: {BASE_DIR}")
#     print(f"STATIC_URL: {STATIC_URL}")
#     print(f"STATIC_ROOT: {STATIC_ROOT}")
#     print("STATICFILES_DIRS:")
#     for static_dir in STATICFILES_DIRS:
#         print(f" - {static_dir}")
#         if os.path.exists(static_dir):
#             print(f"   Exists, Contents: {os.listdir(static_dir)}")
#         else:
#             print("   ⚠️ Directory does not exist!")

# # If you're sending cookies or authentication headers
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
DEBUG = config('DEBUG', cast=bool, default=False)
ALLOWED_HOSTS = ['127.0.0.1', 'localhost', '0.0.0.0']

# Installed Apps
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'django_crontab',
    'django_extensions',

    'authentication',
    'user_management',
    'internet_plans',
    'network_management',
    'payments',
    'support',
    'account',
    'dashboard',
    'otp_auth',

    'rest_framework',
    'drf_spectacular',
    'djoser',
    'rest_framework_simplejwt',
    'corsheaders',
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
# Celery and Redis Configuration
# =======================
CELERY_BROKER_URL = 'redis://127.0.0.1:6379/0'
CELERY_RESULT_BACKEND = 'redis://127.0.0.1:6379/0'
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
# Middleware & CORS
# =======================
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'account.middleware.CustomCsrfMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

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
# Redis Cache
# =======================
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {'CLIENT_CLASS': 'django_redis.client.DefaultClient'},
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
