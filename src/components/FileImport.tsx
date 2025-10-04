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
      <p>Upload EPUB, PDF, or TXT files to start reading</p>
      
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
      </div>
    </section>
  );
}
