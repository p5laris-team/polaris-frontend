import os
from PIL import Image

brain_dir = r"C:\Users\sohyu\.gemini\antigravity\brain\bef85bbd-a28d-4b9e-974d-ad98123f6d58"
mumu_path = os.path.join(brain_dir, "media__1779246502302.png")

if os.path.exists(mumu_path):
    img = Image.open(mumu_path)
    w, h = img.size
    cell_w = w // 3
    cell_h = h // 2
    
    cropped = img.crop((0, 0, cell_w, int(cell_h * 0.82)))
    cw, ch = cropped.size
    
    color_counts = {}
    for y in range(ch - 40, ch):
        for x in range(cw):
            p = cropped.getpixel((x, y))
            r, g, b = p[:3]
            # Ignore white background and black outlines
            if (r > 30 or g > 30 or b > 30) and (r < 240 or g < 240 or b < 240):
                color_counts[p[:3]] = color_counts.get(p[:3], 0) + 1
                
    sorted_colors = sorted(color_counts.items(), key=lambda x: x[1], reverse=True)
    print("Non-black, non-white colors in bottom 40 rows:")
    for color, count in sorted_colors[:25]:
        print(f"Color: {color}, Count: {count}")
else:
    print("Mumu image not found")
