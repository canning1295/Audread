import React, { useState, useEffect } from 'react';

export type DictionaryEntry = {
  term: string;
  lang: string;
  definitions: Definition[];
  cached: boolean;
  timestamp: string;
};

export type Definition = {
  partOfSpeech?: string;
  definition: string;
  examples?: string[];
  translations?: string[];
};

type Props = {
  term: string;
  language?: string;
  onClose: () => void;
};

export function DictionaryLookup({ term, language = 'en', onClose }: Props) {
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load dictionary data on mount
  useEffect(() => {
    if (!term) return;
    
    setLoading(true);
    setError(null);
    
    const params = new URLSearchParams({
      q: term,
      lang: language,
    });

    fetch(`/api/dictionary?${params}`)
      .then(res => res.json())
      .then((data: DictionaryEntry) => {
        setEntry(data);
      })
      .catch(err => {
        console.error('Dictionary lookup failed:', err);
        setError('Failed to load dictionary entry');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [term, language]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 24,
        maxWidth: 500,
        maxHeight: '80vh',
        overflow: 'auto',
        margin: 16,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Dictionary: "{term}"</h3>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '20px', 
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            ×
          </button>
            <span title="Definitions, examples, and translations for your selected word. Cached results load instantly. Pro Tip: Use dictionary lookups to build your vocabulary." style={{ cursor: 'pointer', color: '#007bff', fontSize: '1.1em', marginLeft: 8 }}>❓</span>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <p>Looking up "{term}"...</p>
          </div>
        )}

        {error && (
          <div style={{ color: '#d32f2f', padding: 16, backgroundColor: '#ffebee', borderRadius: 4 }}>
            <p>{error}</p>
          </div>
        )}

        {entry && !loading && (
          <div>
            {entry.cached && (
              <div style={{ fontSize: '0.8em', color: '#666', marginBottom: 12 }}>
                <em>Cached result from {new Date(entry.timestamp).toLocaleString()}</em>
              </div>
            )}

            {entry.definitions.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>
                No definitions found for "{term}".
              </p>
            ) : (
              <div>
                {entry.definitions.map((def, index) => (
                  <div key={index} style={{ 
                    marginBottom: 16, 
                    paddingBottom: 12, 
                    borderBottom: index < entry.definitions.length - 1 ? '1px solid #eee' : 'none' 
                  }}>
                    {def.partOfSpeech && (
                      <div style={{ 
                        fontSize: '0.8em', 
                        fontWeight: 'bold', 
                        color: '#666',
                        marginBottom: 4,
                        textTransform: 'uppercase',
                      }}>
                        {def.partOfSpeech}
                      </div>
                    )}
                    
                    <div style={{ marginBottom: 8 }}>
                      {def.definition}
                    </div>

                    {def.examples && def.examples.length > 0 && (
                      <div style={{ fontSize: '0.9em', color: '#666', fontStyle: 'italic' }}>
                        <strong>Example:</strong> {def.examples[0]}
                      </div>
                    )}

                    {def.translations && def.translations.length > 0 && (
                      <div style={{ fontSize: '0.9em', color: '#666' }}>
                        <strong>Translations:</strong> {def.translations.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <button 
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}