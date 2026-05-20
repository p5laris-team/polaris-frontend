import os
from PIL import Image

assets_dir = r"c:\JavaProject/Project/Polaris-Design-System/assets"
brain_dir = r"C:\Users\sohyu\.gemini\antigravity\brain\bef85bbd-a28d-4b9e-974d-ad98123f6d58"

char_images = {
    "mumu": os.path.join(brain_dir, "media__1779246502302.png"),
    "nova": os.path.join(brain_dir, "media__1779246502407.png"),
    "jjori": os.path.join(brain_dir, "media__1779246502535.jpg")
}

def make_transparent(img):
    rgba = img.convert("RGBA")
    datas = rgba.getdata()
    
    newData = []
    for item in datas:
        if item[0] > 250 and item[1] > 250 and item[2] > 250:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
    rgba.putdata(newData)
    return rgba

# Crop preserving relative sizes
for char_id, img_path in char_images.items():
    if not os.path.exists(img_path):
        print(f"Error: {img_path} not found")
        continue
        
    print(f"Processing {char_id}...")
    img = Image.open(img_path)
    w, h = img.size
    
    cell_w = w / 3
    cell_h = h / 2
    
    moods = {
        "": (0, 0),
        "-happy": (0, 1),
        "-sleepy": (2, 0)
    }
    
    for suffix, (col, row) in moods.items():
        left = int(col * cell_w)
        top = int(row * cell_h)
        right = int((col + 1) * cell_w)
        bottom = int((row + 0.82) * cell_h) # Exclude labels at the bottom
        
        # Crop the cell
        cropped = img.crop((left, top, right, bottom))
        
        # Make transparent
        transparent = make_transparent(cropped)
        
        # Instead of trimming, we pad the entire cropped cell to a uniform square (e.g. 342x342)
        # to ensure that the scale of the character relative to the cell is preserved.
        cw, ch = transparent.size
        target_size = max(cw, ch)
        
        square_img = Image.new("RGBA", (target_size, target_size), (255, 255, 255, 0))
        offset_x = (target_size - cw) // 2
        offset_y = (target_size - ch) // 2
        square_img.paste(transparent, (offset_x, offset_y))
        
        # Save as PNG
        out_name = f"character-{char_id}{suffix}.png"
        out_path = os.path.join(assets_dir, out_name)
        square_img.save(out_path, "PNG")
        print(f"Saved uniform size: {out_path}")

# Clean up unused legacy and temp SVGs
svgs_to_delete = [
    "character-byeori.svg",
    "character-byeori-happy.svg",
    "character-byeori-sleepy.svg",
    "character-gureumi.svg",
    "character-kongi.svg",
    "character-nova.svg",
    "character-nova-happy.svg",
    "character-nova-sleepy.svg",
    "character-jjori.svg",
    "character-mumu.svg"
]

print("Cleaning up unused SVG files...")
for name in svgs_to_delete:
    path = os.path.join(assets_dir, name)
    if os.path.exists(path):
        try:
            os.remove(path)
            print(f"Deleted: {path}")
        except Exception as e:
            print(f"Failed to delete {path}: {e}")
    else:
        print(f"File not found (already deleted): {path}")

print("Clean up finished!")
