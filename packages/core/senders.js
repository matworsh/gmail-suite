export function parseFromHeader(value) {
  if (!value) return { name: '', email: '' };
  const match = value.match(/"?([^<"]+)"?\s*<([^>]+)>/);
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() };
  }
  return { name: '', email: value.trim() };
}

export function parseListUnsubscribe(value) {
  if (!value) return { url: '', mailto: '' };
  const urls = value.match(/<([^>]+)>/g) || [];
  let url = '';
  let mailto = '';
  urls.forEach((u) => {
    const cleaned = u.replace(/[<>]/g, '').trim();
    if (cleaned.startsWith('mailto:')) mailto = cleaned;
    else if (cleaned.startsWith('http')) url = cleaned;
  });
  return { url, mailto };
}

export function aggregateSenders(messages) {
  const map = new Map();

  messages.forEach((m) => {
    const headers = m.payload?.headers || [];
    const from = headers.find((h) => h.name === 'From')?.value || '';
    const unsub = headers.find((h) => h.name === 'List-Unsubscribe')?.value || '';
    const date = headers.find((h) => h.name === 'Date')?.value || '';

    const { name, email } = parseFromHeader(from);
    if (!email) return;

    const { url, mailto } = parseListUnsubscribe(unsub);

    if (!map.has(email)) {
      map.set(email, {
        senderEmail: email,
        senderName: name || email,
        count: 0,
        lastDate: date,
        hasUnsub: !!(url || mailto),
        unsubUrl: url,
        unsubMailto: mailto
      });
    }

    const entry = map.get(email);
    entry.count += 1;
    if (date && (!entry.lastDate || new Date(date) > new Date(entry.lastDate))) {
      entry.lastDate = date;
    }
    if (!entry.hasUnsub && (url || mailto)) {
      entry.hasUnsub = true;
      entry.unsubUrl = url;
      entry.unsubMailto = mailto;
    }
  });

  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}
