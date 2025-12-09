/**
 * Background Service Worker
 * Manages extension state and storage
 */

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Web Vitals Monitor installed');
  
  // Set default settings
  chrome.storage.sync.get(['settings'], (result) => {
    if (!result.settings) {
      const defaultSettings = {
        notifications: true,
        darkMode: false,
        autoExport: false,
        thresholdLcp: 2500,
        thresholdCls: 0.1,
      };
      chrome.storage.sync.set({ settings: defaultSettings });
    }
  });
});

// Listen for metrics from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'STORE_METRIC') {
    const tabId = sender.tab.id;
    const url = sender.tab.url;
    
    // Store metrics in local storage
    chrome.storage.local.get(['metrics'], (result) => {
      const metrics = result.metrics || {};
      
      if (!metrics[tabId]) {
        metrics[tabId] = {
          url,
          history: [],
          latest: {}
        };
      }
      
      // Update latest metric
      const metricData = request.data;
      metrics[tabId].latest[metricData.name] = metricData.value;
      
      // Add to history
      metrics[tabId].history.push({
        ...metricData,
        timestamp: Date.now()
      });
      
      // Keep only last 100 entries
      if (metrics[tabId].history.length > 100) {
        metrics[tabId].history = metrics[tabId].history.slice(-100);
      }
      
      chrome.storage.local.set({ metrics });
      
      // Check thresholds and notify if needed
      checkThresholds(metricData, sender.tab);
    });
    
    sendResponse({ success: true });
  }
});

// Check if metrics exceed thresholds
function checkThresholds(metric, tab) {
  chrome.storage.sync.get(['settings'], (result) => {
    const settings = result.settings || {};
    
    if (!settings.notifications) return;
    
    let shouldNotify = false;
    let message = '';
    
    if (metric.name === 'lcp' && metric.value > settings.thresholdLcp) {
      shouldNotify = true;
      message = `⚠️ LCP is ${metric.value.toFixed(0)}ms (threshold: ${settings.thresholdLcp}ms)`;
    }
    
    if (metric.name === 'cls' && metric.value > settings.thresholdCls) {
      shouldNotify = true;
      message = `⚠️ CLS is ${metric.value.toFixed(3)} (threshold: ${settings.thresholdCls})`;
    }
    
    if (shouldNotify) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'images/icon-128.png',
        title: 'Web Vitals Alert',
        message: message,
        contextMessage: tab.title
      });
    }
  });
}

// Clean up old metrics
chrome.alarms.create('cleanupMetrics', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cleanupMetrics') {
    chrome.storage.local.get(['metrics'], (result) => {
      const metrics = result.metrics || {};
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      Object.keys(metrics).forEach((tabId) => {
        metrics[tabId].history = metrics[tabId].history.filter(
          (entry) => now - entry.timestamp < maxAge
        );
      });
      
      chrome.storage.local.set({ metrics });
    });
  }
});

// Handle tab removal
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.get(['metrics'], (result) => {
    const metrics = result.metrics || {};
    delete metrics[tabId];
    chrome.storage.local.set({ metrics });
  });
});
