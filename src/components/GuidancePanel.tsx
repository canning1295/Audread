import { useMemo } from 'react';
import { useIdentityDiagnostics } from '@/hooks/useIdentityDiagnostics';

export type ActiveView = 'library' | 'reader' | 'import' | 'settings';

type Props = {
  activeView: ActiveView;
  userEmail: string | null;
};

export function GuidancePanel({ activeView, userEmail }: Props) {
  const diagnostics = useIdentityDiagnostics();

  const statusBadge = useMemo(() => {
    if (diagnostics.error) {
      return { label: 'Action required', color: '#b42318', description: diagnostics.error };
    }
    if (!diagnostics.ready) {
      return { label: 'Identity loading…', color: '#8a6a00', description: 'The Netlify Identity widget is still loading. If this persists, restart the page or check the troubleshooting tips below.' };
    }
    if (!diagnostics.configured) {
      return {
        label: 'Configured at runtime',
        color: '#8a6a00',
        description:
          'The widget loaded with default settings. For local development on Vite, run “netlify dev” or set VITE_NETLIFY_IDENTITY_URL to your deployed site.',
      };
    }
    return { label: 'Identity ready', color: '#1f7a1f', description: `Using ${diagnostics.apiUrl || 'the default'} for authentication.` };
  }, [diagnostics]);

  const viewHighlights: Record<ActiveView, { title: string; bullets: string[] }> = useMemo(
    () => ({
      library: {
        title: 'Focused view: Library',
        bullets: [
          'Every book you import appears here with language detection and sentence counts.',
          'Click “Read” to jump straight back to the last sentence you listened to.',
          'If you are offline or signed out, the library is stored in your browser only; once you log in, it syncs to Netlify Blobs under your account.',
        ],
      },
      import: {
        title: 'Focused view: Import',
        bullets: [
          'Upload EPUB, PDF, or TXT files that you legally own. We never send your raw uploads to external services—parsing happens locally in your browser before sentences are saved.',
          'Coming from Amazon Kindle? 1) Visit Amazon → Account & Lists → Content & Devices. 2) Choose “Download & transfer via USB” to save the AZW file. 3) Use Calibre (free) to convert AZW/KFX → EPUB or TXT. 4) Import the converted file here.',
          'Need a quick demo? Use “Create Sample Document” to explore the reader without importing a real book.',
        ],
      },
      reader: {
        title: 'Focused view: Reader',
        bullets: [
          'Click sentences to hear instant text-to-speech and to bookmark your place.',
          'Select any phrase and press “Lookup” for the bilingual dictionary. Definitions are fetched securely via the /api/dictionary Netlify Function.',
          '“Play All” streams audio sentence by sentence. Audio is generated on demand using your configured OpenAI API key and is not stored after playback unless you extend storage in settings.',
        ],
      },
      settings: {
        title: 'Focused view: Settings',
        bullets: [
          'Store your Amazon contact email and authentication token here only if you plan to automate purchases. These values are stored in Netlify Blobs scoped to your Identity user and never saved to localStorage once synced.',
          'Enter provider keys (e.g., OPENAI_API_KEY) so speech synthesis and dictionary lookups can happen on the server without exposing keys in the browser.',
          'Click “Save Settings” after each change. Saves require that you are logged in—otherwise we keep the form local and prompt you to authenticate.',
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
        <p style={{ margin: '8px 0 0', fontSize: '0.9em', color: '#333' }}>
          <strong>User:</strong> {userEmail || 'Not logged in'}
        </p>
        {diagnostics.apiUrl && (
          <p style={{ margin: '4px 0 0', fontSize: '0.8em', color: '#666', wordBreak: 'break-all' }}>
            Identity endpoint: {diagnostics.apiUrl}
          </p>
        )}
      </div>

      <details open style={{ marginBottom: 12 }}>
        <summary style={{ fontWeight: 600, cursor: 'pointer' }}>Quick start checklist</summary>
        <ol style={{ marginTop: 8, paddingLeft: 18, fontSize: '0.9em', color: '#333', lineHeight: 1.6 }}>
          <li>Enable Netlify Identity on your deployed site and invite yourself via email.</li>
          <li>Log in with the header “Login” button. Watch for the Netlify popup; approve the domain.</li>
          <li>Open <em>Settings</em> to enter your Amazon email/token and any API keys (stored per Identity user).</li>
          <li>Download Kindle purchases from Amazon → Content & Devices and convert them to EPUB/TXT with Calibre.</li>
          <li>Use <em>Import</em> to add the converted file. We parse it in-browser and sync metadata to your storage.</li>
          <li>Head to <em>Library</em> → “Read” to launch the reader, play audio, and track vocabulary.</li>
        </ol>
      </details>

      <details open style={{ marginBottom: 12 }}>
        <summary style={{ fontWeight: 600, cursor: 'pointer' }}>Amazon account & book preparation</summary>
        <div style={{ marginTop: 8, fontSize: '0.9em', color: '#333', lineHeight: 1.6 }}>
          <p style={{ marginTop: 0 }}>Amazon does not expose a public API for personal libraries, so AudRead keeps you in control:</p>
          <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
            <li>
              <strong>Log in on Amazon</strong>: Go to <em>Account &amp; Lists → Content &amp; Devices → Books</em>. Use “Download &amp; transfer via USB” for each title you own.
            </li>
            <li>
              <strong>Convert safely</strong>: Calibre (Windows/Mac/Linux) or Kindle Previewer can convert AZW/KFX files to EPUB or TXT. Keep conversions on your machine; AudRead never uploads originals.
            </li>
            <li>
              <strong>Optional token storage</strong>: If you automate downloads later, store the generated Amazon token in <em>Settings → Amazon</em>. It syncs to Netlify Blobs and is sent only over HTTPS.
            </li>
          </ul>
        </div>
      </details>

      <details open style={{ marginBottom: 12 }}>
        <summary style={{ fontWeight: 600, cursor: 'pointer' }}>Security, privacy & data residency</summary>
        <div style={{ marginTop: 8, fontSize: '0.9em', color: '#333', lineHeight: 1.6 }}>
          <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
            <li><strong>Authentication</strong>: Netlify Identity issues a JWT stored by the widget. We never access your password; the widget talks directly to Netlify.</li>
            <li><strong>Local vs cloud</strong>: Signed-out sessions store docs and sentences in browser localStorage under <code>audread:*.</code> Sign in to sync via Netlify Functions to per-user blobs (see <code>netlify/functions/docs.ts</code>).</li>
            <li><strong>Settings security</strong>: Provider keys and Amazon tokens are saved only in the secure blob store keyed by your Identity <code>user.sub</code>. Functions reject requests without a valid Bearer token.</li>
            <li><strong>Audio & dictionary</strong>: Requests proxy through Netlify Functions so API keys stay server-side. Responses stream back to the browser and are not persisted unless you extend <code>lib/storage.ts</code>.</li>
          </ul>
        </div>
      </details>

      <details open style={{ marginBottom: 12 }}>
        <summary style={{ fontWeight: 600, cursor: 'pointer' }}>Where things are saved</summary>
        <div style={{ marginTop: 8, fontSize: '0.9em', color: '#333', lineHeight: 1.6 }}>
          <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
            <li><strong>Documents</strong>: Stored locally or synced via <code>/api/docs</code> → Netlify Blobs (<code>netlify/functions/docs.ts</code>).</li>
            <li><strong>Settings</strong>: Persisted with <code>/api/settings</code>, also backed by Netlify Blobs (<code>netlify/functions/settings.ts</code>).</li>
            <li><strong>Speech buffers</strong>: Held in memory via <code>lib/storage.ts</code>; customize to use persistent blobs if needed.</li>
            <li><strong>User identifiers</strong>: Anonymous browsers get a random UID saved as <code>audread:uid</code>; once you sign in, the Identity user ID takes over.</li>
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
