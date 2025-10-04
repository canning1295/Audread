import { useEffect, useState } from 'react';
import { db, type DocMeta } from '@/lib/db';

type Props = { onOpen: (id: string) => void };

export function Library({ onOpen }: Props) {
  const [items, setItems] = useState<DocMeta[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => { 
    db.listDocs().then(setItems).finally(() => setLoading(false)); 
  }, []);

  if (loading) {
    return (
      <section>
        <h2>Library</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <p>Loading your documents...</p>
            <span title="Your imported documents appear here. Click 'Read' to open. Use the search bar to find books. Empty? Import files to get started!" style={{ cursor: 'pointer', color: '#007bff', fontSize: '1.2em' }}>❓</span>
          </div>
      </section>
    );
  }

  return (
    <section>
      <h2>Library</h2>
      {items.length === 0 ? (
        <div style={{ padding: 16, textAlign: 'center', color: '#666' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <p>No documents yet. Import some files to get started!</p>
              <span title="Pro Tip: Use tags (coming soon) to organize your library. Click 'Import' to add your first document." style={{ cursor: 'pointer', color: '#007bff', fontSize: '1.1em' }}>💡</span>
            </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {items.map((item) => (
            <div key={item.id} style={{ 
              border: '1px solid #ddd', 
              borderRadius: 8, 
              padding: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, marginBottom: 4 }}>{item.title}</h3>
                <div style={{ fontSize: '0.9em', color: '#666' }}>
                  {item.language && <span>Language: {item.language} • </span>}
                  {item.sentenceCount && <span>{item.sentenceCount} sentences • </span>}
                  <span>Added: {new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                  <span title="Click 'Read' to open this document. Your reading position is saved automatically." style={{ cursor: 'pointer', color: '#007bff', fontSize: '1em', marginLeft: 4 }}>❓</span>
              </div>
              <button 
                onClick={() => onOpen(item.id)}
                style={{ 
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              >
                Read
              </button>
            </div>
          ))}
        </div>
      )}

      <details open style={{ marginTop: 16, fontSize: '0.9em', color: '#333' }}>
        <summary style={{ fontWeight: 600, cursor: 'pointer' }}>Library tips & data management</summary>
        <ul style={{ marginTop: 8, paddingLeft: 18, lineHeight: 1.6 }}>
          <li>AudRead highlights the sentence you last played during the current session. Multi-device bookmarking is unlocked once you sign in and extend the storage functions.</li>
          <li>To remove a document today, clear it using your browser’s localStorage tools (key: <code>audread:docs:*</code>) or delete the matching blob in Netlify once API deletion is wired up.</li>
          <li>Want a hard backup? After logging in, the Netlify Blobs console shows your <code>users/&lt;identity-sub&gt;</code> folder.</li>
        </ul>
      </details>
    </section>
  );
}
