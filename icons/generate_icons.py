#!/usr/bin/env python3
"""
Generate PNG icons from SVG for Chrome Extension
Requires: pip install pillow cairosvg
"""

try:
    from PIL import Image, ImageDraw
    import io

    def create_icon(size):
        """Create a simple icon using PIL"""
        # Create image with transparent background
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)

        # Draw gradient background (approximate)
        for y in range(size):
            # Interpolate between blue and purple
            r = int(66 + (108 - 66) * y / size)
            g = int(133 + (99 - 133) * y / size)
            b = int(244 + (255 - 244) * y / size)
            draw.rectangle([(0, y), (size, y+1)], fill=(r, g, b, 255))

        # Draw rounded rectangle (approximate with ellipse corners)
        corner_radius = size // 6

        # Draw microphone
        mic_width = size // 4
        mic_height = size // 3
        mic_x = (size - mic_width) // 2
        mic_y = size // 4

        # Mic capsule (rounded rectangle)
        draw.rounded_rectangle(
            [(mic_x, mic_y), (mic_x + mic_width, mic_y + mic_height)],
            radius=mic_width // 2,
            fill='white'
        )

        # Mic stand
        stand_width = size // 32
        stand_height = size // 6
        stand_x = (size - stand_width) // 2
        stand_y = mic_y + mic_height
        draw.rectangle(
            [(stand_x, stand_y), (stand_x + stand_width, stand_y + stand_height)],
            fill='white'
        )

        # Mic base
        base_width = size // 4
        base_height = size // 20
        base_x = (size - base_width) // 2
        base_y = stand_y + stand_height
        draw.rounded_rectangle(
            [(base_x, base_y), (base_x + base_width, base_y + base_height)],
            radius=base_height // 2,
            fill='white'
        )

        # AI indicator (gold circle)
        if size >= 32:
            indicator_size = size // 12
            indicator_x = mic_x + mic_width + size // 20
            indicator_y = mic_y - size // 20
            draw.ellipse(
                [(indicator_x - indicator_size, indicator_y - indicator_size),
                 (indicator_x + indicator_size, indicator_y + indicator_size)],
                fill='#FFD700'
            )

        return img

    # Generate all sizes
    sizes = [16, 32, 48, 128]

    print("Generating PNG icons...")
    for size in sizes:
        icon = create_icon(size)
        filename = f'icon{size}.png'
        icon.save(filename, 'PNG')
        print(f"[OK] Created {filename}")

    print("\n[SUCCESS] All icons generated successfully!")
    print("\nYou can now load the extension in Chrome.")

except ImportError:
    print("Pillow not installed. Installing...")
    import subprocess
    subprocess.check_call(['pip', 'install', 'pillow'])
    print("\n[OK] Pillow installed. Please run this script again.")
