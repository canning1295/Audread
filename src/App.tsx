import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';

import { FileImport } from './components/FileImport';
import { GuidancePanel } from '@/components/GuidancePanel';
import { Library } from './components/Library';
import { Reader } from './components/Reader';
import { Settings } from '@/components/Settings';


type View = 'library' | 'reader' | 'import' | 'settings';

export function App() {
  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{ redirect_uri: window.location.origin }}
    >
      <AudReadApp />
    </Auth0Provider>
  );
}

function AudReadApp() {
  const [view, setView] = useState<View>('library');
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const { user, isAuthenticated, loginWithRedirect, logout, isLoading } = useAuth0();

  const userEmail = user?.email ?? null;

  if (isLoading) return <div>Loading authentication...</div>;

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: 16 }}>
      <header style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <h1 style={{ marginRight: 'auto' }}>AudRead</h1>
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
