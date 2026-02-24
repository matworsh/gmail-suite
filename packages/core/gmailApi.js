const GMAIL_API = 'https://www.googleapis.com/gmail/v1/users/me';

export async function listMessageIds(token, query, maxResults = 200) {
  const ids = [];
  let pageToken = null;

  do {
    const url = new URL(`${GMAIL_API}/messages`);
    url.searchParams.set('q', query);
    url.searchParams.set('maxResults', String(maxResults));
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Gmail list failed: ${res.status}`);
    const data = await res.json();

    if (Array.isArray(data.messages)) {
      data.messages.forEach((m) => ids.push(m.id));
    }
    pageToken = data.nextPageToken || null;
  } while (pageToken && ids.length < 2000);

  return ids;
}

export async function getMessageMetadata(token, id) {
  const url = `${GMAIL_API}/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=List-Unsubscribe&metadataHeaders=Date`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`Gmail message failed: ${res.status}`);
  return res.json();
}

export async function modifyMessage(token, id, body) {
  const res = await fetch(`${GMAIL_API}/messages/${id}/modify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`Gmail modify failed: ${res.status}`);
  return res.json();
}
