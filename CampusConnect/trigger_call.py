import urllib.request
import urllib.parse
import base64

# ==========================================
# 1. FILL IN YOUR DETAILS HERE
# ==========================================
account_sid = 'YOUR_TWILIO_ACCOUNT_SID' # See "Show API Credentials" in Twilio
auth_token = 'YOUR_TWILIO_AUTH_TOKEN'              # See "Show API Credentials" in Twilio
my_indian_number = 'YOUR_MOBILE_NUMBER'               # Your personal mobile number (with +91)
# ==========================================

url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Calls.json"
data = urllib.parse.urlencode({
    'To': my_indian_number,
    'From': '+19126122846',
    'Url': 'https://ace7f49051db77.lhr.life/voice'
}).encode('ascii')

auth = base64.b64encode(f"{account_sid}:{auth_token}".encode('utf-8')).decode('ascii')
req = urllib.request.Request(url, data=data, headers={'Authorization': f'Basic {auth}'})

print("Initiating call from Twilio...")
try:
    with urllib.request.urlopen(req) as response:
        print("✅ SUCCESS! Your phone should be ringing right now! Pick it up!")
except Exception as e:
    print(f"❌ Failed to make call: {e}")
