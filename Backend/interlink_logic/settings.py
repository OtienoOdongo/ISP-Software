







# from pathlib import Path
# from decouple import config
# from django.core.exceptions import ImproperlyConfigured
# from celery.schedules import crontab
# from datetime import timedelta
# from dotenv import load_dotenv
# import os
# import sys
# import logging

# load_dotenv()

# # Build paths inside the project like this: BASE_DIR / 'subdir'.
# BASE_DIR = Path(__file__).resolve().parent.parent

# # ==============================================================================
# # ENVIRONMENT CONFIGURATION
# # ==============================================================================

# # Environment detection
# DEBUG = os.getenv('DJANGO_DEBUG', 'True').lower() == 'true'
# ENVIRONMENT = os.getenv('DJANGO_ENVIRONMENT', 'development')  # development, staging, production

# logger = logging.getLogger(__name__)

# def get_env_variable(var_name, default=None):
#     """Get environment variable or return default/exception."""
#     value = os.getenv(var_name, default)
#     if value is None and default is None:
#         raise ImproperlyConfigured(f"Set the {var_name} environment variable")
#     return value

# def deep_merge_dicts(base_dict, update_dict):
#     """Recursively merge two dictionaries."""
#     result = base_dict.copy()
#     for key, value in update_dict.items():
#         if isinstance(value, dict) and key in result and isinstance(result[key], dict):
#             result[key] = deep_merge_dicts(result[key], value)
#         else:
#             result[key] = value
#     return result

# def validate_mikrotik_config(config, environment):
#     """Validate MikroTik configuration for the current environment."""
#     errors = []
#     warnings = []
    
#     # Connection validation
#     timeout = config['CONNECTION']['TIMEOUT']
#     if environment == 'production' and timeout < 10:
#         warnings.append("Production timeout is less than 10 seconds")
    
#     # SSL validation
#     if environment == 'production' and not config['CONNECTION'].get('SSL_VERIFY', True):
#         errors.append("SSL verification must be enabled in production")
    
#     # Security validation for production
#     if environment == 'production':
#         if not config['CONNECTION'].get('SSL_CA_CERT_PATH'):
#             warnings.append("No SSL CA certificate path set in production")
    
#     # Log results
#     for error in errors:
#         logger.error(f"MikroTik Configuration Error [{environment}]: {error}")
    
#     for warning in warnings:
#         logger.warning(f"MikroTik Configuration Warning [{environment}]: {warning}")
    
#     if errors:
#         raise ImproperlyConfigured(f"MikroTik configuration has {len(errors)} error(s)")
    
#     if not warnings:
#         logger.info(f"MikroTik configuration validated successfully for {environment}")

# # ==============================================================================
# # DYNAMIC MIKROTIK CONFIGURATION
# # ==============================================================================

# # Base configuration - common to all environments
# MIKROTIK_BASE_CONFIG = {
#     # Connection Settings
#     'CONNECTION': {
#         'TIMEOUT': int(get_env_variable('MIKROTIK_TIMEOUT', '10')),
#         'MAX_RETRIES': int(get_env_variable('MIKROTIK_MAX_RETRIES', '3')),
#         'PORT': int(get_env_variable('MIKROTIK_PORT', '8728')),
#         'USE_SSL': get_env_variable('MIKROTIK_USE_SSL', 'False').lower() == 'true',
#     },
    
#     # Pool Management
#     'POOL': {
#         'MAX_CONNECTIONS': int(get_env_variable('MIKROTIK_POOL_MAX_CONNECTIONS', '5')),
#         'CLEANUP_INTERVAL': int(get_env_variable('MIKROTIK_POOL_CLEANUP_INTERVAL', '300')),
#         'CACHE_TIMEOUT': int(get_env_variable('MIKROTIK_CACHE_TIMEOUT', '300')),
#     },
    
#     # Hotspot Defaults
#     'HOTSPOT': {
#         'IP_POOL': get_env_variable('MIKROTIK_HOTSPOT_IP_POOL', '192.168.100.10-192.168.100.200'),
#         'BANDWIDTH_LIMIT': get_env_variable('MIKROTIK_HOTSPOT_BANDWIDTH_LIMIT', '10M/10M'),
#         'SESSION_TIMEOUT': int(get_env_variable('MIKROTIK_HOTSPOT_SESSION_TIMEOUT', '60')),
#         'MAX_USERS': int(get_env_variable('MIKROTIK_HOTSPOT_MAX_USERS', '50')),
#         'DEFAULT_SSID': get_env_variable('MIKROTIK_HOTSPOT_SSID', 'SurfZone-WiFi'),
#     },
    
#     # PPPoE Defaults
#     'PPPOE': {
#         'IP_POOL_NAME': get_env_variable('MIKROTIK_PPPOE_IP_POOL_NAME', 'pppoe-pool'),
#         'IP_RANGE': get_env_variable('MIKROTIK_PPPOE_IP_RANGE', '192.168.101.10-192.168.101.200'),
#         'BANDWIDTH_LIMIT': get_env_variable('MIKROTIK_PPPOE_BANDWIDTH_LIMIT', '10M/10M'),
#         'MTU': int(get_env_variable('MIKROTIK_PPPOE_MTU', '1492')),
#     },
# }

# # Environment-specific overrides
# MIKROTIK_ENVIRONMENT_CONFIGS = {
#     'development': {
#         'CONNECTION': {
#             'SSL_VERIFY': False,
#             'TIMEOUT': 5,  # Faster failures in development
#         },
#         'MONITORING': {
#             'ENABLED': False,  # Disable monitoring in dev
#             'MAX_RESPONSE_TIME_ALERT': 10.0,  # More lenient in dev
#         },
#         'LOGGING': {
#             'LEVEL': 'DEBUG',
#             'SAVE_CONNECTION_TESTS': False,  # Don't clutter DB in dev
#         }
#     },
    
#     'staging': {
#         'CONNECTION': {
#             'SSL_VERIFY': True,
#             'TIMEOUT': 10,
#         },
#         'MONITORING': {
#             'ENABLED': True,
#             'MAX_RESPONSE_TIME_ALERT': 5.0,
#         },
#         'LOGGING': {
#             'LEVEL': 'INFO',
#             'SAVE_CONNECTION_TESTS': True,
#         }
#     },
    
#     'production': {
#         'CONNECTION': {
#             'SSL_VERIFY': True,
#             'TIMEOUT': 15,  # More patience for production
#             'SSL_CA_CERT_PATH': '/etc/ssl/certs/ca-certificates.crt',
#         },
#         'MONITORING': {
#             'ENABLED': True,
#             'MAX_RESPONSE_TIME_ALERT': 3.0,  # Stricter in production
#             'CONNECTION_SUCCESS_THRESHOLD': 0.9,  # 90% success rate required
#         },
#         'SECURITY': {
#             'VALIDATE_CREDENTIALS': True,
#             'REJECT_DEFAULT_PASSWORDS': True,
#         },
#         'LOGGING': {
#             'LEVEL': 'WARNING',
#             'SAVE_CONNECTION_TESTS': True,
#         }
#     }
# }

# # Merge base config with environment-specific config
# environment_config = MIKROTIK_ENVIRONMENT_CONFIGS.get(ENVIRONMENT, {})
# MIKROTIK_CONFIG = deep_merge_dicts(MIKROTIK_BASE_CONFIG, environment_config)

# # Final configuration validation
# try:
#     validate_mikrotik_config(MIKROTIK_CONFIG, ENVIRONMENT)
# except ImproperlyConfigured as e:
#     if ENVIRONMENT == 'production':
#         raise
#     else:
#         logger.warning(f"MikroTik config validation warning: {e}")

# # ==============================================================================
# # SECURITY & BASIC DJANGO CONFIGURATION
# # ==============================================================================

# SECRET_KEY = config('SECRET_KEY', default='default-insecure-secret-key-for-development')
# ALLOWED_HOSTS = ['127.0.0.1', 'localhost', '0.0.0.0']

# # Add production domain if in production
# if ENVIRONMENT == 'production':
#     production_domain = get_env_variable('PRODUCTION_DOMAIN', None)
#     if production_domain:
#         ALLOWED_HOSTS.append(production_domain)

# ENABLE_WEBSOCKETS = True

# # ==============================================================================
# # APPLICATION CONFIGURATION
# # ==============================================================================

# INSTALLED_APPS = [
#     'django.contrib.admin',
#     'django.contrib.auth',
#     'django.contrib.contenttypes',
#     'django.contrib.sessions',
#     'django.contrib.messages',
#     'django.contrib.staticfiles',
#     'django.contrib.sites',
    
#     # Third-party apps
#     'django_crontab',
#     'rest_framework',
#     'drf_spectacular',
#     'djoser',
#     'rest_framework_simplejwt',
#     'corsheaders',
#     'channels',  # For WebSocket support
    
#     # Development tools (only in development)
#     'debug_toolbar',
#     'django_extensions',
    
#     # Health checks
#     'health_check',
#     'health_check.db',
#     'health_check.cache',
#     'health_check.storage',
    
#     # Custom apps
#     'authentication',
#     'user_management',
#     'internet_plans',
#     'network_management',
#     'payments',
#     'support',
#     'account',
#     'dashboard',
#     'otp_auth',
# ]

# # Remove development apps in production
# if ENVIRONMENT == 'production':
#     INSTALLED_APPS.remove('debug_toolbar')
#     INSTALLED_APPS.remove('django_extensions')

# # ==============================================================================
# # MIDDLEWARE CONFIGURATION
# # ==============================================================================

# MIDDLEWARE = [
#     'payments.middleware.cors.CorsMiddleware',
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

# # Add debug toolbar middleware in development
# if DEBUG and ENVIRONMENT == 'development':
#     MIDDLEWARE.insert(0, 'debug_toolbar.middleware.DebugToolbarMiddleware')
#     MIDDLEWARE.insert(0, 'payments.middleware.cors.CorsMiddleware')

# SITE_ID = 1
# AUTH_USER_MODEL = 'authentication.UserAccount'
# AUTHENTICATION_BACKENDS = ['django.contrib.auth.backends.ModelBackend']

# # ==============================================================================
# # PAYMENT & EMAIL CONFIGURATION
# # ==============================================================================

# PAYMENT_APP_BASE_URL = config('PAYMENT_APP_BASE_URL', default='http://localhost:8000')
# BASE_URL = config('BASE_URL', default='http://localhost:8000')

# # Email Configuration
# EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
# EMAIL_HOST = "smtp.sendgrid.net"
# EMAIL_PORT = 587
# EMAIL_USE_TLS = True
# EMAIL_HOST_USER = "apikey"
# EMAIL_HOST_PASSWORD = config("SENDGRID_API_KEY", default="")  # Optional in development
# DEFAULT_FROM_EMAIL = config("FROM_EMAIL", default="noreply@yourdomain.com")

# # M-Pesa Configuration
# MPESA_ENCRYPTION_KEY = config('MPESA_ENCRYPTION_KEY', default=None)
# if ENVIRONMENT == 'production' and not MPESA_ENCRYPTION_KEY:
#     raise ImproperlyConfigured("MPESA_ENCRYPTION_KEY is required in production")

# # ==============================================================================
# # REST FRAMEWORK & API CONFIGURATION
# # ==============================================================================

# REST_FRAMEWORK = {
#     'DEFAULT_PERMISSION_CLASSES': [
#         'rest_framework.permissions.IsAuthenticated',
#     ],
#     'DEFAULT_AUTHENTICATION_CLASSES': (
#         'rest_framework_simplejwt.authentication.JWTAuthentication',
#     ),
#     'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
# }

# # DRF Spectacular Settings
# SPECTACULAR_SETTINGS = {
#     'TITLE': f'Network Management System API - {ENVIRONMENT.upper()}',
#     'DESCRIPTION': f'{ENVIRONMENT.title()} API for managing network routers, users, and monitoring',
#     'VERSION': '1.0.0',
#     'SERVE_INCLUDE_SCHEMA': False,
#     'SWAGGER_UI_SETTINGS': {
#         'persistAuthorization': True,
#         'displayRequestDuration': True,
#     },
#     'COMPONENT_SPLIT_REQUEST': True,
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

# # ==============================================================================
# # REDIS & CACHE CONFIGURATION
# # ==============================================================================

# REDIS_HOST = config('REDIS_HOST', default='127.0.0.1')
# REDIS_PORT = config('REDIS_PORT', default=6379, cast=int)
# REDIS_DB = config('REDIS_DB', default=0, cast=int)
# REDIS_PASSWORD = config('REDIS_PASSWORD', default=None)

# # Build Redis URL and options conditionally
# if REDIS_PASSWORD:
#     REDIS_URL = f'redis://:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}'
# else:
#     REDIS_URL = f'redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}'

# # Cache Configuration
# cache_options = {
#     'CLIENT_CLASS': 'django_redis.client.DefaultClient',
#     'SOCKET_CONNECT_TIMEOUT': 5,
#     'SOCKET_TIMEOUT': 5,
#     'RETRY_ON_TIMEOUT': True,
# }

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

# # Session Configuration with Redis
# SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
# SESSION_CACHE_ALIAS = 'default'

# # ==============================================================================
# # CELERY CONFIGURATION
# # ==============================================================================

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
#     # MikroTik monitoring tasks
#     'monitor-router-health': {
#         'task': 'network_management.tasks.monitor_router_health',
#         'schedule': timedelta(minutes=5) if ENVIRONMENT == 'production' else timedelta(minutes=10),
#     },
#     'cleanup-connection-pools': {
#         'task': 'network_management.tasks.cleanup_connection_pools',
#         'schedule': timedelta(minutes=30),
#     },
# }

# # ==============================================================================
# # CHANNELS & WEBSOCKETS CONFIGURATION
# # ==============================================================================

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

# # ==============================================================================
# # CORS CONFIGURATION
# # ==============================================================================

# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:8000",
#     "http://127.0.0.1:8000",
#     "http://127.0.0.1:5173",
#     "http://localhost:5173",
#     "http://localhost:5174",
#     "http://127.0.0.1:5174",
# ]

# # Add production domains if in production
# if ENVIRONMENT == 'production':
#     production_frontend = get_env_variable('PRODUCTION_FRONTEND_URL', None)
#     if production_frontend:
#         CORS_ALLOWED_ORIGINS.append(production_frontend)

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

# # ==============================================================================
# # TEMPLATES & URL CONFIGURATION
# # ==============================================================================

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

# # ==============================================================================
# # DATABASE CONFIGURATION
# # ==============================================================================

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'OPTIONS': {"read_default_file": "/etc/mysql/my.cnf"},
#     }
# }

# # Optional: Environment-specific database overrides
# if ENVIRONMENT == 'production':
#     DATABASES['default']['OPTIONS'] = {
#         'read_default_file': '/etc/mysql/my.cnf',
#         'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
#     }

# # ==============================================================================
# # STATIC & MEDIA FILES
# # ==============================================================================

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
#     print(f"\n=== Environment: {ENVIRONMENT.upper()} ===")
#     print(f"=== Static Files Verification ===")
#     print(f"BASE_DIR: {BASE_DIR}")
#     print(f"STATIC_URL: {STATIC_URL}")
#     print(f"STATIC_ROOT: {STATIC_ROOT}")
#     for d in STATICFILES_DIRS:
#         print(f" - {d} | Exists: {os.path.exists(d)}")

# # ==============================================================================
# # MISC DJANGO SETTINGS
# # ==============================================================================

# DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
# LANGUAGE_CODE = 'en-us'
# TIME_ZONE = config('TIME_ZONE', default='UTC')
# USE_I18N = True
# USE_TZ = True

# SITE_DOMAIN = "localhost:8000"
# BASE_URL = f"http://{SITE_DOMAIN}"

# # Debug Toolbar Configuration
# if DEBUG and ENVIRONMENT == 'development':
#     INTERNAL_IPS = [
#         '127.0.0.1',
#         'localhost',
#     ]

# # ==============================================================================
# # LOGGING CONFIGURATION
# # ==============================================================================

# LOGGING = {
#     'version': 1,
#     'disable_existing_loggers': False,
#     'formatters': {
#         'verbose': {
#             'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
#             'style': '{',
#         },
#         'simple': {
#             'format': '{levelname} {message}',
#             'style': '{',
#         },
#     },
#     'handlers': {
#         'console': {
#             'level': 'DEBUG' if DEBUG else 'INFO',
#             'class': 'logging.StreamHandler',
#             'formatter': 'simple',
#         },
#         'file': {
#             'level': 'INFO',
#             'class': 'logging.FileHandler',
#             'filename': os.path.join(BASE_DIR, 'logs/django.log'),
#             'formatter': 'verbose',
#         },
#     },
#     'root': {
#         'handlers': ['console'],
#         'level': 'DEBUG' if DEBUG else 'INFO',
#     },
#     'loggers': {
#         'network_management': {
#             'handlers': ['console', 'file'],
#             'level': MIKROTIK_CONFIG['LOGGING']['LEVEL'],
#             'propagate': False,
#         },
#         'django': {
#             'handlers': ['console'],
#             'level': 'INFO',
#             'propagate': False,
#         },
#     },
# }

# # Create logs directory if it doesn't exist
# logs_dir = os.path.join(BASE_DIR, 'logs')
# os.makedirs(logs_dir, exist_ok=True)

# # ==============================================================================
# # FINAL ENVIRONMENT LOGGING
# # ==============================================================================

# print(f"\n✅ Django settings loaded successfully!")
# print(f"✅ Environment: {ENVIRONMENT}")
# print(f"✅ Debug mode: {DEBUG}")
# print(f"✅ MikroTik monitoring: {MIKROTIK_CONFIG['MONITORING']['ENABLED']}")
# print(f"✅ WebSockets enabled: {ENABLE_WEBSOCKETS}")
# print(f"✅ Redis: {REDIS_HOST}:{REDIS_PORT}")








# from pathlib import Path
# from decouple import config
# from django.core.exceptions import ImproperlyConfigured
# from celery.schedules import crontab
# from datetime import timedelta
# from dotenv import load_dotenv
# import os
# import sys
# import logging

# load_dotenv()

# # Build paths inside the project like this: BASE_DIR / 'subdir'.
# BASE_DIR = Path(__file__).resolve().parent.parent

# # ==============================================================================
# # ENVIRONMENT CONFIGURATION
# # ==============================================================================

# # Environment detection
# DEBUG = os.getenv('DJANGO_DEBUG', 'True').lower() == 'true'
# ENVIRONMENT = os.getenv('DJANGO_ENVIRONMENT', 'development')  # development, staging, production

# logger = logging.getLogger(__name__)

# def get_env_variable(var_name, default=None):
#     """Get environment variable or return default/exception."""
#     value = os.getenv(var_name, default)
#     if value is None and default is None:
#         raise ImproperlyConfigured(f"Set the {var_name} environment variable")
#     return value

# def deep_merge_dicts(base_dict, update_dict):
#     """Recursively merge two dictionaries."""
#     result = base_dict.copy()
#     for key, value in update_dict.items():
#         if isinstance(value, dict) and key in result and isinstance(result[key], dict):
#             result[key] = deep_merge_dicts(result[key], value)
#         else:
#             result[key] = value
#     return result

# def validate_mikrotik_config(config, environment):
#     """Validate MikroTik configuration for the current environment."""
#     errors = []
#     warnings = []
    
#     # Connection validation
#     timeout = config['CONNECTION']['TIMEOUT']
#     if environment == 'production' and timeout < 10:
#         warnings.append("Production timeout is less than 10 seconds")
    
#     # SSL validation
#     if environment == 'production' and not config['CONNECTION'].get('SSL_VERIFY', True):
#         errors.append("SSL verification must be enabled in production")
    
#     # Security validation for production
#     if environment == 'production':
#         if not config['CONNECTION'].get('SSL_CA_CERT_PATH'):
#             warnings.append("No SSL CA certificate path set in production")
    
#     # Log results
#     for error in errors:
#         logger.error(f"MikroTik Configuration Error [{environment}]: {error}")
    
#     for warning in warnings:
#         logger.warning(f"MikroTik Configuration Warning [{environment}]: {warning}")
    
#     if errors:
#         raise ImproperlyConfigured(f"MikroTik configuration has {len(errors)} error(s)")
    
#     if not warnings:
#         logger.info(f"MikroTik configuration validated successfully for {environment}")

# # ==============================================================================
# # DYNAMIC MIKROTIK CONFIGURATION
# # ==============================================================================

# # Base configuration - common to all environments
# MIKROTIK_BASE_CONFIG = {
#     # Connection Settings
#     'CONNECTION': {
#         'TIMEOUT': int(get_env_variable('MIKROTIK_TIMEOUT', '10')),
#         'MAX_RETRIES': int(get_env_variable('MIKROTIK_MAX_RETRIES', '3')),
#         'PORT': int(get_env_variable('MIKROTIK_PORT', '8728')),
#         'USE_SSL': get_env_variable('MIKROTIK_USE_SSL', 'False').lower() == 'true',
#     },
    
#     # Pool Management
#     'POOL': {
#         'MAX_CONNECTIONS': int(get_env_variable('MIKROTIK_POOL_MAX_CONNECTIONS', '5')),
#         'CLEANUP_INTERVAL': int(get_env_variable('MIKROTIK_POOL_CLEANUP_INTERVAL', '300')),
#         'CACHE_TIMEOUT': int(get_env_variable('MIKROTIK_CACHE_TIMEOUT', '300')),
#     },
    
#     # Hotspot Defaults
#     'HOTSPOT': {
#         'IP_POOL': get_env_variable('MIKROTIK_HOTSPOT_IP_POOL', '192.168.100.10-192.168.100.200'),
#         'BANDWIDTH_LIMIT': get_env_variable('MIKROTIK_HOTSPOT_BANDWIDTH_LIMIT', '10M/10M'),
#         'SESSION_TIMEOUT': int(get_env_variable('MIKROTIK_HOTSPOT_SESSION_TIMEOUT', '60')),
#         'MAX_USERS': int(get_env_variable('MIKROTIK_HOTSPOT_MAX_USERS', '50')),
#         'DEFAULT_SSID': get_env_variable('MIKROTIK_HOTSPOT_SSID', 'SurfZone-WiFi'),
#     },
    
#     # PPPoE Defaults
#     'PPPOE': {
#         'IP_POOL_NAME': get_env_variable('MIKROTIK_PPPOE_IP_POOL_NAME', 'pppoe-pool'),
#         'IP_RANGE': get_env_variable('MIKROTIK_PPPOE_IP_RANGE', '192.168.101.10-192.168.101.200'),
#         'BANDWIDTH_LIMIT': get_env_variable('MIKROTIK_PPPOE_BANDWIDTH_LIMIT', '10M/10M'),
#         'MTU': int(get_env_variable('MIKROTIK_PPPOE_MTU', '1492')),
#     },
# }

# # Environment-specific overrides
# MIKROTIK_ENVIRONMENT_CONFIGS = {
#     'development': {
#         'CONNECTION': {
#             'SSL_VERIFY': False,
#             'TIMEOUT': 5,  # Faster failures in development
#         },
#         'MONITORING': {
#             'ENABLED': False,  # Disable monitoring in dev
#             'MAX_RESPONSE_TIME_ALERT': 10.0,  # More lenient in dev
#         },
#         'LOGGING': {
#             'LEVEL': 'DEBUG',
#             'SAVE_CONNECTION_TESTS': False,  # Don't clutter DB in dev
#         }
#     },
    
#     'staging': {
#         'CONNECTION': {
#             'SSL_VERIFY': True,
#             'TIMEOUT': 10,
#         },
#         'MONITORING': {
#             'ENABLED': True,
#             'MAX_RESPONSE_TIME_ALERT': 5.0,
#         },
#         'LOGGING': {
#             'LEVEL': 'INFO',
#             'SAVE_CONNECTION_TESTS': True,
#         }
#     },
    
#     'production': {
#         'CONNECTION': {
#             'SSL_VERIFY': True,
#             'TIMEOUT': 15,  # More patience for production
#             'SSL_CA_CERT_PATH': '/etc/ssl/certs/ca-certificates.crt',
#         },
#         'MONITORING': {
#             'ENABLED': True,
#             'MAX_RESPONSE_TIME_ALERT': 3.0,  # Stricter in production
#             'CONNECTION_SUCCESS_THRESHOLD': 0.9,  # 90% success rate required
#         },
#         'SECURITY': {
#             'VALIDATE_CREDENTIALS': True,
#             'REJECT_DEFAULT_PASSWORDS': True,
#         },
#         'LOGGING': {
#             'LEVEL': 'WARNING',
#             'SAVE_CONNECTION_TESTS': True,
#         }
#     }
# }

# # Merge base config with environment-specific config
# environment_config = MIKROTIK_ENVIRONMENT_CONFIGS.get(ENVIRONMENT, {})
# MIKROTIK_CONFIG = deep_merge_dicts(MIKROTIK_BASE_CONFIG, environment_config)

# # Final configuration validation
# try:
#     validate_mikrotik_config(MIKROTIK_CONFIG, ENVIRONMENT)
# except ImproperlyConfigured as e:
#     if ENVIRONMENT == 'production':
#         raise
#     else:
#         logger.warning(f"MikroTik config validation warning: {e}")

# # ==============================================================================
# # SECURITY & BASIC DJANGO CONFIGURATION
# # ==============================================================================

# SECRET_KEY = config('SECRET_KEY', default='default-insecure-secret-key-for-development')

# # FIXED: Enhanced allowed hosts for WebSocket support
# ALLOWED_HOSTS = [
#     '127.0.0.1', 
#     'localhost', 
#     '0.0.0.0',
#     'backend',  # For Docker compatibility
# ]

# # Add production domain if in production
# if ENVIRONMENT == 'production':
#     production_domain = get_env_variable('PRODUCTION_DOMAIN', None)
#     if production_domain:
#         ALLOWED_HOSTS.append(production_domain)
#         # Also add without port for WebSocket connections
#         ALLOWED_HOSTS.append(production_domain.split(':')[0])

# ENABLE_WEBSOCKETS = True

# # ==============================================================================
# # APPLICATION CONFIGURATION
# # ==============================================================================

# INSTALLED_APPS = [
#     'django.contrib.admin',
#     'django.contrib.auth',
#     'django.contrib.contenttypes',
#     'django.contrib.sessions',
#     'django.contrib.messages',
#     'django.contrib.staticfiles',
#     'django.contrib.sites',
    
#     # Third-party apps
#     'django_crontab',
#     'rest_framework',
#     'drf_spectacular',
#     'djoser',
#     'rest_framework_simplejwt',
#     'corsheaders',
#     'channels',  # For WebSocket support
    
#     # Development tools (only in development)
#     'debug_toolbar',
#     'django_extensions',
    
#     # Health checks
#     'health_check',
#     'health_check.db',
#     'health_check.cache',
#     'health_check.storage',
    
#     # Custom apps
#     'authentication',
#     'user_management',
#     'internet_plans',
#     'network_management',
#     'payments',
#     'support',
#     'account',
#     'dashboard',
#     'otp_auth',
# ]

# # Remove development apps in production
# if ENVIRONMENT == 'production':
#     if 'debug_toolbar' in INSTALLED_APPS:
#         INSTALLED_APPS.remove('debug_toolbar')
#     if 'django_extensions' in INSTALLED_APPS:
#         INSTALLED_APPS.remove('django_extensions')

# # ==============================================================================
# # MIDDLEWARE CONFIGURATION
# # ==============================================================================

# MIDDLEWARE = [
#     'corsheaders.middleware.CorsMiddleware',  
#     'payments.middleware.cors.CorsMiddleware',
#     'django.middleware.security.SecurityMiddleware',
#     'django.contrib.sessions.middleware.SessionMiddleware',
#     'django.middleware.common.CommonMiddleware',
#     'account.middleware.CustomCsrfMiddleware',
#     'django.contrib.auth.middleware.AuthenticationMiddleware',
#     'django.contrib.messages.middleware.MessageMiddleware',
#     'django.middleware.clickjacking.XFrameOptionsMiddleware',
#     'network_management.middleware.audit_middleware.RouterAuditMiddleware',
#     'network_management.middleware.audit_middleware.AuditLogCleanupMiddleware',
# ]

# # Add debug toolbar middleware in development
# if DEBUG and ENVIRONMENT == 'development':
#     MIDDLEWARE.insert(0, 'debug_toolbar.middleware.DebugToolbarMiddleware')

# SITE_ID = 1
# AUTH_USER_MODEL = 'authentication.UserAccount'
# AUTHENTICATION_BACKENDS = ['django.contrib.auth.backends.ModelBackend']

# # ==============================================================================
# # PAYMENT & EMAIL CONFIGURATION
# # ==============================================================================

# PAYMENT_APP_BASE_URL = config('PAYMENT_APP_BASE_URL', default='http://localhost:8000')
# BASE_URL = config('BASE_URL', default='http://localhost:8000')

# # Email Configuration
# EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
# EMAIL_HOST = "smtp.sendgrid.net"
# EMAIL_PORT = 587
# EMAIL_USE_TLS = True
# EMAIL_HOST_USER = "apikey"
# EMAIL_HOST_PASSWORD = config("SENDGRID_API_KEY", default="")  # Optional in development
# DEFAULT_FROM_EMAIL = config("FROM_EMAIL", default="noreply@yourdomain.com")

# # M-Pesa Configuration
# MPESA_ENCRYPTION_KEY = config('MPESA_ENCRYPTION_KEY', default=None)
# if ENVIRONMENT == 'production' and not MPESA_ENCRYPTION_KEY:
#     raise ImproperlyConfigured("MPESA_ENCRYPTION_KEY is required in production")

# # ==============================================================================
# # REST FRAMEWORK & API CONFIGURATION
# # ==============================================================================

# REST_FRAMEWORK = {
#     'DEFAULT_PERMISSION_CLASSES': [
#         'rest_framework.permissions.IsAuthenticated',
#     ],
#     'DEFAULT_AUTHENTICATION_CLASSES': (
#         'rest_framework_simplejwt.authentication.JWTAuthentication',
#     ),
#     'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
#     'DEFAULT_RENDERER_CLASSES': [
#         'rest_framework.renderers.JSONRenderer',
#     ],
#     'DEFAULT_PARSER_CLASSES': [
#         'rest_framework.parsers.JSONParser',
#         'rest_framework.parsers.MultiPartParser',
#         'rest_framework.parsers.FormParser',
#     ],
#     'EXCEPTION_HANDLER': 'rest_framework.views.exception_handler',
#     'DEFAULT_TIMEOUT': 30,  # FIXED: Added global timeout
# }

# # DRF Spectacular Settings
# SPECTACULAR_SETTINGS = {
#     'TITLE': f'Network Management System API - {ENVIRONMENT.upper()}',
#     'DESCRIPTION': f'{ENVIRONMENT.title()} API for managing network routers, users, and monitoring',
#     'VERSION': '1.0.0',
#     'SERVE_INCLUDE_SCHEMA': False,
#     'SWAGGER_UI_SETTINGS': {
#         'persistAuthorization': True,
#         'displayRequestDuration': True,
#     },
#     'COMPONENT_SPLIT_REQUEST': True,
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

# # ==============================================================================
# # REDIS & CACHE CONFIGURATION
# # ==============================================================================

# REDIS_HOST = config('REDIS_HOST', default='127.0.0.1')
# REDIS_PORT = config('REDIS_PORT', default=6379, cast=int)
# REDIS_DB = config('REDIS_DB', default=0, cast=int)
# REDIS_PASSWORD = config('REDIS_PASSWORD', default=None)

# # Build Redis URL and options conditionally
# if REDIS_PASSWORD:
#     REDIS_URL = f'redis://:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}'
# else:
#     REDIS_URL = f'redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}'

# # Cache Configuration
# cache_options = {
#     'CLIENT_CLASS': 'django_redis.client.DefaultClient',
#     'SOCKET_CONNECT_TIMEOUT': 5,
#     'SOCKET_TIMEOUT': 5,
#     'RETRY_ON_TIMEOUT': True,
# }

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

# # Session Configuration with Redis
# SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
# SESSION_CACHE_ALIAS = 'default'

# # ==============================================================================
# # CELERY CONFIGURATION
# # ==============================================================================

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
#     # MikroTik monitoring tasks
#     'monitor-router-health': {
#         'task': 'network_management.tasks.monitor_router_health',
#         'schedule': timedelta(minutes=5) if ENVIRONMENT == 'production' else timedelta(minutes=10),
#     },
#     'cleanup-connection-pools': {
#         'task': 'network_management.tasks.cleanup_connection_pools',
#         'schedule': timedelta(minutes=30),
#     },
# }

# # ==============================================================================
# # CHANNELS & WEBSOCKETS CONFIGURATION - FIXED
# # ==============================================================================

# ASGI_APPLICATION = 'interlink_logic.asgi.application'

# # FIXED: Proper Channels configuration with Redis
# CHANNEL_LAYERS = {
#     'default': {
#         'BACKEND': 'channels_redis.core.RedisChannelLayer',
#         'CONFIG': {
#             "hosts": [(REDIS_HOST, REDIS_PORT)],
#             "capacity": 1500,  # default 100
#             "expiry": 10,  # default 60
#         },
#     },
# }

# # ==============================================================================
# # CORS CONFIGURATION - FIXED for WebSocket support
# # ==============================================================================

# # FIXED: Enhanced CORS configuration for WebSocket support
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:8000",
#     "http://127.0.0.1:8000",
#     "http://127.0.0.1:5173",
#     "http://localhost:5173",
#     "http://localhost:5174",
#     "http://127.0.0.1:5174",
#     "ws://localhost:8000",  # FIXED: Added WebSocket origins
#     "ws://127.0.0.1:8000",
#     "ws://localhost:5173",
#     "ws://127.0.0.1:5173",
# ]

# # Add production domains if in production
# if ENVIRONMENT == 'production':
#     production_frontend = get_env_variable('PRODUCTION_FRONTEND_URL', None)
#     if production_frontend:
#         CORS_ALLOWED_ORIGINS.append(production_frontend)
#         # Add WebSocket version
#         CORS_ALLOWED_ORIGINS.append(production_frontend.replace('http://', 'ws://').replace('https://', 'wss://'))

# CORS_ALLOW_CREDENTIALS = True
# CORS_ALLOW_METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
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
#     "x-access-token",
#     "sec-websocket-protocol",  # FIXED: Added WebSocket headers
#     "sec-websocket-key",
#     "sec-websocket-version",
#     "sec-websocket-extensions",
# ]

# # FIXED: CSRF trusted origins for WebSocket connections
# CSRF_TRUSTED_ORIGINS = [
#     'http://localhost:8000',
#     'http://127.0.0.1:8000',
#     'http://localhost:5173',
#     'http://127.0.0.1:5173',
#     'ws://localhost:8000',  # FIXED: Added WebSocket origins
#     'ws://127.0.0.1:8000',
# ]

# if ENVIRONMENT == 'production':
#     production_domain = get_env_variable('PRODUCTION_DOMAIN', None)
#     if production_domain:
#         CSRF_TRUSTED_ORIGINS.extend([
#             f'https://{production_domain}',
#             f'wss://{production_domain}'
#         ])

# # ==============================================================================
# # TEMPLATES & URL CONFIGURATION
# # ==============================================================================

# ROOT_URLCONF = 'interlink_logic.urls'
# TEMPLATES = [
#     {
#         'BACKEND': 'django.template.backends.django.DjangoTemplates',
#         'DIRS': [os.path.join(BASE_DIR, 'templates')],  # Added templates directory
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

# # ==============================================================================
# # DATABASE CONFIGURATION
# # ==============================================================================

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'OPTIONS': {"read_default_file": "/etc/mysql/my.cnf"},
#     }
# }

# # Optional: Environment-specific database overrides
# if ENVIRONMENT == 'production':
#     DATABASES['default']['OPTIONS'] = {
#         'read_default_file': '/etc/mysql/my.cnf',
#         'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
#     }

# # ==============================================================================
# # STATIC & MEDIA FILES
# # ==============================================================================

# STATIC_URL = '/static/'
# STATICFILES_DIRS = [
#     os.path.join(BASE_DIR, 'static'),
#     os.path.join(BASE_DIR, 'static/dashboard'),
#     os.path.join(BASE_DIR, 'static/landing'),
# ]
# STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
# MEDIA_URL = '/media/'
# MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# # Create templates directory if it doesn't exist
# templates_dir = os.path.join(BASE_DIR, 'templates')
# os.makedirs(templates_dir, exist_ok=True)

# # Debug Static Files Check
# if DEBUG:
#     print(f"\n=== Environment: {ENVIRONMENT.upper()} ===")
#     print(f"=== Static Files Verification ===")
#     print(f"BASE_DIR: {BASE_DIR}")
#     print(f"STATIC_URL: {STATIC_URL}")
#     print(f"STATIC_ROOT: {STATIC_ROOT}")
#     for d in STATICFILES_DIRS:
#         print(f" - {d} | Exists: {os.path.exists(d)}")

# # ==============================================================================
# # MISC DJANGO SETTINGS
# # ==============================================================================

# DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
# LANGUAGE_CODE = 'en-us'
# TIME_ZONE = config('TIME_ZONE', default='UTC')
# USE_I18N = True
# USE_TZ = True

# SITE_DOMAIN = "localhost:8000"
# BASE_URL = f"http://{SITE_DOMAIN}"

# # Debug Toolbar Configuration
# if DEBUG and ENVIRONMENT == 'development':
#     INTERNAL_IPS = [
#         '127.0.0.1',
#         'localhost',
#     ]

# # ==============================================================================
# # LOGGING CONFIGURATION
# # ==============================================================================

# LOGGING = {
#     'version': 1,
#     'disable_existing_loggers': False,
#     'formatters': {
#         'verbose': {
#             'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
#             'style': '{',
#         },
#         'simple': {
#             'format': '{levelname} {message}',
#             'style': '{',
#         },
#         'websocket': {
#             'format': '{levelname} {asctime} [WebSocket] {message}',
#             'style': '{',
#         },
#     },
#     'handlers': {
#         'console': {
#             'level': 'DEBUG' if DEBUG else 'INFO',
#             'class': 'logging.StreamHandler',
#             'formatter': 'simple',
#         },
#         'file': {
#             'level': 'INFO',
#             'class': 'logging.FileHandler',
#             'filename': os.path.join(BASE_DIR, 'logs/django.log'),
#             'formatter': 'verbose',
#         },
#         'websocket_file': {
#             'level': 'DEBUG',
#             'class': 'logging.FileHandler',
#             'filename': os.path.join(BASE_DIR, 'logs/websocket.log'),
#             'formatter': 'websocket',
#         },
#     },
#     'root': {
#         'handlers': ['console'],
#         'level': 'DEBUG' if DEBUG else 'INFO',
#     },
#     'loggers': {
#         'network_management': {
#             'handlers': ['console', 'file'],
#             'level': MIKROTIK_CONFIG['LOGGING']['LEVEL'],
#             'propagate': False,
#         },
#         'channels': {
#             'handlers': ['console', 'websocket_file'],
#             'level': 'DEBUG' if DEBUG else 'INFO',
#             'propagate': False,
#         },
#         'django.channels': {
#             'handlers': ['console', 'websocket_file'],
#             'level': 'DEBUG' if DEBUG else 'INFO',
#             'propagate': False,
#         },
#         'django': {
#             'handlers': ['console'],
#             'level': 'INFO',
#             'propagate': False,
#         },
#     },
# }

# # Create logs directory if it doesn't exist
# logs_dir = os.path.join(BASE_DIR, 'logs')
# os.makedirs(logs_dir, exist_ok=True)

# # ==============================================================================
# # FINAL ENVIRONMENT LOGGING
# # ==============================================================================

# print(f"\n✅ Django settings loaded successfully!")
# print(f"✅ Environment: {ENVIRONMENT}")
# print(f"✅ Debug mode: {DEBUG}")
# print(f"✅ MikroTik monitoring: {MIKROTIK_CONFIG['MONITORING']['ENABLED']}")
# print(f"✅ WebSockets enabled: {ENABLE_WEBSOCKETS}")
# print(f"✅ Redis: {REDIS_HOST}:{REDIS_PORT}")
# print(f"✅ CORS Allowed Origins: {len(CORS_ALLOWED_ORIGINS)}")
# print(f"✅ CSRF Trusted Origins: {len(CSRF_TRUSTED_ORIGINS)}")










from pathlib import Path
from decouple import config
from django.core.exceptions import ImproperlyConfigured
from celery.schedules import crontab
from datetime import timedelta
from dotenv import load_dotenv
import os
import sys
import logging

load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# ==============================================================================
# ENVIRONMENT CONFIGURATION
# ==============================================================================

# Environment detection
DEBUG = os.getenv('DJANGO_DEBUG', 'True').lower() == 'true'
ENVIRONMENT = os.getenv('DJANGO_ENVIRONMENT', 'development')  # development, staging, production

logger = logging.getLogger(__name__)

def get_env_variable(var_name, default=None):
    """Get environment variable or return default/exception."""
    value = os.getenv(var_name, default)
    if value is None and default is None:
        raise ImproperlyConfigured(f"Set the {var_name} environment variable")
    return value

def deep_merge_dicts(base_dict, update_dict):
    """Recursively merge two dictionaries."""
    result = base_dict.copy()
    for key, value in update_dict.items():
        if isinstance(value, dict) and key in result and isinstance(result[key], dict):
            result[key] = deep_merge_dicts(result[key], value)
        else:
            result[key] = value
    return result

def validate_mikrotik_config(config, environment):
    """Validate MikroTik configuration for the current environment."""
    errors = []
    warnings = []
    
    # Connection validation
    timeout = config['CONNECTION']['TIMEOUT']
    if environment == 'production' and timeout < 10:
        warnings.append("Production timeout is less than 10 seconds")
    
    # SSL validation
    if environment == 'production' and not config['CONNECTION'].get('SSL_VERIFY', True):
        errors.append("SSL verification must be enabled in production")
    
    # Security validation for production
    if environment == 'production':
        if not config['CONNECTION'].get('SSL_CA_CERT_PATH'):
            warnings.append("No SSL CA certificate path set in production")
    
    # Log results
    for error in errors:
        logger.error(f"MikroTik Configuration Error [{environment}]: {error}")
    
    for warning in warnings:
        logger.warning(f"MikroTik Configuration Warning [{environment}]: {warning}")
    
    if errors:
        raise ImproperlyConfigured(f"MikroTik configuration has {len(errors)} error(s)")
    
    if not warnings:
        logger.info(f"MikroTik configuration validated successfully for {environment}")

# ==============================================================================
# DYNAMIC MIKROTIK CONFIGURATION
# ==============================================================================

# Base configuration - common to all environments
MIKROTIK_BASE_CONFIG = {
    # Connection Settings
    'CONNECTION': {
        'TIMEOUT': int(get_env_variable('MIKROTIK_TIMEOUT', '10')),
        'MAX_RETRIES': int(get_env_variable('MIKROTIK_MAX_RETRIES', '3')),
        'PORT': int(get_env_variable('MIKROTIK_PORT', '8728')),
        'USE_SSL': get_env_variable('MIKROTIK_USE_SSL', 'False').lower() == 'true',
    },
    
    # Pool Management
    'POOL': {
        'MAX_CONNECTIONS': int(get_env_variable('MIKROTIK_POOL_MAX_CONNECTIONS', '5')),
        'CLEANUP_INTERVAL': int(get_env_variable('MIKROTIK_POOL_CLEANUP_INTERVAL', '300')),
        'CACHE_TIMEOUT': int(get_env_variable('MIKROTIK_CACHE_TIMEOUT', '300')),
    },
    
    # Hotspot Defaults
    'HOTSPOT': {
        'IP_POOL': get_env_variable('MIKROTIK_HOTSPOT_IP_POOL', '192.168.100.10-192.168.100.200'),
        'BANDWIDTH_LIMIT': get_env_variable('MIKROTIK_HOTSPOT_BANDWIDTH_LIMIT', '10M/10M'),
        'SESSION_TIMEOUT': int(get_env_variable('MIKROTIK_HOTSPOT_SESSION_TIMEOUT', '60')),
        'MAX_USERS': int(get_env_variable('MIKROTIK_HOTSPOT_MAX_USERS', '50')),
        'DEFAULT_SSID': get_env_variable('MIKROTIK_HOTSPOT_SSID', 'SurfZone-WiFi'),
    },
    
    # PPPoE Defaults
    'PPPOE': {
        'IP_POOL_NAME': get_env_variable('MIKROTIK_PPPOE_IP_POOL_NAME', 'pppoe-pool'),
        'IP_RANGE': get_env_variable('MIKROTIK_PPPOE_IP_RANGE', '192.168.101.10-192.168.101.200'),
        'BANDWIDTH_LIMIT': get_env_variable('MIKROTIK_PPPOE_BANDWIDTH_LIMIT', '10M/10M'),
        'MTU': int(get_env_variable('MIKROTIK_PPPOE_MTU', '1492')),
    },
}

# Environment-specific overrides
MIKROTIK_ENVIRONMENT_CONFIGS = {
    'development': {
        'CONNECTION': {
            'SSL_VERIFY': False,
            'TIMEOUT': 5,  # Faster failures in development
        },
        'MONITORING': {
            'ENABLED': False,  # Disable monitoring in dev
            'MAX_RESPONSE_TIME_ALERT': 10.0,  # More lenient in dev
        },
        'LOGGING': {
            'LEVEL': 'DEBUG',
            'SAVE_CONNECTION_TESTS': False,  # Don't clutter DB in dev
        }
    },
    
    'staging': {
        'CONNECTION': {
            'SSL_VERIFY': True,
            'TIMEOUT': 10,
        },
        'MONITORING': {
            'ENABLED': True,
            'MAX_RESPONSE_TIME_ALERT': 5.0,
        },
        'LOGGING': {
            'LEVEL': 'INFO',
            'SAVE_CONNECTION_TESTS': True,
        }
    },
    
    'production': {
        'CONNECTION': {
            'SSL_VERIFY': True,
            'TIMEOUT': 15,  # More patience for production
            'SSL_CA_CERT_PATH': '/etc/ssl/certs/ca-certificates.crt',
        },
        'MONITORING': {
            'ENABLED': True,
            'MAX_RESPONSE_TIME_ALERT': 3.0,  # Stricter in production
            'CONNECTION_SUCCESS_THRESHOLD': 0.9,  # 90% success rate required
        },
        'SECURITY': {
            'VALIDATE_CREDENTIALS': True,
            'REJECT_DEFAULT_PASSWORDS': True,
        },
        'LOGGING': {
            'LEVEL': 'WARNING',
            'SAVE_CONNECTION_TESTS': True,
        }
    }
}

# Merge base config with environment-specific config
environment_config = MIKROTIK_ENVIRONMENT_CONFIGS.get(ENVIRONMENT, {})
MIKROTIK_CONFIG = deep_merge_dicts(MIKROTIK_BASE_CONFIG, environment_config)

# Final configuration validation
try:
    validate_mikrotik_config(MIKROTIK_CONFIG, ENVIRONMENT)
except ImproperlyConfigured as e:
    if ENVIRONMENT == 'production':
        raise
    else:
        logger.warning(f"MikroTik config validation warning: {e}")

# ==============================================================================
# SECURITY & BASIC DJANGO CONFIGURATION
# ==============================================================================

SECRET_KEY = config('SECRET_KEY', default='default-insecure-secret-key-for-development')

# FIXED: Enhanced allowed hosts for WebSocket support
ALLOWED_HOSTS = [
    '127.0.0.1', 
    'localhost', 
    '0.0.0.0',
    'backend',  # For Docker compatibility
]

# Add production domain if in production
if ENVIRONMENT == 'production':
    production_domain = get_env_variable('PRODUCTION_DOMAIN', None)
    if production_domain:
        ALLOWED_HOSTS.append(production_domain)
        # Also add without port for WebSocket connections
        ALLOWED_HOSTS.append(production_domain.split(':')[0])

ENABLE_WEBSOCKETS = True

# ==============================================================================
# APPLICATION CONFIGURATION
# ==============================================================================

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
    
    # Development tools (only in development)
    'debug_toolbar',
    'django_extensions',
    
    # Health checks
    'health_check',
    'health_check.db',
    'health_check.cache',
    'health_check.storage',
    
    # Custom apps
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

# Remove development apps in production
if ENVIRONMENT == 'production':
    if 'debug_toolbar' in INSTALLED_APPS:
        INSTALLED_APPS.remove('debug_toolbar')
    if 'django_extensions' in INSTALLED_APPS:
        INSTALLED_APPS.remove('django_extensions')

# ==============================================================================
# MIDDLEWARE CONFIGURATION - FIXED: Removed duplicate CORS middleware
# ==============================================================================

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Only one CORS middleware
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'account.middleware.CustomCsrfMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'network_management.middleware.audit_middleware.RouterAuditMiddleware',
    'network_management.middleware.audit_middleware.AuditLogCleanupMiddleware',
]

# Add debug toolbar middleware in development
if DEBUG and ENVIRONMENT == 'development':
    MIDDLEWARE.insert(0, 'debug_toolbar.middleware.DebugToolbarMiddleware')

SITE_ID = 1
AUTH_USER_MODEL = 'authentication.UserAccount'
AUTHENTICATION_BACKENDS = ['django.contrib.auth.backends.ModelBackend']

# ==============================================================================
# PAYMENT & EMAIL CONFIGURATION
# ==============================================================================

PAYMENT_APP_BASE_URL = config('PAYMENT_APP_BASE_URL', default='http://localhost:8000')
BASE_URL = config('BASE_URL', default='http://localhost:8000')

# Email Configuration
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.sendgrid.net"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = "apikey"
EMAIL_HOST_PASSWORD = config("SENDGRID_API_KEY", default="")  # Optional in development
DEFAULT_FROM_EMAIL = config("FROM_EMAIL", default="noreply@yourdomain.com")

# M-Pesa Configuration
MPESA_ENCRYPTION_KEY = config('MPESA_ENCRYPTION_KEY', default=None)
if ENVIRONMENT == 'production' and not MPESA_ENCRYPTION_KEY:
    raise ImproperlyConfigured("MPESA_ENCRYPTION_KEY is required in production")

# ==============================================================================
# REST FRAMEWORK & API CONFIGURATION
# ==============================================================================

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ],
    'EXCEPTION_HANDLER': 'rest_framework.views.exception_handler',
    'DEFAULT_TIMEOUT': 30,  # FIXED: Added global timeout
}

# DRF Spectacular Settings
SPECTACULAR_SETTINGS = {
    'TITLE': f'Network Management System API - {ENVIRONMENT.upper()}',
    'DESCRIPTION': f'{ENVIRONMENT.title()} API for managing network routers, users, and monitoring',
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

# ==============================================================================
# REDIS & CACHE CONFIGURATION
# ==============================================================================

REDIS_HOST = config('REDIS_HOST', default='127.0.0.1')
REDIS_PORT = config('REDIS_PORT', default=6379, cast=int)
REDIS_DB = config('REDIS_DB', default=0, cast=int)
REDIS_PASSWORD = config('REDIS_PASSWORD', default=None)

# Build Redis URL and options conditionally
if REDIS_PASSWORD:
    REDIS_URL = f'redis://:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}'
else:
    REDIS_URL = f'redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}'

# Cache Configuration
cache_options = {
    'CLIENT_CLASS': 'django_redis.client.DefaultClient',
    'SOCKET_CONNECT_TIMEOUT': 5,
    'SOCKET_TIMEOUT': 5,
    'RETRY_ON_TIMEOUT': True,
}

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

# ==============================================================================
# CELERY CONFIGURATION
# ==============================================================================

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
    # MikroTik monitoring tasks
    'monitor-router-health': {
        'task': 'network_management.tasks.monitor_router_health',
        'schedule': timedelta(minutes=5) if ENVIRONMENT == 'production' else timedelta(minutes=10),
    },
    'cleanup-connection-pools': {
        'task': 'network_management.tasks.cleanup_connection_pools',
        'schedule': timedelta(minutes=30),
    },
}

# ==============================================================================
# CHANNELS & WEBSOCKETS CONFIGURATION - FIXED
# ==============================================================================

ASGI_APPLICATION = 'interlink_logic.asgi.application'

# FIXED: Proper Channels configuration with Redis
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [(REDIS_HOST, REDIS_PORT)],
            "capacity": 1500,  # default 100
            "expiry": 10,  # default 60
        },
    },
}

# ==============================================================================
# CORS CONFIGURATION - FIXED: Added x-client-id header and removed duplicates
# ==============================================================================

# FIXED: Enhanced CORS configuration for WebSocket support
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "ws://localhost:8000",
    "ws://127.0.0.1:8000",
    "ws://localhost:5173",
    "ws://127.0.0.1:5173",
]

# Add production domains if in production
if ENVIRONMENT == 'production':
    production_frontend = get_env_variable('PRODUCTION_FRONTEND_URL', None)
    if production_frontend:
        CORS_ALLOWED_ORIGINS.append(production_frontend)
        # Add WebSocket version
        CORS_ALLOWED_ORIGINS.append(production_frontend.replace('http://', 'ws://').replace('https://', 'wss://'))

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]

# FIXED: Added x-client-id to allowed headers
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
    "x-access-token",
    "x-client-id",  # CRITICAL FIX: Added this line to resolve CORS errors
    "sec-websocket-protocol",
    "sec-websocket-key",
    "sec-websocket-version",
    "sec-websocket-extensions",
]

# FIXED: CSRF trusted origins for WebSocket connections
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',  # Added your frontend origin
    'http://127.0.0.1:5174',  # Added your frontend origin
    'ws://localhost:8000',
    'ws://127.0.0.1:8000',
]

if ENVIRONMENT == 'production':
    production_domain = get_env_variable('PRODUCTION_DOMAIN', None)
    if production_domain:
        CSRF_TRUSTED_ORIGINS.extend([
            f'https://{production_domain}',
            f'wss://{production_domain}'
        ])

# ==============================================================================
# TEMPLATES & URL CONFIGURATION
# ==============================================================================

ROOT_URLCONF = 'interlink_logic.urls'
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],  # Added templates directory
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

# ==============================================================================
# DATABASE CONFIGURATION
# ==============================================================================

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'OPTIONS': {"read_default_file": "/etc/mysql/my.cnf"},
    }
}

# Optional: Environment-specific database overrides
if ENVIRONMENT == 'production':
    DATABASES['default']['OPTIONS'] = {
        'read_default_file': '/etc/mysql/my.cnf',
        'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
    }

# ==============================================================================
# STATIC & MEDIA FILES
# ==============================================================================

STATIC_URL = '/static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
    os.path.join(BASE_DIR, 'static/dashboard'),
    os.path.join(BASE_DIR, 'static/landing'),
]
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Create templates directory if it doesn't exist
templates_dir = os.path.join(BASE_DIR, 'templates')
os.makedirs(templates_dir, exist_ok=True)

# Debug Static Files Check
if DEBUG:
    print(f"\n=== Environment: {ENVIRONMENT.upper()} ===")
    print(f"=== Static Files Verification ===")
    print(f"BASE_DIR: {BASE_DIR}")
    print(f"STATIC_URL: {STATIC_URL}")
    print(f"STATIC_ROOT: {STATIC_ROOT}")
    for d in STATICFILES_DIRS:
        print(f" - {d} | Exists: {os.path.exists(d)}")

# ==============================================================================
# MISC DJANGO SETTINGS
# ==============================================================================

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
LANGUAGE_CODE = 'en-us'
TIME_ZONE = config('TIME_ZONE', default='UTC')
USE_I18N = True
USE_TZ = True

SITE_DOMAIN = "localhost:8000"
BASE_URL = f"http://{SITE_DOMAIN}"

# Debug Toolbar Configuration
if DEBUG and ENVIRONMENT == 'development':
    INTERNAL_IPS = [
        '127.0.0.1',
        'localhost',
    ]

# ==============================================================================
# LOGGING CONFIGURATION
# ==============================================================================

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
        'websocket': {
            'format': '{levelname} {asctime} [WebSocket] {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'DEBUG' if DEBUG else 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'logs/django.log'),
            'formatter': 'verbose',
        },
        'websocket_file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'logs/websocket.log'),
            'formatter': 'websocket',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG' if DEBUG else 'INFO',
    },
    'loggers': {
        'network_management': {
            'handlers': ['console', 'file'],
            'level': MIKROTIK_CONFIG['LOGGING']['LEVEL'],
            'propagate': False,
        },
        'channels': {
            'handlers': ['console', 'websocket_file'],
            'level': 'DEBUG' if DEBUG else 'INFO',
            'propagate': False,
        },
        'django.channels': {
            'handlers': ['console', 'websocket_file'],
            'level': 'DEBUG' if DEBUG else 'INFO',
            'propagate': False,
        },
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Create logs directory if it doesn't exist
logs_dir = os.path.join(BASE_DIR, 'logs')
os.makedirs(logs_dir, exist_ok=True)

# ==============================================================================
# FINAL ENVIRONMENT LOGGING
# ==============================================================================

print(f"\n✅ Django settings loaded successfully!")
print(f"✅ Environment: {ENVIRONMENT}")
print(f"✅ Debug mode: {DEBUG}")
print(f"✅ MikroTik monitoring: {MIKROTIK_CONFIG['MONITORING']['ENABLED']}")
print(f"✅ WebSockets enabled: {ENABLE_WEBSOCKETS}")
print(f"✅ Redis: {REDIS_HOST}:{REDIS_PORT}")
print(f"✅ CORS Allowed Origins: {len(CORS_ALLOWED_ORIGINS)}")
print(f"✅ CSRF Trusted Origins: {len(CSRF_TRUSTED_ORIGINS)}")
print(f"✅ CORS Allowed Headers includes 'x-client-id': {'x-client-id' in CORS_ALLOW_HEADERS}")