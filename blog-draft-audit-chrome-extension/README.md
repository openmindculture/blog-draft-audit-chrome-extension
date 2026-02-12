# Substack Post Analyzer - Chrome Extension

A Chrome extension that helps you analyze your Substack post drafts with real-time metrics.

## Features

- **Word Count Tracking**: Displays current word count with visual indicator
  - ✓ Green check: 1000-2500 words (optimal range)
  - ✗ Red cross: Outside optimal range

- **External Link Verification**: Checks for educational links
  - Detects Wikipedia links
  - Detects .edu domain links
  - ✓ Green check: At least one qualifying link found
  - ✗ Red cross: No qualifying links

- **Auto-Update**: Metrics update automatically
  - Debounced updates while typing (1 second delay)
  - Interval updates every 30 seconds
  - MutationObserver for link changes

### Disclaimer, Privacy and Security

This software is provided for free "as is" without any warranty. Use at your own risk! According to an automated GitHub Copilot security audit, this is a privacy-respecting, secure extension, safe to use, that conforms to the [Chrome Extension Security Best Practices](https://developer.chrome.com/docs/extensions/mv3/security/).

### Issues and Contribution

Source code, issues and bug tracker are on GitHub at [openmindculture/blog-draft-audit-chrome-extension](https://github.com/openmindculture/blog-draft-audit-chrome-extension), feel welcome to open pull requests to improve this plugin!

## Usage

1. Navigate to any Substack post editor (e.g., `https://yoursubstack.substack.com/publish/post/...`)

2. Click the Substack Post Analyzer extension icon in your Chrome toolbar

3. Click "Activate Analyzer" in the popup

4. A floating panel will appear on the right side of your screen showing:
   - Current word count
   - Link verification status
   - Visual indicators (✓ or ✗)

5. Continue writing - the metrics will update automatically as you type

6. To close the panel, click the × button or use "Deactivate" in the popup

## Files Included

- `manifest.json` - Extension configuration
- `content.js` - Main analyzer logic
- `popup.html` - Extension popup interface
- `popup.js` - Popup functionality
- `icon16.png`, `icon48.png`, `icon128.png` - Extension icons

## Technical Details

### Word Count
- Counts all words in the editor
- Removes extra whitespace
- Target range: 1000-2500 words

### Link Detection
- Searches for `<a href>` tags in the editor
- Filters for http/https links only
- Checks for:
  - `wikipedia.org` in URL
  - `.edu` in URL

### Update Strategy
- **Debounced on change**: 1 second delay after typing stops
- **Interval update**: Every 30 seconds regardless of activity
- **Mutation observer**: Detects DOM changes (useful for link insertions)

## Browser Compatibility

- Chrome (Manifest V3)
- Edge (Chromium-based)
- Other Chromium browsers

## Privacy

This extension:
- Only runs on Substack domains
- Does not collect or transmit any data
- Works completely offline
- Does not require any external permissions beyond accessing the Substack page

## Troubleshooting

**Panel doesn't appear:**
- Make sure you're on a Substack editor page
- Try refreshing the page and activating again
- Check that the extension is enabled in chrome://extensions/

**Metrics not updating:**
- The extension looks for common editor selectors
- If Substack changes their editor structure, it may need updating
- Try deactivating and reactivating the extension

**Can't find the extension icon:**
- Click the puzzle piece icon in Chrome toolbar
- Pin the Substack Post Analyzer for easy access

## Future Enhancements

Possible additions:
- Readability score
- Estimated reading time
- Image count
- Custom word count ranges
- Export analytics
- Dark mode support

## License

Free to use and modify for personal or commercial purposes.
