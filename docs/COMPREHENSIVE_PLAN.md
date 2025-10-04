PWA Language Reader — Comprehensive Plan

Overview
Build a privacy-first PWA for language learners to import their own reading material (EPUB/PDF/TXT/Calibre CSV), read with sentence-level TTS, and tap-to-define words with morphology-aware lookups. All user content remains local-first; cloud is only used for optional caches and metadata.

Architecture
- Frontend: React + Vite PWA, offline-first via Workbox, minimal UI (Library, Importer, Reader).
- Serverless: Netlify Functions (dictionary proxy, TTS, STT) + Edge Functions (CORS, rate limit) + Scheduled Functions (cache refresh).
- Storage: Local-first in IndexedDB (future), provider-backed caches in Netlify Blobs; metadata in Netlify DB (serverless Postgres beta) or alternative Postgres (Neon/Supabase/Turso).

Data model (initial)
- documents(id, title, language, created_at)
- sentences(id, doc_id, index, text, hash)
- lookups(id, term, lang, payload_json, created_at)
- audio_cache(id, doc_id, sentence_id, voice, url_or_blobkey, created_at)

Providers and constraints
- Amazon Kindle: no API for purchased books; rely on user import. Login with Amazon is OK for profile only.
- Dictionary: PONS API primary; fallback to Wiktextract JSON shards (Kaikki) for offline-like usage.
- Translation (optional): LibreTranslate for non-AI MT; otherwise rely on AI summaries (later phase).
- Speech: OpenAI TTS for per-sentence audio; cache aggressively; STT for shadowing (optional).

Core flows
1) Import: Parse files, detect language, segment to sentences, store locally; push metadata to DB.
2) Read: Render sentence blocks, click-to-define (with PONS), click-to-play (TTS with cached audio).
3) Shadow: Record snippets and transcribe (optional); show diff vs sentence.

Caching strategy
- Dictionary: cache by (term, lang) in Blobs with TTL; hydrate from Wiktextract shard if PONS unavailable.
- TTS: cache by (docId, sentenceHash, voice) in Blobs; immutable URLs with long Cache-Control.
- Client: PWA precache shell, runtime cache for API and audio assets.

Security & privacy
- Store user content on device; send only minimal text required for lookups or TTS (sentence-level, not full docs).
- Do not log content; use environment vars for provider keys in serverless functions.

Milestones
M1 Importer MVP: TXT/EPUB parse -> sentences; basic library/reader.
M2 Dictionary proxy + cache; selection UI.
M3 TTS pipeline + caching; play controls.
M4 Netlify DB integration and sync; resume positions.
M5 Offline polish and shadowing (STT); performance and a11y.

Build checklist
- PWA manifest + icons; offline shell passes Lighthouse.
- Netlify functions deployed; scheduled refresh set (6h).
- .env configured; keys rotated; no secrets in client.
- Smoke tests: import sample, lookup, generate TTS, reload and cache hits.

Links
- Login with Amazon: https://developer.amazon.com/docs/login-with-amazon/obtain-customer-profile.html
- Kindle USB removal: https://www.theverge.com/news/612898/amazon-removing-kindle-book-download-transfer-usb
- Netlify DB: https://docs.netlify.com/build/data-and-storage/netlify-db/
- Netlify Functions/Edge/Scheduled: https://docs.netlify.com/build/functions/overview/
- PONS API: https://en.pons.com/p/online-dictionary/developers/api
- Wiktextract dumps: https://kaikki.org/dictionary/rawdata.html
- LibreTranslate: https://libretranslate.com/
- OpenAI Audio APIs: https://platform.openai.com/docs/api-reference/audio
