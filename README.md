# AudRead — Local-First PWA Language Reader

## 🎯 What's New (v0.2.0)
**AudRead now works completely offline with no login required!**
- ✅ All data stored locally in IndexedDB (documents, sentences, settings, audio cache)
- ✅ No authentication or user accounts needed
- ✅ Fast, private, and works offline
- ✅ Simplified architecture - removed Auth0 and Netlify Identity
- 📋 See `FUTURE_DEVELOPMENT.md` for planned cross-device sync feature

## What's Here
- Vite + React + TypeScript PWA scaffold (vite-plugin-pwa)
- **IndexedDB storage** for all user data (documents, settings, cache)
- Netlify Functions for server-side APIs (dictionary, TTS, STT)
- Minimal UI components (Import, Library, Reader, Settings)
- Local-first architecture - works completely offline

## Architecture Overview

### Client-Side Storage (IndexedDB)
- **Documents & Sentences**: All imported books stored locally
- **Settings**: User preferences and API keys stored locally
- **Audio Cache**: Generated TTS audio cached for quick replay
- **Dictionary Cache**: Lookup results cached to reduce API calls

### Server-Side (Netlify Functions)
- **Dictionary API**: Proxy to PONS or other dictionary services
- **TTS API**: Generate audio using OpenAI TTS
- **STT API**: Speech-to-text transcription (optional)

## Quickstart

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env` and set API keys for server-side functions:
```bash
# Only needed if you want TTS or dictionary features
OPENAI_API_KEY=your_key_here
PONS_API_KEY=your_key_here
```

### 3. Run Development Server
```bash
# Option A: Vite only (faster, but no Netlify Functions)
npm run dev

# Option B: Netlify Dev (includes Functions for TTS/dictionary)
npm run netlify:dev
```

Open http://localhost:5173 (Vite) or http://localhost:8888 (Netlify Dev)

## How It Works

### Data Storage
All your data is stored locally in your browser using IndexedDB:
- Import books → stored in IndexedDB
- Change settings → saved in IndexedDB
- Generate audio → cached in IndexedDB
- Look up words → results cached in IndexedDB

**No cloud sync required!** Your data stays on your device.

### API Keys
Settings like `OPENAI_API_KEY` are stored locally in IndexedDB and sent to Netlify Functions only when making API calls (never exposed in the browser).

## Importing Books

### From Amazon Kindle
1. Go to Amazon → Account & Lists → Content & Devices → Books
2. Select a book → "Download & transfer via USB" (downloads .azw file)
3. Use [Calibre](https://calibre-ebook.com/) to convert AZW → EPUB or TXT
4. Import the converted file in AudRead

### Supported Formats
- EPUB
- PDF
- TXT

## Features

### 📚 Library
- View all imported books
- Language detection
- Sentence count tracking
- Resume reading from last position

### 📖 Reader
- Click sentences for TTS playback
- Dictionary lookups
- Play all sentences sequentially
- Bookmark your position

### 🔊 Text-to-Speech
- Powered by OpenAI TTS (requires API key)
- Audio cached locally for offline replay
- Multiple voice options

### 📝 Settings
- Store Amazon credentials (optional, for future automation)
- Configure API keys (OPENAI_API_KEY, etc.)
- All settings stored locally in IndexedDB

## Files & Structure

### Core Application
- `src/App.tsx` - Main app component (no auth required)
- `src/lib/indexeddb.ts` - IndexedDB storage layer
- `src/lib/db.ts` - Data abstraction layer
- `src/lib/storage.ts` - Asset storage (audio, cache)
- `src/lib/settings.ts` - Settings management
- `src/lib/tts.ts` - Text-to-speech with caching

### Components
- `src/components/Library.tsx` - Book library view
- `src/components/Reader.tsx` - Reading interface
- `src/components/Settings.tsx` - Settings panel
- `src/components/FileImport.tsx` - Book import
- `src/components/GuidancePanel.tsx` - Help sidebar

### Netlify Functions
- `netlify/functions/dictionary.ts` - Dictionary API proxy
- `netlify/functions/tts.ts` - Text-to-speech generation
- `netlify/functions/stt.ts` - Speech-to-text (optional)
- `netlify/functions/settings.ts` - ⚠️ DEPRECATED (was for cloud storage)
- `netlify/functions/docs.ts` - ⚠️ DEPRECATED (was for cloud storage)

## Future Development

See `FUTURE_DEVELOPMENT.md` for:
- Cross-device sync options
- Import/export functionality
- Enhanced reading features
- Performance optimizations

## Development

### Type Checking
```bash
npm run typecheck
```

### Build for Production
```bash
npm run build
```

### Deploy to Netlify
```bash
# Via Netlify CLI
netlify deploy --prod

# Or connect your GitHub repo to Netlify for automatic deploys
```

## Notes on Privacy

### Local-First Approach
- All your books and data stay on your device
- No user accounts or authentication required
- API keys stored locally (not in cloud)

### API Calls
- Dictionary and TTS requests go through Netlify Functions
- Your API keys are sent with each request but never stored on the server
- Audio responses are cached locally in IndexedDB

### Data Clearing
- Clearing browser data will delete all your books and settings
- Consider using import/export feature (see `FUTURE_DEVELOPMENT.md`) to backup your library

## Amazon/Kindle Notes
There's no public API for accessing purchased Kindle books. You must:
1. Download books from Amazon's website
2. Convert using Calibre or similar tools
3. Import the converted files

This ensures you have full control over your books and they work offline.

## License
MIT
