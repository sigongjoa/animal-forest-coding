import base64
import os

png_path = 'frontend/public/assets/character/nook.png'
js_path = 'asset-studio/nook_data.js'

try:
    with open(png_path, 'rb') as f:
        encoded = base64.b64encode(f.read()).decode('utf-8')

    with open(js_path, 'w') as f:
        f.write(f'window.nookBase64 = "data:image/png;base64,{encoded}";')
    print("Successfully created nook_data.js")
except Exception as e:
    print(f"Error: {e}")
