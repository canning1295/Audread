import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';

import { FileImport } from './components/FileImport';
import { GuidancePanel } from '@/components/GuidancePanel';
import { Library } from './components/Library';
import { Reader } from './components/Reader';
import { Settings } from '@/components/Settings';
import { setTokenGetter } from '@/lib/auth';


type View = 'library' | 'reader' | 'import' | 'settings';

export function App() {
  const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  console.log('[App] Auth0 configuration:', { 
    domain: auth0Domain, 
    clientId: auth0ClientId ? `${auth0ClientId.substring(0, 10)}...` : 'missing',
    audience: auth0Audience || 'not set'
  });

  // Check if Auth0 is properly configured
  if (!auth0Domain || !auth0ClientId) {
    console.error('[App] Auth0 not configured! Missing domain or clientId');
    return (
      <div style={{ maxWidth: 920, margin: '40px auto', padding: 16 }}>
        <h1>⚠️ Configuration Error</h1>
        <div style={{ 
          padding: 20, 
          border: '2px solid #d32f2f', 
          borderRadius: 8, 
          backgroundColor: '#ffebee',
          marginTop: 20 
        }}>
          <h2>Auth0 Environment Variables Not Set</h2>
          <p>The application cannot start because Auth0 credentials are missing.</p>
          
          <h3>Required Environment Variables:</h3>
          <ul style={{ fontFamily: 'monospace', backgroundColor: '#fff', padding: 20, borderRadius: 4 }}>
            <li>VITE_AUTH0_DOMAIN: {auth0Domain || '❌ NOT SET'}</li>
            <li>VITE_AUTH0_CLIENT_ID: {auth0ClientId ? '✅ SET' : '❌ NOT SET'}</li>
            <li>VITE_AUTH0_AUDIENCE: {auth0Audience || '⚠️ NOT SET (optional but recommended)'}</li>
          </ul>

          <h3>To Fix:</h3>
          <ol style={{ lineHeight: 1.8 }}>
            <li>Go to <a href="https://app.netlify.com/" target="_blank">Netlify Dashboard</a></li>
            <li>Navigate to: Site configuration → Environment variables</li>
            <li>Add the required variables (see TODO_AUTH0_SETUP.md)</li>
            <li>Trigger a new deploy: Deploys → Trigger deploy → Deploy site</li>
          </ol>

          <p style={{ marginTop: 20, padding: 15, backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: 4 }}>
            <strong>📖 Documentation:</strong> Check <code>TODO_AUTH0_SETUP.md</code> and <code>NETLIFY_WORKFLOW.md</code> in the repository for detailed setup instructions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Auth0Provider
      domain={auth0Domain}
      clientId={auth0ClientId}
      authorizationParams={{ 
        redirect_uri: window.location.origin,
        audience: auth0Audience,
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      <AudReadApp />
    </Auth0Provider>
  );
}

function AudReadApp() {
  const [view, setView] = useState<View>('library');
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const { user, isAuthenticated, loginWithRedirect, logout, isLoading, getAccessTokenSilently } = useAuth0();

  const userEmail = user?.email ?? null;

  // Register the token getter function with the auth module
  useEffect(() => {
    if (isAuthenticated) {
      console.log('[App] User authenticated, registering token getter');
      setTokenGetter(async () => await getAccessTokenSilently());
    } else {
      console.log('[App] User not authenticated');
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  if (isLoading) return <div>Loading authentication...</div>;

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: 16 }}>
      <header style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <h1 style={{ marginRight: 'auto', fontSize: '2em', fontWeight: 'bold' }}>
          <span style={{ color: '#000' }}>Audible</span>
          <span style={{ 
            background: 'linear-gradient(90deg, #ff0000 0%, #ff7f00 14%, #ffff00 28%, #00ff00 42%, #0000ff 57%, #4b0082 71%, #9400d3 85%, #ff1493 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>read</span>
        </h1>
        <nav style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setView('library')}>Library</button>
          <button onClick={() => setView('import')}>Import</button>
          <button onClick={() => setView('settings')}>Settings</button>
          {isAuthenticated ? (
            <>
              <span style={{ opacity: 0.8 }}>{userEmail}</span>
              <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>Logout</button>
            </>
          ) : (
            <button onClick={() => loginWithRedirect()}>Login</button>
          )}
        </nav>
      </header>

      <main
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 24,
          alignItems: 'flex-start',
          marginTop: 24,
        }}
      >
        <div style={{ flex: '1 1 480px', minWidth: 0 }}>
          {view === 'import' && (
            <FileImport onImported={(id: string) => { setCurrentDocId(id); setView('reader'); }} />
          )}
          {view === 'library' && (
            <Library onOpen={(id: string) => { setCurrentDocId(id); setView('reader'); }} />
          )}
          {view === 'reader' && currentDocId && (
            <Reader docId={currentDocId} />
          )}
          {view === 'settings' && (
            <Settings userEmail={userEmail} />
          )}
        </div>
        <GuidancePanel activeView={view} userEmail={userEmail} />
      </main>
    </div>
  );
}
