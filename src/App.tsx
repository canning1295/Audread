import { useEffect, useState } from 'react';
import { FileImport } from './components/FileImport';
import { Library } from './components/Library';
import { Reader } from './components/Reader';
import { Settings } from '@/components/Settings';
import { currentUser, onAuthChange, openLogin, logout, initIdentity } from './lib/auth';

type View = 'library' | 'reader' | 'import' | 'settings';

export function App() {
  const [view, setView] = useState<View>('library');
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    initIdentity();
    const u = currentUser();
    setUserEmail(u?.email ?? null);
    onAuthChange((nu) => setUserEmail(nu?.email ?? null));
  }, []);

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: 16 }}>
      <header style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <h1 style={{ marginRight: 'auto' }}>AudRead</h1>
        <nav style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setView('library')}>Library</button>
          <button onClick={() => setView('import')}>Import</button>
          <button onClick={() => setView('settings')}>Settings</button>
          {userEmail ? (
            <>
              <span style={{ opacity: 0.8 }}>{userEmail}</span>
              <button onClick={() => logout()}>Logout</button>
            </>
          ) : (
            <button onClick={() => openLogin()}>Login</button>
          )}
        </nav>
      </header>

      <main>
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
          <Settings />
        )}
      </main>
    </div>
  );
}
