
import requests
import json

SUPABASE_URL = "https://usybnhokbkycfxuabusm.supabase.co"
SUPABASE_KEY = "sb_publishable_rJ_RF0Eyoqzqz5NazNFNfw_WIaWV8f9"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

def test_read():
    print("Testing READ access to 'blunder_positions'...")
    url = f"{SUPABASE_URL}/rest/v1/blunder_positions?select=*"
    resp = requests.get(url, headers=headers)
    
    if resp.status_code == 200:
        data = resp.json()
        print(f"✅ Success! Found {len(data)} rows.")
        if len(data) > 0:
            usernames = set([d.get('username') for d in data])
            print(f"Usernames found: {usernames}")
            print("First row sample:", data[0])
    else:
        print(f"❌ Failed: {resp.status_code}")
        print(resp.text)

if __name__ == "__main__":
    test_read()
