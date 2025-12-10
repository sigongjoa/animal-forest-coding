
from PIL import Image
import sys
import os

def process_image(input_path, output_path):
    print(f"Processing {input_path} -> {output_path}")
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()
        
        # Get background color from top-left (0,0)
        bg_color = datas[0]
        threshold = 30  # Tolerance

        new_data = []
        for item in datas:
            # Check if pixel is close to background color
            if all(abs(item[i] - bg_color[i]) < threshold for i in range(3)):
                new_data.append((255, 255, 255, 0)) # Transparent
            else:
                new_data.append(item)

        img.putdata(new_data)
        img.save(output_path, "PNG")
        print("Success!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Expecting: python script.py <input1> <output1> <input2> <output2>
    args = sys.argv[1:]
    for i in range(0, len(args), 2):
        process_image(args[i], args[i+1])
