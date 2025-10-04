import { useEffect, useState } from 'react';

import { FileImport } from './components/FileImport';
import { GuidancePanel } from '@/components/GuidancePanel';
import { Library } from './components/Library';
import { Reader } from './components/Reader';
import { Settings } from '@/components/Settings';
import { initCleanup } from '@/lib/indexeddb';

type View = 'library' | 'reader' | 'import' | 'settings';

export function App() {
  const [view, setView] = useState<View>('library');
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);

  // Initialize IndexedDB cleanup on mount
  useEffect(() => {
    console.log('[App] Initializing IndexedDB cleanup');
    initCleanup();
  }, []);

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: 16 }}>
      <header style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <h1 style={{ marginRight: 'auto', fontSize: '2em', fontWeight: 'bold' }}>
          <span style={{ color: '#000' }}>Aud</span>
          <span style={{ 
            background: 'linear-gradient(90deg, #ff0000 0%, #ff7f00 14%, #ffff00 28%, #00ff00 42%, #0000ff 57%, #4b0082 71%, #9400d3 85%, #ff1493 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>read</span>
          <span style={{ color: '#000' }}>ible</span>
        </h1>
        <nav style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setView('library')}>Library</button>
          <button onClick={() => setView('import')}>Import</button>
          <button onClick={() => setView('settings')}>Settings</button>
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
            <Settings />
          )}
        </div>
        <GuidancePanel activeView={view} />
      </main>
    </div>
  );
}
