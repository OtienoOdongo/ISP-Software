# payments/fields/encrypted_text_field.py
from django.db import models
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from cryptography.fernet import Fernet, InvalidToken

# Ensure key exists in settings (set by settings.py from .env)
_key = getattr(settings, 'MPESA_ENCRYPTION_KEY', None)
if not _key:
    raise ImproperlyConfigured("MPESA_ENCRYPTION_KEY is not configured in settings.py")

# Ensure bytes
if isinstance(_key, str):
    _key = _key.encode()

fernet = Fernet(_key)


class EncryptedTextField(models.TextField):
    """
    Transparent Fernet-encrypted TextField.
    - get_prep_value: encrypts before saving to DB
    - from_db_value/to_python: decrypts when loading
    """

    def from_db_value(self, value, expression, connection):
        if value is None:
            return value
        try:
            if isinstance(value, str):
                return fernet.decrypt(value.encode()).decode()
        except (InvalidToken, Exception):
            # If decrypt fails, return raw (useful during migration/key-change)
            return value
        return value

    def to_python(self, value):
        # Called during model parsing
        if value is None:
            return value
        # If value is already plaintext (e.g., set in Python code), return it
        if isinstance(value, str):
            try:
                return fernet.decrypt(value.encode()).decode()
            except (InvalidToken, Exception):
                return value
        return value

    def get_prep_value(self, value):
        # Called just prior to saving to DB
        if value is None:
            return value
        if not isinstance(value, (bytes, str)):
            value = str(value)
        if isinstance(value, str):
            return fernet.encrypt(value.encode()).decode()
        return fernet.encrypt(value).decode()
