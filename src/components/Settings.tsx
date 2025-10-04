import { useEffect, useState } from 'react';
import { loadSettings, saveSettings, type AppSettings } from '@/lib/settings';

export function Settings() {
  const [settings, setSettings] = useState<AppSettings>({});
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    console.log('[Settings] Loading settings from IndexedDB');
    loadSettings()
      .then((s) => { 
        console.log('[Settings] Settings loaded successfully:', s);
        setSettings(s || {}); 
        setLoaded(true); 
      })
      .catch((err) => {
        console.error('[Settings] Failed to load settings:', err);
        setLoaded(true);
      });
  }, []);

  function update<K extends keyof AppSettings>(k: K, v: AppSettings[K]) {
    setSettings((prev) => ({ ...prev, [k]: v }));
  }

  async function onSave() {
    console.log('[Settings] Save button clicked');
    setErrorMessage('');
    setSaving(true);
    try { 
      await saveSettings(settings);
      console.log('[Settings] Settings saved successfully');
      alert('Settings saved successfully!');
    } catch (err: any) {
      console.error('[Settings] Failed to save settings:', err);
      setErrorMessage(err?.message || 'Failed to save settings. Please check console for details.');
    } finally { 
      setSaving(false); 
    }
  }

  const amazon = settings.amazon || {}; 
  const providers = settings.providers || {};

  return (
    <section>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        Settings
        <span
          title="Configure Amazon credentials, provider keys, and personal preferences. All settings stored locally in IndexedDB."
          style={{ cursor: 'pointer', color: '#007bff', fontSize: '1.2em' }}
        >
          ❓
        </span>
      </h2>

      <div
        style={{
          marginBottom: 16,
          padding: 12,
          borderRadius: 8,
          border: '1px solid #d0d7de',
          backgroundColor: '#f6f8fa',
          color: '#333',
          fontSize: '0.95em',
        }}
      >
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          All settings are stored locally in your browser using IndexedDB. Your API keys and tokens never leave your device unless used by Netlify Functions for API calls.
        </p>
      </div>

      <details open style={{ marginBottom: 16 }}>
        <summary style={{ fontWeight: 600, cursor: 'pointer' }}>What belongs here?</summary>
        <ul style={{ marginTop: 8, paddingLeft: 18, lineHeight: 1.6 }}>
          <li>
            <strong>Amazon email + token</strong>: Used only for future automation (e.g., syncing your Kindle purchases). They are stored locally in IndexedDB.
          </li>
          <li>
            <strong>Provider keys</strong>: API credentials (such as <code>OPENAI_API_KEY</code>) are stored locally and sent to Netlify Functions only when making API calls.
          </li>
          <li>
            <strong>Preferences</strong>: Add custom JSON for reader defaults (voice, speed, dictionary language). Make sure to keep the structure simple key/value pairs.
          </li>
        </ul>
      </details>

      {!loaded && <p>Loading…</p>}
      {loaded && (
        <div style={{ display: 'grid', gap: 16, maxWidth: 720 }}>
          <fieldset>
            <legend>Amazon</legend>
            <p style={{ fontSize: '0.9em', color: '#555', lineHeight: 1.5 }}>
              Optional. Use your Amazon login email and the long-lived token you generate from Amazon's security page. Stored locally in your browser. AudRead does not sign into Amazon on your behalf unless you build the automation.
            </p>
            <label style={{ display: 'block', marginBottom: 8 }}>
              Email
              <input
                type="email"
                value={amazon.email || ''}
                onChange={(e) => update('amazon', { ...amazon, email: e.target.value })}
              />
            </label>
            <label style={{ display: 'block' }}>
              Token/Password
              <input
                type="password"
                value={amazon.token || ''}
                onChange={(e) => update('amazon', { ...amazon, token: e.target.value })}
              />
            </label>
            <p style={{ fontSize: '0.85em', color: '#666', marginTop: 8 }}>
              Tip: Generate an app-specific token in Amazon → Login &amp; Security. Store that value here instead of your primary password.
            </p>
          </fieldset>

          <fieldset>
            <legend>Provider Keys</legend>
            <p style={{ fontSize: '0.9em', color: '#555', lineHeight: 1.5 }}>
              Keys are stored locally and used by serverless functions only when needed. Leave them blank if you're evaluating features locally.
            </p>
            <label style={{ display: 'block', marginBottom: 8 }}>
              OPENAI_API_KEY
              <input
                type="password"
                value={providers.OPENAI_API_KEY || ''}
                onChange={(e) => update('providers', { ...providers, OPENAI_API_KEY: e.target.value })}
              />
            </label>
          </fieldset>

          <div>
            <button onClick={onSave} disabled={saving}>{saving ? 'Saving…' : 'Save Settings'}</button>
            {errorMessage && (
              <p style={{ marginTop: 8, fontSize: '0.85em', color: '#b42318', fontWeight: 'bold' }}>
                Error: {errorMessage}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
