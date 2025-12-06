from PIL import Image

def remove_green_background(input_path, output_path):
    try:
        img = Image.open(input_path)
        img = img.convert("RGBA")
        datas = img.getdata()

        newData = []
        for item in datas:
            # Green pixel detection: R < 100, G > 150, B < 100 (Adjust thresholds as needed)
            # Bright Green #00FF00 is (0, 255, 0)
            if item[0] < 120 and item[1] > 180 and item[2] < 120:
                newData.append((255, 255, 255, 0)) # Transparent
            else:
                newData.append(item)

        img.putdata(newData)
        img.save(output_path, "PNG")
        print(f"Successfully processed: {input_path}")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

if __name__ == "__main__":
    files = [
        "frontend/public/assets/character/nook.png",
        "frontend/public/assets/character/player.png"
    ]
    for f in files:
        remove_green_background(f, f)
