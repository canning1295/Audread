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
        <p>Loading your documents...</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Library</h2>
      {items.length === 0 ? (
        <div style={{ padding: 16, textAlign: 'center', color: '#666' }}>
          <p>No documents yet. Import some files to get started!</p>
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
    </section>
  );
}
