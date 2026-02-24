async function scanInbox() {
  const status = document.getElementById('status');
  status.textContent = 'Scanning...';
  chrome.runtime.sendMessage({ type: 'SCAN_INBOX' }, (res) => {
    if (!res || !res.ok) {
      status.textContent = 'Scan failed';
      return;
    }
    status.textContent = `Found ${res.count} senders (scanned ${res.scanned})`;
  });
}

document.getElementById('scan-btn').addEventListener('click', scanInbox);

document.getElementById('open-dashboard').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html') });
});
