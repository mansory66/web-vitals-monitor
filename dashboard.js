/**
 * Dashboard Script - Manages the full dashboard page
 */

let charts = {};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById('refreshBtn').addEventListener('click', loadDashboard);
  document.getElementById('clearBtn').addEventListener('click', clearAllData);
}

function loadDashboard() {
  chrome.storage.local.get(['metrics'], (result) => {
    const metrics = result.metrics || {};
    
    if (Object.keys(metrics).length === 0) {
      document.getElementById('sitesList').innerHTML = 
        '<div class="empty-state">No data collected yet. Visit some websites to see metrics.</div>';
      return;
    }
    
    renderSites(metrics);
    renderCharts(metrics);
    renderStats(metrics);
  });
}

function renderSites(metrics) {
  const sitesList = document.getElementById('sitesList');
  sitesList.innerHTML = '';
  
  Object.entries(metrics).forEach(([tabId, data]) => {
    const latest = data.latest || {};
    
    const card = document.createElement('div');
    card.className = 'site-card';
    
    const url = new URL(data.url);
    const domain = url.hostname;
    
    card.innerHTML = `
      <div class="site-url" title="${data.url}">${domain}</div>
      <div class="site-metrics">
        <div class="site-metric">
          <span class="site-metric-label">LCP</span>
          <span class="site-metric-value">${latest.lcp ? latest.lcp.toFixed(0) + 'ms' : '—'}</span>
        </div>
        <div class="site-metric">
          <span class="site-metric-label">FID</span>
          <span class="site-metric-value">${latest.fid ? latest.fid.toFixed(0) + 'ms' : '—'}</span>
        </div>
        <div class="site-metric">
          <span class="site-metric-label">CLS</span>
          <span class="site-metric-value">${latest.cls ? latest.cls.toFixed(3) : '—'}</span>
        </div>
        <div class="site-metric">
          <span class="site-metric-label">INP</span>
          <span class="site-metric-value">${latest.inp ? latest.inp.toFixed(0) + 'ms' : '—'}</span>
        </div>
      </div>
    `;
    
    sitesList.appendChild(card);
  });
}

function renderCharts(metrics) {
  // Collect data from all sites
  const lcpData = [];
  const clsData = [];
  const fidData = [];
  const inpData = [];
  const labels = [];
  
  Object.values(metrics).forEach((data) => {
    if (data.history && data.history.length > 0) {
      data.history.forEach((entry) => {
        const time = new Date(entry.timestamp).toLocaleTimeString();
        
        if (entry.name === 'lcp' && !labels.includes(time)) {
          labels.push(time);
        }
        
        if (entry.name === 'lcp') lcpData.push(entry.value);
        if (entry.name === 'cls') clsData.push(entry.value);
        if (entry.name === 'fid') fidData.push(entry.value);
        if (entry.name === 'inp') inpData.push(entry.value);
      });
    }
  });
  
  // Limit to last 20 entries
  const maxEntries = 20;
  const startIdx = Math.max(0, labels.length - maxEntries);
  
  createChart('lcpChart', 'LCP (ms)', lcpData.slice(startIdx), labels.slice(startIdx), '#10b981');
  createChart('clsChart', 'CLS', clsData.slice(startIdx), labels.slice(startIdx), '#f59e0b');
  createChart('fidChart', 'FID (ms)', fidData.slice(startIdx), labels.slice(startIdx), '#3b82f6');
  createChart('inpChart', 'INP (ms)', inpData.slice(startIdx), labels.slice(startIdx), '#8b5cf6');
}

function createChart(canvasId, label, data, labels, color) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  
  // Destroy existing chart if it exists
  if (charts[canvasId]) {
    charts[canvasId].destroy();
  }
  
  charts[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels.length > 0 ? labels : ['No data'],
      datasets: [{
        label: label,
        data: data.length > 0 ? data : [0],
        borderColor: color,
        backgroundColor: color + '20',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: '#e5e7eb'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

function renderStats(metrics) {
  let totalSites = 0;
  let totalMetrics = 0;
  let goodLcp = 0;
  let goodCls = 0;
  
  Object.values(metrics).forEach((data) => {
    totalSites++;
    
    if (data.history) {
      totalMetrics += data.history.length;
    }
    
    const latest = data.latest || {};
    
    if (latest.lcp && latest.lcp <= 2500) {
      goodLcp++;
    }
    
    if (latest.cls && latest.cls <= 0.1) {
      goodCls++;
    }
  });
  
  document.getElementById('totalSites').textContent = totalSites;
  document.getElementById('totalMetrics').textContent = totalMetrics;
  document.getElementById('goodLcp').textContent = goodLcp;
  document.getElementById('goodCls').textContent = goodCls;
}

function clearAllData() {
  if (confirm('Are you sure you want to clear all collected metrics? This cannot be undone.')) {
    chrome.storage.local.set({ metrics: {} }, () => {
      loadDashboard();
    });
  }
}

// Refresh dashboard every 5 seconds
setInterval(loadDashboard, 5000);
