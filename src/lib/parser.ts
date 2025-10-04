import { franc } from 'franc';

export type ParsedDocument = {
  id: string;
  title: string;
  language?: string;
  sentences: ParsedSentence[];
  createdAt: string;
};

export type ParsedSentence = {
  id: string;
  text: string;
  index: number;
  hash: string;
};

// Simple sentence segmentation - splits on sentence-ending punctuation
function segmentIntoSentences(text: string): string[] {
  // Clean up the text first
  const cleaned = text.replace(/\s+/g, ' ').trim();
  
  // Simple sentence boundaries: . ! ? followed by whitespace and capital letter
  const sentences = cleaned.split(/(?<=[.!?])\s+(?=[A-Z])/);
  
  // Filter out very short "sentences" and trim
  return sentences
    .map(s => s.trim())
    .filter(s => s.length > 10); // Minimum sentence length
}

// Create a simple hash for sentence deduplication
function hashSentence(text: string): string {
  let hash = 0;
  if (text.length === 0) return hash.toString();
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

// Detect language using franc
function detectLanguage(text: string): string | undefined {
  try {
    const detected = franc(text);
    // franc returns 'und' for undefined/unknown language
    return detected === 'und' ? undefined : detected;
  } catch {
    return undefined;
  }
}

// Extract title from filename or content
function extractTitle(filename: string, content?: string): string {
  // Remove file extension and clean up filename
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  const cleaned = nameWithoutExt.replace(/[_-]/g, ' ').replace(/\s+/g, ' ').trim();
  
  if (cleaned.length > 0) {
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  
  // Fallback to first line of content if filename is not useful
  if (content) {
    const firstLine = content.split('\n')[0]?.trim();
    if (firstLine && firstLine.length > 0 && firstLine.length < 100) {
      return firstLine;
    }
  }
  
  return 'Untitled Document';
}

export async function parseTxtFile(file: File): Promise<ParsedDocument> {
  const content = await file.text();
  const sentences = segmentIntoSentences(content);
  const language = detectLanguage(content);
  const title = extractTitle(file.name, content);
  
  const parsedSentences: ParsedSentence[] = sentences.map((text, index) => ({
    id: `s_${index}`,
    text,
    index,
    hash: hashSentence(text),
  }));
  
  return {
    id: `doc_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    title,
    language,
    sentences: parsedSentences,
    createdAt: new Date().toISOString(),
  };
}

export async function parseEpubFile(file: File): Promise<ParsedDocument> {
  // For now, treat EPUB as text by extracting basic content
  // In a full implementation, we'd use epub2 or similar library
  try {
    // This is a simplified version - real EPUB parsing would extract HTML content
    const buffer = await file.arrayBuffer();
    const text = new TextDecoder().decode(buffer);
    
    // Extract readable text (very basic - real implementation would parse XML/HTML)
    const readableText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
    
    const sentences = segmentIntoSentences(readableText);
    const language = detectLanguage(readableText);
    const title = extractTitle(file.name, readableText);
    
    const parsedSentences: ParsedSentence[] = sentences.map((text, index) => ({
      id: `s_${index}`,
      text,
      index,
      hash: hashSentence(text),
    }));
    
    return {
      id: `doc_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      title,
      language,
      sentences: parsedSentences,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('EPUB parsing error:', error);
    // Fallback to basic text parsing
    return parseTxtFile(file);
  }
}

export async function parsePdfFile(file: File): Promise<ParsedDocument> {
  // PDF parsing requires server-side processing or a web-based PDF library
  // For now, we'll create a placeholder that suggests uploading as text
  const title = extractTitle(file.name);
  
  return {
    id: `doc_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    title: `${title} (PDF - Convert to text first)`,
    language: undefined,
    sentences: [{
      id: 's_0',
      text: 'PDF parsing is not yet implemented. Please convert your PDF to text format and upload again.',
      index: 0,
      hash: hashSentence('PDF parsing placeholder'),
    }],
    createdAt: new Date().toISOString(),
  };
}

export async function parseFile(file: File): Promise<ParsedDocument> {
  const extension = file.name.toLowerCase().split('.').pop();
  
  switch (extension) {
    case 'txt':
    case 'text':
      return parseTxtFile(file);
    case 'epub':
      return parseEpubFile(file);
    case 'pdf':
      return parsePdfFile(file);
    default:
      // Default to text parsing
      return parseTxtFile(file);
  }
}