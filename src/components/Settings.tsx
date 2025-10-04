import { useEffect, useState } from 'react';
import { loadSettings, saveSettings, type AppSettings } from '@/lib/settings';

export function Settings() {
  const [settings, setSettings] = useState<AppSettings>({});
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings().then((s) => { setSettings(s || {}); setLoaded(true); });
  }, []);

  function update<K extends keyof AppSettings>(k: K, v: AppSettings[K]) {
    setSettings((prev) => ({ ...prev, [k]: v }));
  }

  async function onSave() {
    setSaving(true);
    try { await saveSettings(settings); } finally { setSaving(false); }
  }

  const amazon = settings.amazon || {}; 
  const providers = settings.providers || {};

  return (
    <section>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          Settings
          <span title="Configure your Amazon sync, API keys, and data provider here. Changes are saved locally. Pro Tip: Use strong passwords and keep your API keys private." style={{ cursor: 'pointer', color: '#007bff', fontSize: '1.2em' }}>❓</span>
        </h2>
        {!loaded && <p>Loading…</p>}
      {loaded && (
        <div style={{ display: 'grid', gap: 16, maxWidth: 640 }}>
          <fieldset>
            <legend>Amazon</legend>
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
          </fieldset>

          <fieldset>
            <legend>Provider Keys</legend>
            <label style={{ display: 'block', marginBottom: 8 }}>
              OPENAI_API_KEY
              <input
                type="password"
                value={providers.OPENAI_API_KEY || ''}
                onChange={(e) => update('providers', { ...providers, OPENAI_API_KEY: e.target.value })}
              />
            </label>
            {/* Add more providers as needed */}
          </fieldset>

          <div>
            <button onClick={onSave} disabled={saving}>{saving ? 'Saving…' : 'Save Settings'}</button>
          </div>
        </div>
      )}
    </section>
  );
}
