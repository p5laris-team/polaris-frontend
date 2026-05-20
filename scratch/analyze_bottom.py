import os
from PIL import Image

brain_dir = r"C:\Users\sohyu\.gemini\antigravity\brain\bef85bbd-a28d-4b9e-974d-ad98123f6d58"
mumu_path = os.path.join(brain_dir, "media__1779246502302.png")

if os.path.exists(mumu_path):
    img = Image.open(mumu_path)
    w, h = img.size
    cell_w = w // 3
    cell_h = h // 2
    
    # Let's crop the first cell (Mumu Default)
    cropped = img.crop((0, 0, cell_w, int(cell_h * 0.82)))
    cw, ch = cropped.size
    
    # Analyze the colors in the bottom 40 rows of this cropped image
    color_counts = {}
    for y in range(ch - 40, ch):
        for x in range(cw):
            p = cropped.getpixel((x, y))
            # If not white
            if p[0] < 250 or p[1] < 250 or p[2] < 250:
                color_counts[p] = color_counts.get(p, 0) + 1
                
    # Print the most common colors in the bottom region
    sorted_colors = sorted(color_counts.items(), key=lambda x: x[1], reverse=True)
    print("Most common colors in bottom 40 rows:")
    for color, count in sorted_colors[:15]:
        print(f"Color: {color}, Count: {count}")
else:
    print("Mumu image not found")
