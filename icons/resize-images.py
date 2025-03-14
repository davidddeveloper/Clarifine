from PIL import Image

sizes = [(16, 16), (48, 48), (128, 128)]
img = Image.open("logo.webp")

for size in sizes:
    resized_img = img.resize(size, Image.LANCZOS)
    resized_img.save(f"icon{size[0]}.png")
