import urllib.request
import json

req = urllib.request.Request('https://openrouter.ai/api/v1/models')
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read().decode())
    
free_models = [m['id'] for m in data['data'] if m['id'].endswith(':free') or m['pricing']['prompt'] == '0']
print("Free models:", free_models[:10])
