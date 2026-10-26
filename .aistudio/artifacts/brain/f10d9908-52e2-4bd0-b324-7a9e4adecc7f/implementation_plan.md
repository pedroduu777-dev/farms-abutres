# Implementation Plan - Fix GitHub Pages White Screen

## Problem
When hosting a Vite React Single Page Application on GitHub Pages, refreshing or accessing subpaths can result in a 404 error and a blank white screen because GitHub Pages does not know how to route SPA paths.

## Proposed Solution
1. **Create `404.html`**: Duplicate `index.html` as `public/404.html`. GitHub Pages automatically serves `404.html` for any route that isn't found, which correctly boots up the React SPA application.
2. **Verify Base Path**: Ensure `vite.config.ts` has `base: '/farms-abutres/'` (or relative support).
3. **Verify ErrorBoundary & Fallbacks**: Ensure robust error boundaries and safe local storage parsing.

## Steps
1. Copy `index.html` to `public/404.html`.
2. Build and verify applet compilation.
