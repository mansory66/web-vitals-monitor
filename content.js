/**
 * Content Script - Injected into every webpage
 * Collects Core Web Vitals and performance metrics
 */

// Inject the measurement script that runs in page context
const script = document.createElement('script');
script.src = chrome.runtime.getURL('inject.js');
script.onload = function() {
  this.remove();
};
(document.head || document.documentElement).appendChild(script);

// Listen for messages from the injected script
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  
  if (event.data.type && event.data.type === 'WEB_VITALS_METRIC') {
    // Send to background script
    chrome.runtime.sendMessage({
      type: 'STORE_METRIC',
      data: event.data.metric
    });
  }
});

// Listen for requests from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_METRICS') {
    // Request metrics from injected script
    window.postMessage({ type: 'REQUEST_METRICS' }, '*');
    
    // Wait a bit for response
    setTimeout(() => {
      chrome.storage.local.get(['metrics'], (result) => {
        sendResponse(result.metrics || {});
      });
    }, 100);
    
    return true; // Keep channel open for async response
  }
});
