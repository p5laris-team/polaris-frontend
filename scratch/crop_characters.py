import os
from PIL import Image

# Setup directories
assets_dir = r"c:\JavaProject\Project\Polaris-Design-System\assets"
brain_dir = r"C:\Users\sohyu\.gemini\antigravity\brain\bef85bbd-a28d-4b9e-974d-ad98123f6d58"

# Images mapping
# 1779246502302.png -> Mumu (무무)
# 1779246502407.png -> Nova (노바)
# 1779246502535.jpg -> Jjori (쪼리)
char_images = {
    "mumu": os.path.join(brain_dir, "media__1779246502302.png"),
    "nova": os.path.join(brain_dir, "media__1779246502407.png"),
    "jjori": os.path.join(brain_dir, "media__1779246502535.jpg")
}

def make_transparent(img):
    # Convert white background to transparent
    # The background is very close to pure white (e.g., > 240 or 250 in all channels)
    rgba = img.convert("RGBA")
    datas = rgba.getdata()
    
    newData = []
    for item in datas:
        # Check if it's white or very close to white
        if item[0] > 250 and item[1] > 250 and item[2] > 250:
            newData.append((255, 255, 255, 0)) # Make transparent
        else:
            newData.append(item)
    rgba.putdata(newData)
    return rgba

for char_id, img_path in char_images.items():
    if not os.path.exists(img_path):
        print(f"Error: {img_path} not found")
        continue
        
    print(f"Processing {char_id} from {img_path}...")
    img = Image.open(img_path)
    w, h = img.size
    print(f"Dimensions: {w}x{h}")
    
    # 3 columns, 2 rows
    cell_w = w / 3
    cell_h = h / 2
    
    # Moods mapping to cell coordinates
    # We want:
    # 1. default -> Cell (col 0, row 0) ["기본"]
    # 2. happy -> Cell (col 0, row 1) ["놀이"]
    # 3. sleepy -> Cell (col 2, row 0) ["잠"]
    moods = {
        "": (0, 0),       # default (character-{char_id}.png)
        "-happy": (0, 1),  # happy (character-{char_id}-happy.png)
        "-sleepy": (2, 0)  # sleepy (character-{char_id}-sleepy.png)
    }
    
    for suffix, (col, row) in moods.items():
        # Define crop box for the character, excluding the label at the bottom of the cell
        left = int(col * cell_w)
        top = int(row * cell_h)
        right = int((col + 1) * cell_w)
        bottom = int((row + 0.82) * cell_h) # Exclude the bottom ~18% which has labels
        
        # Crop
        cropped = img.crop((left, top, right, bottom))
        
        # Make transparent
        transparent_cropped = make_transparent(cropped)
        
        # Trim white space boundaries around the character to center it nicely
        # Get bounding box of non-transparent pixels
        bbox = transparent_cropped.getbbox()
        if bbox:
            trimmed = transparent_cropped.crop(bbox)
            # Pad to square to keep aspect ratio
            tw, th = trimmed.size
            max_size = max(tw, th)
            # Create a new square transparent image
            square_img = Image.new("RGBA", (max_size, max_size), (255, 255, 255, 0))
            # Paste trimmed image in the center
            offset_x = (max_size - tw) // 2
            offset_y = (max_size - th) // 2
            square_img.paste(trimmed, (offset_x, offset_y))
            final_img = square_img
        else:
            final_img = transparent_cropped
            
        # Save as PNG
        out_name = f"character-{char_id}{suffix}.png"
        out_path = os.path.join(assets_dir, out_name)
        final_img.save(out_path, "PNG")
        print(f"Saved: {out_path}")

print("Done processing all characters!")
