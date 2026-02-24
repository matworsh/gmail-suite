import { getAuthToken } from './core/gmailAuth.js';
import { listMessageIds, getMessageMetadata, modifyMessage } from './core/gmailApi.js';
import { aggregateSenders } from './core/senders.js';
import { saveScanResults } from './core/storage.js';

const MAX_MESSAGES = 1200;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'SCAN_INBOX') {
    scanInbox().then(sendResponse).catch((err) => {
      console.error(err);
      sendResponse({ ok: false, error: String(err.message || err) });
    });
    return true;
  }

  if (message?.type === 'ARCHIVE_SENDER') {
    archiveBySender(message.senderEmail).then(sendResponse).catch((err) => {
      console.error(err);
      sendResponse({ ok: false, error: String(err.message || err) });
    });
    return true;
  }

  if (message?.type === 'DELETE_SENDER') {
    deleteBySender(message.senderEmail).then(sendResponse).catch((err) => {
      console.error(err);
      sendResponse({ ok: false, error: String(err.message || err) });
    });
    return true;
  }
});

async function scanInbox() {
  const token = await getAuthToken(true);
  const query = 'newer_than:90d -category:promotions';
  const ids = await listMessageIds(token, query);
  const limitedIds = ids.slice(0, MAX_MESSAGES);

  const messages = [];
  for (const id of limitedIds) {
    const data = await getMessageMetadata(token, id);
    messages.push(data);
  }

  const senders = aggregateSenders(messages);
  await saveScanResults(senders);

  return { ok: true, count: senders.length, scanned: limitedIds.length };
}

async function archiveBySender(senderEmail) {
  const token = await getAuthToken(true);
  const query = `from:${senderEmail}`;
  const ids = await listMessageIds(token, query, 100);
  for (const id of ids) {
    await modifyMessage(token, id, { removeLabelIds: ['INBOX'] });
  }
  return { ok: true, processed: ids.length };
}

async function deleteBySender(senderEmail) {
  const token = await getAuthToken(true);
  const query = `from:${senderEmail}`;
  const ids = await listMessageIds(token, query, 100);
  for (const id of ids) {
    await modifyMessage(token, id, { addLabelIds: ['TRASH'] });
  }
  return { ok: true, processed: ids.length };
}
