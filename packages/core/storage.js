export async function saveScanResults(results) {
  await chrome.storage.local.set({ lastScanAt: Date.now(), senderResults: results });
}

export async function loadScanResults() {
  const data = await chrome.storage.local.get(['lastScanAt', 'senderResults']);
  return {
    lastScanAt: data.lastScanAt || null,
    senderResults: data.senderResults || []
  };
}
