import requests
import json

# Test Djoser registration
url = "http://127.0.0.1:8000/api/auth/users/"
data = {
    "email": "testuser@example.com",
    "password": "TestPass123!@#",
    "re_password": "TestPass123!@#",
    "name": "Test User"
}

response = requests.post(url, json=data)
print(f"Status Code: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")