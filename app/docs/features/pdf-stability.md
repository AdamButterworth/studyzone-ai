# PDF Viewer Stability TODO (P1)

## Issues to fix

### 1. Page reloading on navigation
- When leaving the document page and coming back, the PDF reloads from scratch
- Should cache the signed URL and rendered pages so returning is instant
- Consider keeping the PdfViewer mounted (hidden) when switching to other routes within the same doc

### 2. Smooth progressive loading
- Sentinel-based progressive loading sometimes stalls
- Current fix: reconnect observer when visiblePages changes
- Investigate: should we just load all pages for short docs (<20 pages)?
- For long docs: ensure scrolling never hits a blank gap

### 3. No jumping on sidebar/panel toggle
- Opening/closing left sidebar causes PDF to reflow
- Opening/closing right panel (fullscreen toggle) causes width change → re-render
- Current buffered page approach (canvas snapshot) helps but isn't perfect
- Goal: sidebar/panel transitions should feel smooth with no content jump

### 4. Scroll position preservation
- When resizing panels, scroll position should stay at the same page
- Currently the PDF can jump to a different position after resize

## Possible approaches
- Use `position: sticky` or fixed-width render with CSS scaling (current approach)
- Cache rendered canvases in an offscreen buffer
- Debounce resize events more aggressively
- For navigation: store scroll position + visible page in session state
- For short docs: skip progressive loading entirely
