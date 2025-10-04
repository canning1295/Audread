import { getToken } from './auth';

export type AppSettings = {
  amazon?: { email?: string; token?: string };
  providers?: Record<string, string>;
  preferences?: Record<string, unknown>;
};

export async function loadSettings(): Promise<AppSettings> {
  console.log('[Settings API] loadSettings called');
  const token = await getToken();
  console.log('[Settings API] Token retrieved:', token ? `${token.substring(0, 20)}...` : 'null');
  
  if (!token) {
    console.warn('[Settings API] No token available, returning empty settings');
    return {};
  }
  
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  try {
    console.log('[Settings API] Fetching settings from /api/settings');
    const res = await fetch('/api/settings', { headers });
    console.log('[Settings API] Response status:', res.status, res.statusText);
    
    if (!res.ok) {
      console.error('[Settings API] Failed to load settings:', res.status, await res.text());
      return {};
    }
    
    const data = await res.json();
    console.log('[Settings API] Settings loaded successfully');
    return data;
  } catch (error) {
    console.error('[Settings API] Exception while loading settings:', error);
    return {};
  }
}

export async function saveSettings(partial: AppSettings): Promise<void> {
  console.log('[Settings API] saveSettings called with data:', partial);
  const token = await getToken();
  console.log('[Settings API] Token retrieved:', token ? `${token.substring(0, 20)}...` : 'null');
  
  if (!token) {
    console.error('[Settings API] No token available, cannot save settings');
    throw new Error('Not authenticated - please log in to save settings');
  }
  
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  try {
    console.log('[Settings API] Sending PUT request to /api/settings');
    const response = await fetch('/api/settings', {
      method: 'PUT',
      headers,
      body: JSON.stringify(partial)
    });
    
    console.log('[Settings API] Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Settings API] Failed to save settings:', response.status, errorText);
      throw new Error(`Failed to save settings: ${response.status} - ${errorText}`);
    }
    
    console.log('[Settings API] Settings saved successfully');
  } catch (error) {
    console.error('[Settings API] Exception while saving settings:', error);
    throw error;
  }
}
