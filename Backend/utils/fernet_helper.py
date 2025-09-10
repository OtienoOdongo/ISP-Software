import os
from cryptography.fernet import Fernet

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEY_FILE = os.path.join(BASE_DIR, "field_keys", "fernet.key")

def get_fernet():
    with open(KEY_FILE, "rb") as f:
        key = f.read()
    return Fernet(key)
