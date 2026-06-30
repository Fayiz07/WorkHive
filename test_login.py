import requests

url = "https://workhive-zfsk.onrender.com/api/auth/login/"
payload = {
    "username": "fayiz",
    "password": "fayiz1234"
}
try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
