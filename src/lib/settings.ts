import { getToken } from './auth';

export type AppSettings = {
  amazon?: { email?: string; token?: string };
  providers?: Record<string, string>;
  preferences?: Record<string, unknown>;
};

export async function loadSettings(): Promise<AppSettings> {
  const token = await getToken();
  if (!token) return {};
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch('/api/settings', { headers });
  if (!res.ok) return {};
  return res.json();
}

export async function saveSettings(partial: AppSettings): Promise<void> {
  const token = await getToken();
  if (!token) throw new Error('Not authenticated');
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  await fetch('/api/settings', {
    method: 'PUT',
    headers,
    body: JSON.stringify(partial)
  });
}
