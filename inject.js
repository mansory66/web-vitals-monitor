/**
 * Injected Script - Runs in page context
 * Measures Core Web Vitals using Web APIs
 */

const metrics = {
  lcp: null,
  fid: null,
  cls: 0,
  inp: null,
  ttfb: null,
  fcp: null,
  dcl: null,
  load: null,
};

const navigationTiming = performance.getEntriesByType('navigation')[0];

// Time to First Byte
if (navigationTiming) {
  metrics.ttfb = navigationTiming.responseStart - navigationTiming.fetchStart;
}

// First Contentful Paint
const paintEntries = performance.getEntriesByType('paint');
paintEntries.forEach((entry) => {
  if (entry.name === 'first-contentful-paint') {
    metrics.fcp = entry.startTime;
  }
});

// DOMContentLoaded
if (navigationTiming) {
  metrics.dcl = navigationTiming.domContentLoadedEventEnd - navigationTiming.fetchStart;
}

// Load Event
if (navigationTiming) {
  metrics.load = navigationTiming.loadEventEnd - navigationTiming.fetchStart;
}

// Largest Contentful Paint
const observer = new PerformanceObserver((list) => {
  const entries = list.getEntries();
  const lastEntry = entries[entries.length - 1];
  metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
  sendMetric('lcp', metrics.lcp);
});

try {
  observer.observe({ entryTypes: ['largest-contentful-paint'] });
} catch (e) {
  console.log('LCP observer not supported');
}

// First Input Delay
const fidObserver = new PerformanceObserver((list) => {
  const entries = list.getEntries();
  entries.forEach((entry) => {
    metrics.fid = entry.processingStart - entry.startTime;
    sendMetric('fid', metrics.fid);
  });
});

try {
  fidObserver.observe({ entryTypes: ['first-input'] });
} catch (e) {
  console.log('FID observer not supported');
}

// Interaction to Next Paint (INP)
const inpObserver = new PerformanceObserver((list) => {
  const entries = list.getEntries();
  let maxDuration = 0;
  entries.forEach((entry) => {
    const duration = entry.duration;
    if (duration > maxDuration) {
      maxDuration = duration;
      metrics.inp = duration;
    }
  });
  if (metrics.inp) {
    sendMetric('inp', metrics.inp);
  }
});

try {
  inpObserver.observe({ entryTypes: ['event'] });
} catch (e) {
  console.log('INP observer not supported');
}

// Cumulative Layout Shift
const clsObserver = new PerformanceObserver((list) => {
  const entries = list.getEntries();
  entries.forEach((entry) => {
    if (!entry.hadRecentInput) {
      metrics.cls += entry.value;
      sendMetric('cls', metrics.cls.toFixed(3));
    }
  });
});

try {
  clsObserver.observe({ entryTypes: ['layout-shift'] });
} catch (e) {
  console.log('CLS observer not supported');
}

// Send metric to content script
function sendMetric(name, value) {
  window.postMessage({
    type: 'WEB_VITALS_METRIC',
    metric: {
      name,
      value,
      timestamp: Date.now()
    }
  }, '*');
}

// Send all metrics periodically
setInterval(() => {
  window.postMessage({
    type: 'WEB_VITALS_METRIC',
    metric: {
      name: 'all',
      value: metrics,
      timestamp: Date.now()
    }
  }, '*');
}, 1000);

// Listen for requests
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  
  if (event.data.type === 'REQUEST_METRICS') {
    window.postMessage({
      type: 'WEB_VITALS_METRIC',
      metric: {
        name: 'all',
        value: metrics,
        timestamp: Date.now()
      }
    }, '*');
  }
});
