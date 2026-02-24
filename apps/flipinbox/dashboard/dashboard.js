async function loadResults() {
  const onlyUnsub = document.getElementById('only-unsub').checked;
  const data = await chrome.storage.local.get(['senderResults']);
  const results = (data.senderResults || []).filter((r) => !onlyUnsub || r.hasUnsub);
  render(results);
}

function render(results) {
  const list = document.getElementById('list');
  list.innerHTML = '';
  results.forEach((r) => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <div>
        <div class="sender">${r.senderName}</div>
        <div class="meta">${r.senderEmail} · ${r.count} emails · ${r.lastDate || ''}</div>
      </div>
      <div class="actions">
        ${r.hasUnsub ? `<button class="btn-unsub" data-email="${r.senderEmail}" data-unsub="${r.unsubUrl || r.unsubMailto}">Unsubscribe</button>` : ''}
        <button class="btn-archive" data-archive="${r.senderEmail}">Archive</button>
        <button class="btn-delete" data-delete="${r.senderEmail}">Delete</button>
      </div>
    `;
    list.appendChild(div);
  });
}

function handleAction(e) {
  const unsub = e.target.getAttribute('data-unsub');
  const archive = e.target.getAttribute('data-archive');
  const del = e.target.getAttribute('data-delete');

  if (unsub) {
    window.open(unsub, '_blank');
    return;
  }
  if (archive) {
    chrome.runtime.sendMessage({ type: 'ARCHIVE_SENDER', senderEmail: archive }, () => {
      loadResults();
    });
    return;
  }
  if (del) {
    chrome.runtime.sendMessage({ type: 'DELETE_SENDER', senderEmail: del }, () => {
      loadResults();
    });
  }
}

document.getElementById('refresh').addEventListener('click', loadResults);
document.getElementById('only-unsub').addEventListener('change', loadResults);
document.getElementById('list').addEventListener('click', handleAction);

loadResults();
