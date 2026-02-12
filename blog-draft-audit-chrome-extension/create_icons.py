from PIL import Image, ImageDraw, ImageFont
import os

# Create simple icons for the extension
sizes = [16, 48, 128]

for size in sizes:
    # Create a new image with orange background
    img = Image.new('RGB', (size, size), color='#FF6719')
    draw = ImageDraw.Draw(img)
    
    # Draw a simple chart icon
    margin = size // 6
    bar_width = size // 5
    spacing = size // 10
    
    # Draw three bars of different heights
    bar1_height = size - 2 * margin
    bar2_height = int(bar1_height * 0.6)
    bar3_height = int(bar1_height * 0.8)
    
    x1 = margin
    draw.rectangle([x1, margin + (bar1_height - bar1_height), 
                    x1 + bar_width, size - margin], fill='white')
    
    x2 = x1 + bar_width + spacing
    draw.rectangle([x2, margin + (bar1_height - bar2_height), 
                    x2 + bar_width, size - margin], fill='white')
    
    x3 = x2 + bar_width + spacing
    draw.rectangle([x3, margin + (bar1_height - bar3_height), 
                    x3 + bar_width, size - margin], fill='white')
    
    # Save the icon
    img.save(f'icon{size}.png')
    print(f'Created icon{size}.png')

print('All icons created successfully!')
