from cryptography.fernet import Fernet
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEYS_DIR = os.path.join(BASE_DIR, "field_keys")
os.makedirs(KEYS_DIR, exist_ok=True)

KEY_FILE = os.path.join(KEYS_DIR, "fernet.key")

if not os.path.exists(KEY_FILE):
    key = Fernet.generate_key()
    with open(KEY_FILE, "wb") as f:
        f.write(key)
    print(f"[OK] Fernet key generated at: {KEY_FILE}")
else:
    print("[SKIP] Key already exists")
