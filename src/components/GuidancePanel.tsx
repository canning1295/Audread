import { useMemo } from 'react';

export type ActiveView = 'library' | 'reader' | 'import' | 'settings';

type Props = {
  activeView: ActiveView;
};

export function GuidancePanel({ activeView }: Props) {
  const statusBadge = useMemo(() => {
    return { 
      label: 'Offline mode', 
      color: '#1f7a1f', 
      description: 'All data is stored locally in your browser using IndexedDB. No login required!' 
    };
  }, []);

  const viewHighlights: Record<ActiveView, { title: string; bullets: string[] }> = useMemo(
    () => ({
      library: {
        title: 'Focused view: Library',
        bullets: [
          'Every book you import appears here with language detection and sentence counts.',
          'Click "Read" to jump straight back to the last sentence you listened to.',
          'All books are stored locally in your browser using IndexedDB - no cloud sync required.',
        ],
      },
      import: {
        title: 'Focused view: Import',
        bullets: [
          'Upload EPUB, PDF, or TXT files that you legally own. We never send your raw uploads to external services—parsing happens locally in your browser before sentences are saved.',
          'Coming from Amazon Kindle? 1) Visit Amazon → Account & Lists → Content & Devices. 2) Choose "Download & transfer via USB" to save the AZW file. 3) Use Calibre (free) to convert AZW/KFX → EPUB or TXT. 4) Import the converted file here.',
          'Need a quick demo? Use "Create Sample Document" to explore the reader without importing a real book.',
        ],
      },
      reader: {
        title: 'Focused view: Reader',
        bullets: [
          'Click sentences to hear instant text-to-speech and to bookmark your place.',
          'Select any phrase and press "Lookup" for the bilingual dictionary. Definitions are fetched securely via the /api/dictionary Netlify Function.',
          '"Play All" streams audio sentence by sentence. Audio is generated on demand using your configured OpenAI API key and cached in IndexedDB for quick replay.',
        ],
      },
      settings: {
        title: 'Focused view: Settings',
        bullets: [
          'Store your Amazon contact email and authentication token here only if you plan to automate purchases. These values are stored locally in your browser.',
          'Enter provider keys (e.g., OPENAI_API_KEY) for speech synthesis and dictionary lookups. These are stored locally and used by Netlify Functions.',
          'Click "Save Settings" after each change. All settings are saved locally in IndexedDB.',
        ],
      },
    }),
    []
  );

  return (
    <aside
      style={{
        flex: '0 0 320px',
        maxWidth: '100%',
        padding: '16px',
        border: '1px solid #e1e1e1',
        borderRadius: 12,
        backgroundColor: '#fbfbfb',
        boxShadow: '0 4px 18px rgba(0,0,0,0.05)',
        position: 'sticky',
        top: 16,
        alignSelf: 'flex-start',
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: 12 }}>Guided Help</h2>
      <p style={{ marginTop: 0, color: '#444' }}>
        Follow these steps to bring your Amazon books into AudRead, keep them safe, and make the most of the reader tools.
      </p>

      <div
        style={{
          borderRadius: 8,
          padding: '12px',
          marginBottom: 16,
          backgroundColor: '#fff',
          border: `1px solid ${statusBadge.color}`,
        }}
      >
        <strong style={{ display: 'block', color: statusBadge.color, marginBottom: 6 }}>{statusBadge.label}</strong>
        <p style={{ margin: 0, fontSize: '0.9em', color: '#333' }}>{statusBadge.description}</p>
      </div>

      <details open style={{ marginBottom: 12 }}>
        <summary style={{ fontWeight: 600, cursor: 'pointer' }}>Quick start checklist</summary>
        <ol style={{ marginTop: 8, paddingLeft: 18, fontSize: '0.9em', color: '#333', lineHeight: 1.6 }}>
          <li>Open <em>Settings</em> to enter your Amazon email/token and any API keys (stored locally in your browser).</li>
          <li>Download Kindle purchases from Amazon → Content & Devices and convert them to EPUB/TXT with Calibre.</li>
          <li>Use <em>Import</em> to add the converted file. We parse it in-browser and store it locally.</li>
          <li>Head to <em>Library</em> → "Read" to launch the reader, play audio, and track vocabulary.</li>
        </ol>
      </details>

      <details open style={{ marginBottom: 12 }}>
        <summary style={{ fontWeight: 600, cursor: 'pointer' }}>Amazon account & book preparation</summary>
        <div style={{ marginTop: 8, fontSize: '0.9em', color: '#333', lineHeight: 1.6 }}>
          <p style={{ marginTop: 0 }}>Amazon does not expose a public API for personal libraries, so AudRead keeps you in control:</p>
          <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
            <li>
              <strong>Log in on Amazon</strong>: Go to <em>Account &amp; Lists → Content &amp; Devices → Books</em>. Use "Download &amp; transfer via USB" for each title you own.
            </li>
            <li>
              <strong>Convert safely</strong>: Calibre (Windows/Mac/Linux) or Kindle Previewer can convert AZW/KFX files to EPUB or TXT. Keep conversions on your machine; AudRead never uploads originals.
            </li>
            <li>
              <strong>Optional token storage</strong>: If you automate downloads later, store the generated Amazon token in <em>Settings → Amazon</em>. It's stored locally in your browser.
            </li>
          </ul>
        </div>
      </details>

      <details open style={{ marginBottom: 12 }}>
        <summary style={{ fontWeight: 600, cursor: 'pointer' }}>Security, privacy & data residency</summary>
        <div style={{ marginTop: 8, fontSize: '0.9em', color: '#333', lineHeight: 1.6 }}>
          <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
            <li><strong>No authentication required</strong>: All data is stored locally in your browser using IndexedDB. No login or account needed.</li>
            <li><strong>Local storage</strong>: Documents, sentences, settings, and cached audio are all stored in IndexedDB in your browser.</li>
            <li><strong>Settings security</strong>: Provider keys and Amazon tokens are saved in IndexedDB. Keep your device secure as these are accessible to anyone with access to your browser.</li>
            <li><strong>Audio & dictionary</strong>: Requests proxy through Netlify Functions to keep API keys on the server. Responses are cached locally in IndexedDB.</li>
          </ul>
        </div>
      </details>

      <details open style={{ marginBottom: 12 }}>
        <summary style={{ fontWeight: 600, cursor: 'pointer' }}>Where things are saved</summary>
        <div style={{ marginTop: 8, fontSize: '0.9em', color: '#333', lineHeight: 1.6 }}>
          <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
            <li><strong>Documents</strong>: Stored in IndexedDB locally in your browser (<code>src/lib/indexeddb.ts</code>).</li>
            <li><strong>Settings</strong>: Persisted in IndexedDB (<code>src/lib/indexeddb.ts</code>).</li>
            <li><strong>Audio cache</strong>: Cached in IndexedDB with optional TTL expiration.</li>
            <li><strong>Dictionary cache</strong>: Stored in IndexedDB to speed up repeated lookups.</li>
          </ul>
        </div>
      </details>

      <details open>
        <summary style={{ fontWeight: 600, cursor: 'pointer' }}>{viewHighlights[activeView].title}</summary>
        <ul style={{ marginTop: 8, paddingLeft: 18, fontSize: '0.9em', color: '#333', lineHeight: 1.6 }}>
          {viewHighlights[activeView].bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </details>
    </aside>
  );
}
