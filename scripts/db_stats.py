import requests

SUPABASE_URL = "https://usybnhokbkycfxuabusm.supabase.co"
SUPABASE_KEY = "sb_publishable_rJ_RF0Eyoqzqz5NazNFNfw_WIaWV8f9"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Prefer": "count=exact"
}

print("📊 Querying Supabase for blunder statistics...\n")

# Get count
url = f"{SUPABASE_URL}/rest/v1/blunder_positions?select=id&limit=1"
resp = requests.get(url, headers=headers)

print(f"Status Code: {resp.status_code}")
print(f"\nAll Headers:")
for key, value in resp.headers.items():
    print(f"  {key}: {value}")

if 'content-range' in resp.headers:
    range_header = resp.headers['content-range']
    print(f"\n✅ Found Content-Range: {range_header}")
    
    # Parse it - format is "0-0/2500"
    total = range_header.split('/')[-1]
    
    print(f"\n🎯 RESULTS:")
    print(f"   Total blunders: {total}")
    print(f"   Games analyzed: 1,376")
    
    if total.isdigit():
        blunders_per_game = int(total) / 1376
        total_mb = (int(total) * 300) / (1024 * 1024)
        
        print(f"   Avg blunders/game: {blunders_per_game:.1f}")
        print(f"\n📦 Database Size:")
        print(f"   Estimated: ~{total_mb:.2f} MB")
        print(f"   Free tier: 500 MB")
        print(f"   Usage: {(total_mb/500)*100:.1f}%")
else:
    print("\n❌ No content-range header found")
