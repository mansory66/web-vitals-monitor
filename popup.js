/**
 * Popup Script - Controls the extension popup UI
 */

// DOM Elements
const lcpValue = document.getElementById('lcpValue');
const lcpStatus = document.getElementById('lcpStatus');
const fidValue = document.getElementById('fidValue');
const fidStatus = document.getElementById('fidStatus');
const clsValue = document.getElementById('clsValue');
const clsStatus = document.getElementById('clsStatus');
const inpValue = document.getElementById('inpValue');
const inpStatus = document.getElementById('inpStatus');
const ttfbValue = document.getElementById('ttfbValue');
const fcpValue = document.getElementById('fcpValue');
const dclValue = document.getElementById('dclValue');
const loadValue = document.getElementById('loadValue');

const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const resetSettingsBtn = document.getElementById('resetSettingsBtn');

const dashboardBtn = document.getElementById('dashboardBtn');
const exportBtn = document.getElementById('exportBtn');

const autoExportToggle = document.getElementById('autoExportToggle');
const notificationsToggle = document.getElementById('notificationsToggle');
const darkModeToggle = document.getElementById('darkModeToggle');
const thresholdLcp = document.getElementById('thresholdLcp');
const thresholdCls = document.getElementById('thresholdCls');

// Get current tab
let currentTab = null;

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  currentTab = tabs[0];
  loadMetrics();
  loadSettings();
});

// Load metrics from storage
function loadMetrics() {
  chrome.storage.local.get(['metrics'], (result) => {
    const metrics = result.metrics || {};
    const tabMetrics = metrics[currentTab.id];
    
    if (tabMetrics && tabMetrics.latest) {
      const latest = tabMetrics.latest;
      
      // Update LCP
      if (latest.lcp) {
        lcpValue.textContent = latest.lcp.toFixed(0) + 'ms';
        lcpStatus.textContent = getStatus('lcp', latest.lcp);
        lcpStatus.className = 'metric-status ' + getStatusClass('lcp', latest.lcp);
      }
      
      // Update FID
      if (latest.fid) {
        fidValue.textContent = latest.fid.toFixed(0) + 'ms';
        fidStatus.textContent = getStatus('fid', latest.fid);
        fidStatus.className = 'metric-status ' + getStatusClass('fid', latest.fid);
      }
      
      // Update CLS
      if (latest.cls) {
        clsValue.textContent = latest.cls.toFixed(3);
        clsStatus.textContent = getStatus('cls', latest.cls);
        clsStatus.className = 'metric-status ' + getStatusClass('cls', latest.cls);
      }
      
      // Update INP
      if (latest.inp) {
        inpValue.textContent = latest.inp.toFixed(0) + 'ms';
        inpStatus.textContent = getStatus('inp', latest.inp);
        inpStatus.className = 'metric-status ' + getStatusClass('inp', latest.inp);
      }
      
      // Update additional metrics
      if (latest.ttfb) ttfbValue.textContent = latest.ttfb.toFixed(0) + 'ms';
      if (latest.fcp) fcpValue.textContent = latest.fcp.toFixed(0) + 'ms';
      if (latest.dcl) dclValue.textContent = latest.dcl.toFixed(0) + 'ms';
      if (latest.load) loadValue.textContent = latest.load.toFixed(0) + 'ms';
    }
  });
}

// Get status text
function getStatus(metric, value) {
  const thresholds = {
    lcp: { good: 2500, poor: 4000 },
    fid: { good: 100, poor: 300 },
    cls: { good: 0.1, poor: 0.25 },
    inp: { good: 200, poor: 500 }
  };
  
  const threshold = thresholds[metric];
  if (!threshold) return 'Unknown';
  
  if (value <= threshold.good) return '✓ Good';
  if (value <= threshold.poor) return '⚠ Needs Improvement';
  return '✗ Poor';
}

// Get status CSS class
function getStatusClass(metric, value) {
  const thresholds = {
    lcp: { good: 2500, poor: 4000 },
    fid: { good: 100, poor: 300 },
    cls: { good: 0.1, poor: 0.25 },
    inp: { good: 200, poor: 500 }
  };
  
  const threshold = thresholds[metric];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

// Load settings
function loadSettings() {
  chrome.storage.sync.get(['settings'], (result) => {
    const settings = result.settings || {};
    autoExportToggle.checked = settings.autoExport || false;
    notificationsToggle.checked = settings.notifications !== false;
    darkModeToggle.checked = settings.darkMode || false;
    thresholdLcp.value = settings.thresholdLcp || 2500;
    thresholdCls.value = settings.thresholdCls || 0.1;
    
    if (darkModeToggle.checked) {
      document.body.classList.add('dark-mode');
    }
  });
}

// Settings modal
settingsBtn.addEventListener('click', () => {
  settingsModal.classList.remove('hidden');
});

closeSettingsBtn.addEventListener('click', () => {
  settingsModal.classList.add('hidden');
});

saveSettingsBtn.addEventListener('click', () => {
  const settings = {
    autoExport: autoExportToggle.checked,
    notifications: notificationsToggle.checked,
    darkMode: darkModeToggle.checked,
    thresholdLcp: parseInt(thresholdLcp.value),
    thresholdCls: parseFloat(thresholdCls.value)
  };
  
  chrome.storage.sync.set({ settings }, () => {
    settingsModal.classList.add('hidden');
    
    if (darkModeToggle.checked) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  });
});

resetSettingsBtn.addEventListener('click', () => {
  const defaultSettings = {
    autoExport: false,
    notifications: true,
    darkMode: false,
    thresholdLcp: 2500,
    thresholdCls: 0.1
  };
  
  chrome.storage.sync.set({ settings: defaultSettings }, () => {
    loadSettings();
  });
});

// Dashboard button
dashboardBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
});

// Export button
exportBtn.addEventListener('click', () => {
  chrome.storage.local.get(['metrics'], (result) => {
    const metrics = result.metrics || {};
    const tabMetrics = metrics[currentTab.id];
    
    if (tabMetrics) {
      const data = {
        url: currentTab.url,
        title: currentTab.title,
        timestamp: new Date().toISOString(),
        metrics: tabMetrics
      };
      
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `web-vitals-${Date.now()}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
    }
  });
});

// Refresh metrics every second
setInterval(loadMetrics, 1000);

// Dark mode toggle
darkModeToggle.addEventListener('change', () => {
  if (darkModeToggle.checked) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
});
