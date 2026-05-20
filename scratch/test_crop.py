import os
import numpy as np
from PIL import Image

brain_dir = r"C:\Users\sohyu\.gemini\antigravity\brain\bef85bbd-a28d-4b9e-974d-ad98123f6d58"
mumu_path = os.path.join(brain_dir, "media__1779246502302.png")
nova_path = os.path.join(brain_dir, "media__1779246502407.png")
jjori_path = os.path.join(brain_dir, "media__1779246502535.jpg")

# Test with Mumu default
img = Image.open(mumu_path)
w, h = img.size
cell_w = w // 3
cell_h = h // 2

cropped = img.crop((0, 0, cell_w, int(cell_h * 0.82)))
cw, ch = cropped.size

# Convert to RGBA
rgba = cropped.convert("RGBA")
data = np.array(rgba)

# Threshold for white background (r, g, b > 240)
# And threshold for shadow: if y is in the bottom 45 pixels of the cell, and the color is light (r,g,b > 120),
# it is part of the shadow.
for y in range(ch):
    for x in range(cw):
        r, g, b, a = data[y, x]
        if r > 240 and g > 240 and b > 240:
            data[y, x] = [255, 255, 255, 0]
        elif y > (ch - 45) and r > 120 and g > 120 and b > 120:
            # Erase shadow
            data[y, x] = [255, 255, 255, 0]

# Now let's find connected components of non-transparent pixels
# We'll use a simple BFS/DFS or scipy/cv2 if available, or just a pure python BFS to find components.
non_trans = (data[:, :, 3] > 0)
visited = np.zeros_like(non_trans)

components = []
for y in range(ch):
    for x in range(cw):
        if non_trans[y, x] and not visited[y, x]:
            # Start BFS
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
            components.append(comp)

print(f"Found {len(components)} components.")
if components:
    # Find largest component
    largest_comp = max(components, key=len)
    print(f"Largest component size: {len(largest_comp)}")
    
    # Create new image with ONLY the largest component
    clean_data = np.zeros_like(data)
    for cy, cx in largest_comp:
        clean_data[cy, cx] = data[cy, cx]
        
    clean_img = Image.fromarray(clean_data, "RGBA")
    bbox = clean_img.getbbox()
    print(f"BBox: {bbox}")
