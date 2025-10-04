import { useEffect, useState } from 'react';
import { db, type DocumentWithSentences, type SentenceData } from '@/lib/db';
import { DictionaryLookup } from './DictionaryLookup';
import { ttsManager } from '@/lib/tts';

type Props = { docId: string };

export function Reader({ docId }: Props) {
  const [document, setDocument] = useState<DocumentWithSentences | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSentenceId, setCurrentSentenceId] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [showDictionary, setShowDictionary] = useState(false);
  const [lookupTerm, setLookupTerm] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingAll, setPlayingAll] = useState(false);

  useEffect(() => {
    setLoading(true);
    db.getDoc(docId)
      .then(setDocument)
      .finally(() => setLoading(false));
  }, [docId]);

  async function handleSentenceClick(sentence: SentenceData) {
    setCurrentSentenceId(sentence.id);
    
    if (isPlaying) {
      ttsManager.stop();
      setIsPlaying(false);
      return;
    }

    try {
      setIsPlaying(true);
      await ttsManager.playTTS(
        sentence.text, 
        'alloy', 
        docId, 
        sentence.id
      );
    } catch (error) {
      console.error('TTS playback failed:', error);
      alert('Text-to-speech playback failed. Please try again.');
    } finally {
      setIsPlaying(false);
    }
  }

  function handleTextSelection() {
    const selection = window.getSelection();
    const text = selection?.toString().trim() || '';
    setSelectedText(text);
  }

  function handleLookup() {
    if (!selectedText) {
      alert('Please select some text first');
      return;
    }
    // Clean up selected text and use first word for lookup
    const cleanText = selectedText.replace(/[^\w\s]/g, '').trim();
    const firstWord = cleanText.split(/\s+/)[0]?.toLowerCase();
    
    if (firstWord) {
      setLookupTerm(firstWord);
      setShowDictionary(true);
    }
  }

  function closeDictionary() {
    setShowDictionary(false);
    setLookupTerm('');
    // Clear selection
    window.getSelection()?.removeAllRanges();
    setSelectedText('');
  }

  async function handlePlayAll() {
    if (!document?.sentences.length || playingAll) return;
    
    try {
      setPlayingAll(true);
      
      for (let i = 0; i < document.sentences.length; i++) {
        const sentence = document.sentences[i];
        setCurrentSentenceId(sentence.id);
        
        try {
          await ttsManager.playTTS(sentence.text, 'alloy', docId, sentence.id);
          // Small pause between sentences
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Failed to play sentence ${i + 1}:`, error);
          // Continue with next sentence on error
        }
      }
    } catch (error) {
      console.error('Play all failed:', error);
    } finally {
      setPlayingAll(false);
      setCurrentSentenceId(null);
    }
  }

  function handleStopAll() {
    ttsManager.stop();
    setIsPlaying(false);
    setPlayingAll(false);
    setCurrentSentenceId(null);
  }

  if (loading) {
    return (
      <section>
        <h2>Reader</h2>
        <p>Loading document...</p>
      </section>
    );
  }

  if (!document) {
    return (
      <section>
        <h2>Reader</h2>
        <p>Document not found.</p>
      </section>
    );
  }

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>{document.meta.title}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {playingAll ? (
            <button onClick={handleStopAll}>
              ⏹️ Stop All
            </button>
          ) : (
            <button onClick={handlePlayAll} disabled={!document.sentences.length || isPlaying}>
              ▶️ Play All
            </button>
          )}
          <button onClick={handleLookup} disabled={!selectedText}>
            📖 Lookup "{selectedText.slice(0, 20)}{selectedText.length > 20 ? '...' : ''}"
          </button>
        </div>
      </div>

        <div style={{ fontSize: '0.9em', color: '#666', marginBottom: 16 }}>
        {document.meta.language && <span>Language: {document.meta.language} • </span>}
        <span>{document.sentences.length} sentences</span>
        {currentSentenceId && <span> • Current: sentence {document.sentences.findIndex(s => s.id === currentSentenceId) + 1}</span>}
        {(isPlaying || playingAll) && <span> • 🔊 Playing</span>}
      </div>      {document.sentences.length === 0 ? (
        <p style={{ color: '#666', fontStyle: 'italic' }}>No sentences found in this document.</p>
      ) : (
        <div 
          style={{ 
            lineHeight: 1.8, 
            fontSize: '1.1em',
            maxWidth: '800px'
          }}
          onMouseUp={handleTextSelection}
        >
          {document.sentences.map((sentence, index) => (
            <span
              key={sentence.id}
              onClick={() => handleSentenceClick(sentence)}
              style={{
                cursor: 'pointer',
                padding: '4px 2px',
                borderRadius: '3px',
                backgroundColor: currentSentenceId === sentence.id ? '#ffffcc' : 'transparent',
                transition: 'background-color 0.2s',
                border: currentSentenceId === sentence.id ? '1px solid #ddd' : '1px solid transparent',
                margin: '0 1px',
                display: 'inline-block',
              }}
              onMouseEnter={(e) => {
                if (currentSentenceId !== sentence.id) {
                  e.currentTarget.style.backgroundColor = '#f0f0f0';
                }
              }}
              onMouseLeave={(e) => {
                if (currentSentenceId !== sentence.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              title={`Sentence ${index + 1} - Click to ${isPlaying && currentSentenceId === sentence.id ? 'stop' : 'play'}`}
            >
              {sentence.text}
              {index < document.sentences.length - 1 && ' '}
            </span>
          ))}
        </div>
      )}

      <div style={{ marginTop: 24, padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
        <h3 style={{ margin: 0, marginBottom: 8, fontSize: '1em' }}>Reader Controls</h3>
        <div style={{ fontSize: '0.9em', color: '#666' }}>
          <p><strong>Click on any sentence</strong> to highlight and play audio with text-to-speech</p>
          <p><strong>Select text</strong> to look up words in the dictionary</p>
          <p><strong>Play All</strong> reads through the entire document</p>
          <p><strong>Note:</strong> TTS requires an OpenAI API key configured in settings</p>
        </div>
      </div>

      {showDictionary && lookupTerm && (
        <DictionaryLookup
          term={lookupTerm}
          language={document.meta.language || 'en'}
          onClose={closeDictionary}
        />
      )}
    </section>
  );
}
