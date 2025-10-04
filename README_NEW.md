# AudRead

A privacy-first PWA for language learners to import their own reading material (EPUB/PDF/TXT), read with sentence-level text-to-speech, and tap-to-define words with dictionary lookups. All user content remains local-first; cloud is only used for optional caches and metadata.

## ✅ Features Implemented

### 📚 File Import Pipeline
- **TXT file parsing** with sentence segmentation
- **EPUB file parsing** (basic support)
- **PDF placeholder** (requires conversion to text)
- **Language detection** using franc library
- **Automatic title extraction** from filename or content

### 📖 Enhanced Reader
- **Sentence-level rendering** with click interactions
- **Text-to-speech playback** for individual sentences
- **Play All functionality** for continuous reading
- **Text selection** for dictionary lookups
- **Visual feedback** with sentence highlighting

### 🔍 Dictionary Lookup System
- **PONS API integration** with caching via Netlify Blobs
- **Fallback definitions** for common words
- **Clean popup interface** with part-of-speech info
- **Cache management** with 7-day TTL

### 🔊 TTS Generation & Cache
- **OpenAI TTS integration** with multiple voice options
- **Audio caching** in Netlify Blobs for performance
- **Fallback to browser Speech Synthesis** when API unavailable
- **Play/stop controls** with visual indicators

### 💾 Document Storage
- **Multi-provider data layer** (Memory, LocalStorage, Netlify DB)
- **Sentence-level storage** with hash-based deduplication
- **Document metadata** with language and sentence counts
- **Automatic fallback** when cloud storage unavailable

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# The app will be available at http://localhost:5173
```

### Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
# Required for TTS functionality
OPENAI_API_KEY=your_openai_api_key_here

# Optional for enhanced dictionary
PONS_API_KEY=your_pons_api_key_here

# Data provider (memory, local, netlify-db)
VITE_DATA_PROVIDER=memory
```

### Using the App

### 📦 Sync Your Amazon Library (Beta)

AudRead now supports importing your Kindle/ebook library directly from Amazon using a secure backend service. This feature uses browser automation to log in and fetch your book list. Your credentials are never stored.

#### How to Sync:
1. **Open Settings** in the app sidebar.
2. Scroll to **Amazon Library Sync** and click **Connect Amazon**.
3. Enter your Amazon email and password in the secure form.
4. Click **Sync Library**. The app will securely connect to Amazon and retrieve your book list.
5. Your books will appear in the Library tab, ready for import and reading.

#### Security Tips:
- Credentials are sent only to the backend service and never stored.
- Always use strong, unique passwords for your Amazon account.
- You can revoke access at any time by logging out or disconnecting in Settings.

#### Troubleshooting:
- If login fails, check your credentials and try again.


- Two-factor authentication is not supported in this beta.

- If you have a large library, syncing may take a few minutes.



- **Responsive UI**: Works seamlessly on desktop, tablet, and mobile.
- **Frontend**: React + TypeScript + Vite PWA
- **Backend**: Netlify Functions for API proxying
- **Storage**: 
  - Local-first with IndexedDB fallback
  - Netlify Blobs for audio/dictionary caching

- **APIs**: OpenAI (TTS), PONS (dictionary)

src/

│   ├── Settings.tsx     # Configuration panel

│   ├── tts.ts          # TTS management

│   ├── dictionary.ts   # PONS API proxy + caching


## 🔄 Data Flow

1. **Import**: Files → Parser → Sentences → Local Storage
2. **Reading**: Sentences → TTS API → Cached Audio → Playback
3. **Lookup**: Selected Text → Dictionary API → Cached Results → Popup
4. **Sync**: Local Data ↔ Netlify DB (when authenticated)

## 🎯 Next Steps

- **PDF parsing** with proper text extraction
- **Keyboard navigation** (arrow keys, space bar)
- **Resume reading position** persistence
- **Advanced language detection** and morphology
- **Offline PWA capabilities** with service worker
- **Speech-to-text** for shadowing practice
- **Export/import** user data

## 🚀 Deployment

Deploy to Netlify:

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables in Netlify dashboard
5. Enable Netlify Functions and Blobs

## 📝 API Keys Setup

### OpenAI (Required for TTS)
1. Get API key from [OpenAI Platform](https://platform.openai.com/)
2. Add to environment: `OPENAI_API_KEY=sk-...`

### PONS (Optional for enhanced dictionary)
1. Register at [PONS Developer](https://en.pons.com/p/online-dictionary/developers/api)
2. Add to environment: `PONS_API_KEY=...`

---

Built with ❤️ for language learners who value privacy and control over their reading material.