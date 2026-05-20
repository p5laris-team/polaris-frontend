import os
import numpy as np
from PIL import Image

assets_dir = r"c:\JavaProject/Project/Polaris-Design-System/assets"
brain_dir = r"C:\Users\sohyu\.gemini\antigravity\brain\bef85bbd-a28d-4b9e-974d-ad98123f6d58"

char_images = {
    "mumu": os.path.join(brain_dir, "media__1779246502302.png"),
    "nova": os.path.join(brain_dir, "media__1779246502407.png"),
    "jjori": os.path.join(brain_dir, "media__1779246502535.jpg")
}

# BFS to find the largest connected component of non-transparent pixels
def get_largest_component(data, cw, ch):
    non_trans = (data[:, :, 3] > 0)
    visited = np.zeros_like(non_trans)
    
    largest_comp = []
    
    for y in range(ch):
        for x in range(cw):
            if non_trans[y, x] and not visited[y, x]:
                comp = []
                queue = [(y, x)]
                visited[y, x] = 1
                while queue:
                    cy, cx = queue.pop(0)
                    comp.append((cy, cx))
                    for dy, dx in [(-1,0), (1,0), (0,-1), (0,1)]:
                        ny, nx = cy + dy, cx + dx
                        if 0 <= ny < ch and 0 <= nx < cw:
                            if non_trans[ny, nx] and not visited[ny, nx]:
                                visited[ny, nx] = 1
                                queue.append((ny, nx))
                if len(comp) > len(largest_comp):
                    largest_comp = comp
                    
    return largest_comp

# Process each character
for char_id, img_path in char_images.items():
    if not os.path.exists(img_path):
        print(f"Error: {img_path} not found")
        continue
        
    print(f"Processing {char_id}...")
    img = Image.open(img_path)
    w, h = img.size
    
    cell_w = w // 3
    cell_h = h // 2
    
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
        cw, ch = cropped.size
        
        # Convert to RGBA
        rgba = cropped.convert("RGBA")
        data = np.array(rgba)
        
        # 1. Erase white background (r,g,b > 240)
        # 2. Erase floor shadow (bottom 45 pixels of cell, and color is light r,g,b > 120)
        for y in range(ch):
            for x in range(cw):
                r, g, b, a = data[y, x]
                if r > 240 and g > 240 and b > 240:
                    data[y, x] = [255, 255, 255, 0]
                elif y > (ch - 45) and r > 120 and g > 120 and b > 120:
                    data[y, x] = [255, 255, 255, 0]
                    
        # Find the largest connected component (the main character body)
        largest = get_largest_component(data, cw, ch)
        
        if not largest:
            print(f"Warning: No component found for {char_id}{suffix}")
            continue
            
        # Create a clean image containing ONLY the largest component
        clean_data = np.zeros_like(data)
        for cy, cx in largest:
            clean_data[cy, cx] = data[cy, cx]
            
        clean_img = Image.fromarray(clean_data, "RGBA")
        
        # Crop to the character's tight bounding box
        bbox = clean_img.getbbox()
        if bbox:
            trimmed = clean_img.crop(bbox)
            tw, th = trimmed.size
            
            # Pad to square (to maintain aspect ratio)
            max_side = max(tw, th)
            square_img = Image.new("RGBA", (max_side, max_side), (255, 255, 255, 0))
            
            # Paste in the center of the square
            offset_x = (max_side - tw) // 2
            offset_y = (max_side - th) // 2
            square_img.paste(trimmed, (offset_x, offset_y))
            
            # Resize to uniform 256x256 pixels
            final_img = square_img.resize((256, 256), Image.Resampling.LANCZOS)
        else:
            final_img = clean_img
            
        # Save as PNG
        out_name = f"character-{char_id}{suffix}.png"
        out_path = os.path.join(assets_dir, out_name)
        final_img.save(out_path, "PNG")
        print(f"Saved: {out_path} (Size: 256x256, Centered)")

print("All characters processed and centered perfectly!")
