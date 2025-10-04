import { useState } from 'react';
import { db, type SentenceData } from '@/lib/db';
import { parseFile } from '@/lib/parser';

type Props = { onImported: (id: string) => void };

export function FileImport({ onImported }: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingFile, setProcessingFile] = useState<string | null>(null);

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    
    try {
      for (const file of files) {
        setProcessingFile(file.name);
        
        // Parse the file
        const parsedDoc = await parseFile(file);
        
        // Save document metadata
        const docMeta = {
          id: parsedDoc.id,
          title: parsedDoc.title,
          language: parsedDoc.language,
          createdAt: parsedDoc.createdAt,
          sentenceCount: parsedDoc.sentences.length,
        };
        
        await db.saveDoc(docMeta);
        
        // Save sentences
        const sentences: SentenceData[] = parsedDoc.sentences.map(s => ({
          id: s.id,
          docId: parsedDoc.id,
          text: s.text,
          index: s.index,
          hash: s.hash,
        }));
        
        await db.saveSentences(parsedDoc.id, sentences);
        
        // Open the first imported document
        if (file === files[0]) {
          onImported(parsedDoc.id);
        }
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import failed. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingFile(null);
      // Clear the input
      event.target.value = '';
    }
  }

  async function handleSimulateImport() {
    setIsProcessing(true);
    try {
      // Create a sample document with some sentences
      const id = `doc_${Date.now()}`;
      const sampleSentences = [
        'This is a sample document for testing the AudRead application.',
        'It contains multiple sentences that can be read aloud using text-to-speech.',
        'Users can click on individual sentences to hear them spoken.',
        'The application also supports dictionary lookups for language learning.',
        'This simulated import helps test the core functionality.',
      ];
      
      await db.saveDoc({ 
        id, 
        title: 'Sample Document', 
        language: 'en',
        createdAt: new Date().toISOString(),
        sentenceCount: sampleSentences.length,
      });
      
      const sentences: SentenceData[] = sampleSentences.map((text, index) => ({
        id: `s_${index}`,
        docId: id,
        text,
        index,
        hash: `hash_${index}`,
      }));
      
      await db.saveSentences(id, sentences);
      onImported(id);
    } catch (error) {
      console.error('Simulate import failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <section>
      <h2>Import Documents</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <p>Upload EPUB, PDF, or TXT files to start reading</p>
          <span title="Supported formats: TXT, EPUB, PDF (convert to text for best results). Drag files or use the picker. Language is auto-detected. Click '?' for more tips." style={{ cursor: 'pointer', color: '#007bff', fontSize: '1.2em' }}>❓</span>
        </div>
      
      <div style={{ marginBottom: 16 }}>
        <input 
          type="file" 
          multiple 
          accept=".txt,.epub,.pdf"
          onChange={handleFileUpload}
          disabled={isProcessing}
        />
      </div>
      
      {isProcessing && (
        <div style={{ marginBottom: 16, padding: 8, backgroundColor: '#f0f0f0', borderRadius: 4 }}>
          <p>Processing {processingFile ? `"${processingFile}"` : 'files'}...</p>
        </div>
      )}
      
      <div>
        <button onClick={handleSimulateImport} disabled={isProcessing}>
          {isProcessing ? 'Processing...' : 'Create Sample Document'}
        </button>
      </div>
      
      <div style={{ marginTop: 16, fontSize: '0.9em', color: '#666' }}>
        <h3>Supported Formats:</h3>
        <ul>
          <li><strong>TXT:</strong> Plain text files</li>
          <li><strong>EPUB:</strong> E-book format (basic support)</li>
          <li><strong>PDF:</strong> Requires conversion to text first</li>
        </ul>
          <div style={{ marginTop: 8, color: '#007bff', fontSize: '0.95em' }}>
            <span title="Pro Tip: For PDFs, use a reliable converter to TXT for best results. You can create a sample document for testing.">💡 Pro Tip: For PDFs, convert to TXT for best results.</span>
          </div>
      </div>

      <details open style={{ marginTop: 16, fontSize: '0.9em', color: '#333' }}>
        <summary style={{ fontWeight: 600, cursor: 'pointer' }}>Step-by-step: move a Kindle book into AudRead</summary>
        <ol style={{ marginTop: 8, paddingLeft: 20, lineHeight: 1.6 }}>
          <li>Sign in to Amazon → <em>Account &amp; Lists</em> → <em>Content &amp; Devices</em> → <em>Books</em>.</li>
          <li>Select the title you own, choose <strong>Download &amp; transfer via USB</strong>, and save the AZW/KFX file.</li>
          <li>Open the file in Calibre (or Kindle Previewer) and convert it to <strong>EPUB</strong> or <strong>TXT</strong>.</li>
          <li>Return here, upload the converted file, and AudRead will parse it entirely in your browser before syncing summaries.</li>
        </ol>
      </details>

      <details open style={{ marginTop: 12, fontSize: '0.9em', color: '#333' }}>
        <summary style={{ fontWeight: 600, cursor: 'pointer' }}>Security & privacy notes</summary>
        <ul style={{ marginTop: 8, paddingLeft: 18, lineHeight: 1.6 }}>
          <li>Raw files are processed locally; only metadata and sentences sync to Netlify when you are logged in.</li>
          <li>If you stay signed out, everything remains in browser storage so nothing ever leaves your device.</li>
          <li>Delete a document from <em>Library</em> to remove it from both local storage and your synced account.</li>
        </ul>
      </details>
    </section>
  );
}
