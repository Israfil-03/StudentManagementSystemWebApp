# Assets Directory

This folder contains all images and branding assets for the Mirage Student Management System.

## Structure

```
assets/
├── branding/       # Logo, favicon, and OG images
│   ├── logo.svg    # Main logo (horizontal)
│   ├── favicon.svg # Browser favicon
│   └── og.svg      # Open Graph image for social sharing
├── images/         # UI images
│   └── .gitkeep
└── avatars/        # Default avatar images
    └── default-avatar.svg
```

## Usage

### In the Client App

Assets are copied to `client/public/` during setup. Reference them in React components:

```jsx
// Logo
<img src="/branding/logo.svg" alt="Mirage Logo" />

// Favicon (in index.html)
<link rel="icon" type="image/svg+xml" href="/branding/favicon.svg" />

// Avatar
<img src="/avatars/default-avatar.svg" alt="User Avatar" />
```

### Swapping Assets

To replace branding:
1. Replace files in this `assets/` folder
2. Copy to `client/public/` (or run the copy script)
3. Rebuild the frontend

## Guidelines

- Use SVG format when possible for scalability
- Keep file sizes small for fast loading
- Maintain consistent naming conventions
- All assets should work on both light and dark backgrounds
