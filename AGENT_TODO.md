# Agent Handoff — PWA Language Reader

## CRITICAL WORKFLOW RULES
⚠️ **ALWAYS commit and push changes immediately after making edits:**
1. After any file changes, run: `git add -A && git commit -m "descriptive message"`
2. Immediately after committing, run: `git push`
3. NEVER wait to be asked - this should be automatic
4. Exception: `.env` files are in `.gitignore` and won't/shouldn't be committed

You have a Vite + React PWA scaffold with Netlify functions and a minimal data layer. Implement the following tasks aligned to the plan shared in the canvas.

1) File import pipeline
- Parse EPUB, PDF, TXT into sentence-level segments; extract metadata (title, language if detectable).
- Normalize to a shared schema and store local-first; persist metadata to DB provider.
- Acceptance: importing a sample EPUB creates a doc with >= 100 sentences accessible in the Reader view.

2) Dictionary lookup
- Implement PONS proxy with API key; cache results by (term, lang) using Netlify Blobs. Add fallback to Wiktextract shards.
- Acceptance: looking up a term returns definitions with part-of-speech; identical lookups hit cache.

3) TTS generation and cache
- Call OpenAI TTS; cache audio per (docId, sentenceId, voice) in Blobs; serve with long-lived Cache-Control.
- Acceptance: pressing Play on a sentence streams audio within < 300ms on cache hit.

4) STT (optional, for shadowing)
- Accept recorded audio; transcribe with OpenAI; align to sentence tokens if available.
- Acceptance: a short recording returns text within function timeouts.

5) Data layer provider
- Replace MemoryStore with Netlify DB. Create tables: documents, sentences, lookups, audio_cache.
- Add a .sql or migration notes; keep an env switch for alternative providers (Supabase/Neon).

6) Edge/scheduled plumbing
- Add scheduled function for refreshing hot dictionary terms and pruning blob cache.
- Harden CORS and rate limiting on /api/*.

7) UX polish
- Reader: sentence highlighting, click-to-hear, keyboard controls, offline support via PWA.
- Library: list, delete, and resume position.

References
- Login with Amazon (profile only): https://developer.amazon.com/docs/login-with-amazon/obtain-customer-profile.html
- Verge on Kindle USB downloads removed: https://www.theverge.com/news/612898/amazon-removing-kindle-book-download-transfer-usb
- Netlify DB: https://docs.netlify.com/build/data-and-storage/netlify-db/
- Netlify Functions/Edge/Scheduled: https://docs.netlify.com/build/functions/overview/
- PONS API: https://en.pons.com/p/online-dictionary/developers/api
- Wiktextract dumps: https://kaikki.org/dictionary/rawdata.html
- LibreTranslate: https://libretranslate.com/
- OpenAI Transcribe/TTS: https://platform.openai.com/docs/
