# QR Tools

A pure frontend static site that provides QR code decoding and encoding. Except for fetching page content from a URL, all other features work locally and offline. Dependencies are loaded via CDN (jsQR, qrcodejs); they are pure JS and do not perform additional network requests.

## PWA Support

This project includes basic PWA support to allow install and offline usage.

- Install: Browsers will show an "Install app" option when visiting the site.
- Offline: Static assets are cached on first load; subsequent visits work offline for local features.

### Files & Config
- `manifest.webmanifest`: PWA manifest (name, theme color, display mode, icons).
- `sw.js`: Service Worker for caching and offline.
- `assets/icons/`: SVG placeholder icons (`icon-192.svg`, `icon-512.svg`, `icon-maskable.svg`).

Note: For best installability (especially Chrome), replace SVG icons with PNGs:

- 192x192 → `assets/icons/icon-192.png`
- 512x512 → `assets/icons/icon-512.png`
- Maskable 512x512 → `assets/icons/icon-maskable.png`

Update `manifest.webmanifest` `icons` accordingly (set `type` to `image/png` and adjust `src`).

## Features
- Decode
  - Import an image from local files and decode the QR code
  - Read an image from the clipboard (via paste event or clipboard read button)
  - Load and decode from an image URL (may be limited by CORS)
  - Decoded text can be copied by clicking or via a copy button
- Encode
  - Type any text to generate a QR code in real time (no button needed)
  - Enter a URL to fetch page body text and generate a QR code (requires network, may be blocked by CORS; long content will be truncated)

## Usage

Use a local HTTP server (Service Worker requires HTTPS or `http://localhost/`):

```zsh
cd ./simple-qr-tools
python3 -m http.server 8080
# or, if installed: http-server -p 8080
```

Open `http://localhost:8080/` in your browser.

Note: Opening via `file://` works for most features, but clipboard image access usually needs a secure context.

## CORS Notes
- "Import from image URL" and "Fetch page content from URL" may be restricted by the target site's cross-origin policy.
- If loading fails:
  - Image decode: download the image locally and import it from disk.
  - Page content fetch: copy the desired content into the text input and generate the QR code.

## Dependencies
- [jsQR](https://github.com/cozmo/jsQR) — pure JS QR code decoding
- [qrcodejs](https://github.com/davidshimjs/qrcodejs) — pure JS QR code generation

Loaded via CDN:
- `https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js`
- `https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js`

## Directory Structure
```
qr-tools/
├─ index.html
├─ assets/
│  ├─ styles.css
│  └─ app.js
└─ README.md
```

## Development Tips
- For fully offline usage, download the dependencies locally and reference them via relative paths.
- Consider preprocessing/summarizing very long page content to fit QR capacity limits.
- You can extend the drag-and-drop area to support multiple files and batch decoding.
