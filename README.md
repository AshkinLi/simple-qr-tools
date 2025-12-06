# QR Tools

A pure frontend static site that provides QR code decoding and encoding. Except for fetching page content from a URL, all other features work locally and offline. Dependencies are loaded via CDN (jsQR, qrcodejs); they are pure JS and do not perform additional network requests.

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

Run with a local HTTP server to enable full browser capabilities:

```zsh
cd /Users/ashkin/Developer/qr-tools
python3 -m http.server 8000
```

Open `http://localhost:8000/` in your browser.

> Note: Opening via `file://` works for most features, but reading images directly from the clipboard typically requires HTTPS or a secure context. A local HTTP server is recommended.

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
