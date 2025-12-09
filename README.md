# Web Vitals Monitor

A powerful **browser extension** for real-time monitoring of Core Web Vitals on any website. Track LCP, FID, CLS, INP, and other critical performance metrics directly in your browser.

## Features

- **Real-time Metrics**: Monitor LCP, FID, CLS, INP, TTFB, FCP, DCL, and Load time
- **Popup Dashboard**: Quick view of current page metrics with status indicators
- **Full Dashboard**: Comprehensive analytics with charts and historical trends
- **Multi-site Tracking**: Automatically collects metrics from all visited websites
- **Smart Alerts**: Configurable thresholds with notifications for performance degradation
- **Data Export**: Export metrics as JSON for further analysis
- **Dark Mode**: Eye-friendly interface with dark mode support
- **Local Storage**: All data stored locally on your device (no cloud sync)
- **Performance Optimized**: Minimal overhead, efficient metric collection

## Core Web Vitals Explained

| Metric | Good | Needs Improvement | Poor |
|--------|------|------------------|------|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | 2.5s - 4s | > 4s |
| **FID** (First Input Delay) | ≤ 100ms | 100ms - 300ms | > 300ms |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |
| **INP** (Interaction to Next Paint) | ≤ 200ms | 200ms - 500ms | > 500ms |

## Installation

### Chrome / Edge

1. Download the extension files or clone this repository
2. Open `chrome://extensions/`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked**
5. Select the extension folder
6. Done! The extension is now active

### Firefox

1. Download the extension files
2. Open `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on**
4. Select `manifest.json` from the extension folder
5. Done! The extension is now active

## Usage

### Popup View (Quick Access)

Click the extension icon to see metrics for the current page:

- **LCP**: Largest Contentful Paint time
- **FID**: First Input Delay (if available)
- **CLS**: Cumulative Layout Shift score
- **INP**: Interaction to Next Paint
- **Additional metrics**: TTFB, FCP, DCL, Load

Each metric shows:
- Current value
- Status (✓ Good, ⚠ Needs Improvement, ✗ Poor)
- Metric description

### Dashboard View

Click **📊 Dashboard** to open the full analytics page:

- **Monitored Sites**: Cards showing metrics for each visited website
- **Performance Trends**: Charts displaying metric history over time
- **Statistics**: Summary of collected data and performance insights

### Settings

Click **⚙️** in the popup to access settings:

- **Auto-export metrics**: Automatically export data periodically
- **Show notifications**: Enable/disable performance alerts
- **Dark mode**: Toggle dark theme
- **Custom thresholds**: Set LCP and CLS thresholds for alerts

### Export Data

Click **📥 Export** to download metrics as JSON:

```json
{
  "url": "https://example.com",
  "title": "Example Website",
  "timestamp": "2024-01-15T10:30:00Z",
  "metrics": {
    "latest": {
      "lcp": 2100,
      "fid": 45,
      "cls": 0.08
    },
    "history": [...]
  }
}
```

## Architecture

### Files Structure

```
web-vitals-monitor/
├── manifest.json          # Extension configuration
├── popup.html            # Popup UI
├── popup.js              # Popup logic
├── popup.css             # Popup styles
├── content.js            # Content script (injected into pages)
├── inject.js             # Injected script (runs in page context)
├── background.js         # Background service worker
├── dashboard.html        # Full dashboard page
├── dashboard.js          # Dashboard logic
├── dashboard.css         # Dashboard styles
├── styles.css            # Shared styles
└── images/               # Extension icons
```

### How It Works

1. **Content Script** (`content.js`): Injected into every webpage
2. **Injected Script** (`inject.js`): Runs in page context, measures metrics using Web APIs
3. **Message Passing**: Metrics sent to background service worker
4. **Storage**: Metrics stored in Chrome/Firefox local storage
5. **UI**: Popup and dashboard display stored metrics

### Web APIs Used

- **PerformanceObserver**: Monitors LCP, FID, CLS, INP
- **Performance API**: Collects TTFB, FCP, DCL, Load times
- **Storage API**: Persists metrics locally
- **Chrome/Firefox APIs**: Extension management and notifications

## Performance Impact

- **Minimal overhead**: Uses native Web APIs
- **Efficient collection**: Batched metric updates
- **Local storage only**: No network requests
- **Automatic cleanup**: Old data removed after 24 hours

## Privacy

- **No data collection**: All metrics stored locally on your device
- **No cloud sync**: Data never leaves your browser
- **No tracking**: Extension doesn't track your browsing habits
- **Open source**: Code is transparent and auditable

## Development

### Project Structure

This is a vanilla JavaScript extension with no build process required. All files are plain HTML, CSS, and JavaScript.

### Debugging

1. Open `chrome://extensions/`
2. Find "Web Vitals Monitor"
3. Click **Details** → **Inspect views** → **background page**
4. Use browser DevTools to debug

### Testing

1. Visit various websites
2. Click the extension icon to view metrics
3. Open the dashboard to see trends
4. Check notifications for alerts

## Browser Support

- ✅ Chrome 88+
- ✅ Edge 88+
- ✅ Firefox 109+
- ✅ Opera 74+

## Limitations

- **FID**: Only available on pages with user interactions
- **INP**: Requires Chrome 98+ or Firefox 112+
- **Historical data**: Limited to last 100 entries per site
- **Local storage**: Data cleared when extension is uninstalled

## Troubleshooting

### Metrics not showing

1. Refresh the webpage
2. Wait 2-3 seconds for metrics to load
3. Check if JavaScript is enabled on the page
4. Ensure the extension has permission for the website

### Notifications not working

1. Check if notifications are enabled in settings
2. Verify browser notification permissions
3. Ensure thresholds are set correctly

### Data not persisting

1. Check if local storage is enabled
2. Verify extension has storage permissions
3. Try clearing extension data and reinstalling

## Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## License

MIT License - See LICENSE file for details

## Resources

- [Web Vitals Guide](https://web.dev/vitals/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [MDN Web Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [Extension Development Guide](https://developer.chrome.com/docs/extensions/)

## Support

For issues, questions, or suggestions:

1. Check existing issues on GitHub
2. Create a new issue with detailed information
3. Include browser version and extension version

---

**Made with ❤️ for web performance enthusiasts**

Monitor your Core Web Vitals. Optimize your websites. Improve user experience.
