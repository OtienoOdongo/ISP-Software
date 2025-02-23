from pathlib import Path
from decouple import config
from datetime import timedelta
from dotenv import load_dotenv
load_dotenv()

import os


SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'default-insecure-secret-key')

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', cast=bool, default=False)

ALLOWED_HOSTS = []

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',

    'authentication',
    'user_management',
    'internet_plans',
    'network_management',
    'payments',
    'reporting',
    'support',
    # 'account',
    'dashboard',

    'rest_framework',
    'djoser',
    'rest_framework_simplejwt',
    'corsheaders',
]

SITE_ID = 1


AUTH_USER_MODEL = 'authentication.UserAccount'

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]

# Email Configuration
# App psswd => ziyh sivs ofiu vkwv
EMAIL_BACKEND = config('EMAIL_BACKEND', default='django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', cast=int, default=587)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', cast=bool, default=True)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='noreply06790n@gmail.com')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='ziyhsivsofiuvkwv')

# Rest Framework Configurations
REST_FRAMEWORK = {
     'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',  
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.TokenAuthentication',
    
    ),
}

SIMPLE_JWT = {
   'AUTH_HEADER_TYPES': ('JWT',),
}


DJOSER = { 
    'LOGIN_FIELD': 'email',
    'USER_CREATE_PASSWORD_RETYPE': True,
    'USERNAME_CHANGED_EMAIL_CONFIRMATION': True,
    'PASSWORD_CHANGED_EMAIL_CONFIRMATION': True,
    'SEND_CONFIRMATION_EMAIL': True,
    'SEND_ACTIVATION_EMAIL': True,
    'SET_USERNAME_RETYPE': True,
    'SET_PASSWORD_RETYPE': True,
    'ACTIVATION_URL': 'activate/{uid}/{token}/',
    'PASSWORD_RESET_CONFIRM_URL': 'password/reset/confirm/{uid}/{token}/',
    'USERNAME_RESET_CONFIRM_URL': 'email/reset/confirm/{uid}/{token}/',
    'SERIALIZERS': {
        'user_create': 'authentication.serializers.UserCreateSerializer',
        'user': 'authentication.serializers.UserCreateSerializer',
        'user_delete': 'djoser.serializers.UserDeleteSerializer'
    },
    

}



SITE_DOMAIN = "localhost:5173"
BASE_URL = f"http://{SITE_DOMAIN}"



MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',
]

CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',  
]

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

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'OPTIONS': {
            "read_default_file": "/etc/mysql/my.cnf",
        },
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = config('TIME_ZONE', default='UTC')
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Logging Configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'debug.log'),
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'




# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'

# Directories where Django will look for static files
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),  # Point to Backend/static
]

# The absolute path to the directory where collectstatic will collect static files for deployment
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')  # For collected static files



