export async function define(term: string, lang = 'de') {
  const res = await fetch(`/api/dictionary?q=${encodeURIComponent(term)}&lang=${lang}`);
  if (!res.ok) throw new Error('Dictionary lookup failed');
  return res.json();
}

export async function tts(text: string, voice = 'alloy') {
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text, voice })
  });
  if (!res.ok) throw new Error('TTS failed');
  return res.json();
}

export async function stt(file: File) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/stt', { method: 'POST', body: form });
  if (!res.ok) throw new Error('STT failed');
  return res.json();
}
