# Extension Icons

This directory should contain the extension icons in the following sizes:

- `icon16.png` - 16x16 pixels (toolbar icon)
- `icon32.png` - 32x32 pixels (extension management)
- `icon48.png` - 48x48 pixels (extension management)
- `icon128.png` - 128x128 pixels (Chrome Web Store)

## Creating Icons

You can create icons using:

1. **Figma / Adobe Illustrator** - Design your logo
2. **Export to PNG** at the required sizes
3. **Online Tools**:
   - https://www.favicon-generator.org/
   - https://realfavicongenerator.net/
   - https://www.figma.com/

## Icon Design Suggestions

For the Meeting Intelligence extension, consider:

- **Theme**: Microphone, brain, notes, or AI-related imagery
- **Colors**: Blue (#4285f4), Purple (#6c63ff) from the brand
- **Style**: Modern, clean, recognizable at small sizes
- **Background**: Transparent or solid color

## Temporary Placeholder

Until you create custom icons, you can:

1. Use colored squares as placeholders
2. Generate simple icons from text using Canvas or online tools
3. Use emoji-based icons (🎙️, 🧠, 📝)

## Quick Icon Generation (Command Line)

If you have ImageMagick installed:

```bash
# Create a simple blue circle icon
convert -size 128x128 xc:none -fill "#4285f4" -draw "circle 64,64 64,8" icon128.png
convert icon128.png -resize 48x48 icon48.png
convert icon128.png -resize 32x32 icon32.png
convert icon128.png -resize 16x16 icon16.png
```

## Using Canvas (Browser Console)

Run this in Chrome DevTools to generate a simple icon:

```javascript
const canvas = document.createElement('canvas');
canvas.width = 128;
canvas.height = 128;
const ctx = canvas.getContext('2d');

// Background gradient
const gradient = ctx.createLinearGradient(0, 0, 128, 128);
gradient.addColorStop(0, '#4285f4');
gradient.addColorStop(1, '#6c63ff');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 128, 128);

// Icon text
ctx.fillStyle = 'white';
ctx.font = 'bold 64px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('MI', 64, 64);

// Download
canvas.toBlob(blob => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'icon128.png';
  a.click();
});
```

Replace this with actual icon files before submitting to the Chrome Web Store!
