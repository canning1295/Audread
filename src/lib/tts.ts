export type TTSVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

export type TTSResponse = {
  voice: string;
  url: string | null;
  cached: boolean;
  error?: string;
};

export class TTSManager {
  private currentAudio: HTMLAudioElement | null = null;
  private cache = new Map<string, string>();

  private getCacheKey(text: string, voice: string): string {
    return `${text.trim()}:${voice}`;
  }

  async generateTTS(text: string, voice: TTSVoice = 'alloy', docId?: string, sentenceId?: string): Promise<string | null> {
    const cacheKey = this.getCacheKey(text, voice);
    
    // Check local cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice,
          docId,
          sentenceId,
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status}`);
      }

      const data: TTSResponse = await response.json();
      
      if (data.error) {
        console.warn('TTS warning:', data.error);
      }

      if (data.url) {
        // Cache the URL locally
        this.cache.set(cacheKey, data.url);
        return data.url;
      }

      return null;
    } catch (error) {
      console.error('TTS generation failed:', error);
      
      // Fallback to browser Speech Synthesis API if available
      if ('speechSynthesis' in window) {
        return this.generateBrowserTTS(text);
      }
      
      return null;
    }
  }

  private generateBrowserTTS(text: string): string | null {
    if (!('speechSynthesis' in window)) {
      return null;
    }

    // Create a data URL that can be used to trigger browser TTS
    // This is a workaround since we can't directly get audio data from SpeechSynthesis
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    
    // Store the utterance for later use
    const key = `browser_${Date.now()}`;
    (window as any).__audreadUtterances = (window as any).__audreadUtterances || {};
    (window as any).__audreadUtterances[key] = utterance;
    
    return `browser://${key}`;
  }

  async playTTS(text: string, voice: TTSVoice = 'alloy', docId?: string, sentenceId?: string): Promise<void> {
    try {
      // Stop any currently playing audio
      this.stop();

      const audioUrl = await this.generateTTS(text, voice, docId, sentenceId);
      
      if (!audioUrl) {
        throw new Error('Failed to generate TTS audio');
      }

      // Handle browser TTS fallback
      if (audioUrl.startsWith('browser://')) {
        const key = audioUrl.replace('browser://', '');
        const utterance = (window as any).__audreadUtterances?.[key];
        if (utterance) {
          speechSynthesis.speak(utterance);
        }
        return;
      }

      // Create and play audio element
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;

      return new Promise((resolve, reject) => {
        audio.onended = () => {
          this.currentAudio = null;
          resolve();
        };
        
        audio.onerror = () => {
          this.currentAudio = null;
          reject(new Error('Audio playback failed'));
        };

        audio.play().catch(reject);
      });

    } catch (error) {
      console.error('TTS playback failed:', error);
      throw error;
    }
  }

  stop(): void {
    // Stop HTML audio
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }

    // Stop speech synthesis
    if ('speechSynthesis' in window && speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
  }

  isPlaying(): boolean {
    return (
      (this.currentAudio && !this.currentAudio.paused) ||
      (speechSynthesis?.speaking === true)
    );
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const ttsManager = new TTSManager();