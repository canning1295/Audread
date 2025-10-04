import type { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

type DictionaryEntry = {
  term: string;
  lang: string;
  definitions: Definition[];
  cached: boolean;
  timestamp: string;
};

type Definition = {
  partOfSpeech?: string;
  definition: string;
  examples?: string[];
  translations?: string[];
};

// Cache dictionary lookups in Netlify Blobs
const cache = getStore({ name: 'audread-dictionary', consistency: 'strong' });

function getCacheKey(term: string, lang: string): string {
  return `${lang}:${term.toLowerCase().trim()}`;
}

async function getCachedEntry(term: string, lang: string): Promise<DictionaryEntry | null> {
  try {
    const key = getCacheKey(term, lang);
    const cached = await cache.get(key, { type: 'json' }) as DictionaryEntry | null;
    
    if (!cached) return null;
    
    // Check if cache is older than 7 days
    const cacheAge = Date.now() - new Date(cached.timestamp).getTime();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    return cacheAge > maxAge ? null : cached;
  } catch {
    return null;
  }
}

async function setCachedEntry(entry: DictionaryEntry): Promise<void> {
  try {
    const key = getCacheKey(entry.term, entry.lang);
    await cache.setJSON(key, entry);
  } catch (error) {
    console.error('Failed to cache dictionary entry:', error);
  }
}

async function lookupInPons(term: string, lang: string): Promise<Definition[]> {
  const apiKey = process.env.PONS_API_KEY;
  if (!apiKey) {
    console.log('PONS API key not configured, using fallback');
    return [];
  }

  try {
    // PONS API call
    const url = `https://api.pons.com/v1/dictionary?q=${encodeURIComponent(term)}&l=${lang}&in=de&f=json`;
    const response = await fetch(url, {
      headers: {
        'X-Secret': apiKey,
      },
    });

    if (!response.ok) {
      console.error('PONS API error:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    
    // Parse PONS response structure
    const definitions: Definition[] = [];
    
    if (Array.isArray(data) && data.length > 0) {
      const firstResult = data[0];
      if (firstResult.hits && Array.isArray(firstResult.hits)) {
        for (const hit of firstResult.hits.slice(0, 5)) { // Limit to 5 definitions
          if (hit.roms && Array.isArray(hit.roms)) {
            for (const rom of hit.roms) {
              if (rom.arabs && Array.isArray(rom.arabs)) {
                for (const arab of rom.arabs) {
                  if (arab.translations && Array.isArray(arab.translations)) {
                    const translation = arab.translations[0];
                    if (translation?.target) {
                      definitions.push({
                        partOfSpeech: rom.wordclass || undefined,
                        definition: translation.target,
                        examples: translation.source ? [translation.source] : undefined,
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return definitions;
  } catch (error) {
    console.error('PONS lookup failed:', error);
    return [];
  }
}

function getFallbackDefinitions(term: string, lang: string): Definition[] {
  // Simple fallback definitions for common words
  const fallbacks: Record<string, Record<string, Definition[]>> = {
    en: {
      'the': [{ definition: 'definite article', partOfSpeech: 'article' }],
      'and': [{ definition: 'conjunction connecting words or phrases', partOfSpeech: 'conjunction' }],
      'word': [{ definition: 'a single distinct meaningful element of speech or writing', partOfSpeech: 'noun' }],
      'hello': [{ definition: 'used as a greeting', partOfSpeech: 'interjection' }],
      'world': [{ definition: 'the earth and all the people and things on it', partOfSpeech: 'noun' }],
    },
    de: {
      'der': [{ definition: 'definite article (masculine)', partOfSpeech: 'article' }],
      'die': [{ definition: 'definite article (feminine/plural)', partOfSpeech: 'article' }],
      'das': [{ definition: 'definite article (neuter)', partOfSpeech: 'article' }],
      'und': [{ definition: 'and', partOfSpeech: 'conjunction' }],
      'hallo': [{ definition: 'hello', partOfSpeech: 'interjection' }],
    },
  };

  return fallbacks[lang]?.[term.toLowerCase()] || [{
    definition: `Definition not found for "${term}"`,
    partOfSpeech: 'unknown',
  }];
}

export const handler: Handler = async (event) => {
  const term = event.queryStringParameters?.q?.trim();
  const lang = event.queryStringParameters?.lang?.trim() || 'en';
  
  if (!term) {
    return { 
      statusCode: 400, 
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ error: 'missing q parameter' }) 
    };
  }

  try {
    // Check cache first
    let cachedEntry = await getCachedEntry(term, lang);
    
    if (cachedEntry) {
      return {
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(cachedEntry),
      };
    }

    // Try PONS API
    let definitions = await lookupInPons(term, lang);
    
    // Fallback to simple definitions if PONS fails
    if (definitions.length === 0) {
      definitions = getFallbackDefinitions(term, lang);
    }

    const entry: DictionaryEntry = {
      term,
      lang,
      definitions,
      cached: false,
      timestamp: new Date().toISOString(),
    };

    // Cache the result (fire and forget)
    setCachedEntry(entry).catch(error => 
      console.error('Failed to cache entry:', error)
    );

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(entry),
    };

  } catch (error: any) {
    console.error('Dictionary lookup error:', error);
    
    // Return fallback on any error
    const fallbackEntry: DictionaryEntry = {
      term,
      lang,
      definitions: getFallbackDefinitions(term, lang),
      cached: false,
      timestamp: new Date().toISOString(),
    };

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(fallbackEntry),
    };
  }
};
