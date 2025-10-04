AudRead — PWA Language Reader (Scaffold)

What’s here
- Vite + React + TypeScript PWA scaffold (vite-plugin-pwa)
- Netlify Functions and Edge function stubs (dictionary, TTS, STT, cache refresh, CORS)
- Minimal data layer abstraction with a memory store (swap to Netlify DB or Supabase)
- API client helpers and placeholder UI (Import, Library, Reader)

Quickstart
1) Copy .env.example to .env and set provider keys as needed.
2) Install dependencies and run dev server.
3) Optionally install Netlify CLI and run netlify dev to emulate functions.

Docs
- Comprehensive plan: docs/COMPREHENSIVE_PLAN.md
- DB schema: docs/DB_SCHEMA.md
- API stubs: docs/API_STUBS.md

Providers
- Data provider (default Netlify DB): set VITE_DATA_PROVIDER=netlify-db (client) and/or DATA_PROVIDER=netlify-db (server). For local dev without DB, use memory.

Data & storage
- Default: keep content local-first; cache dictionary/tts assets via Netlify Blobs.
- DB: prefer Netlify DB (beta) or a Postgres-compatible hosted option. Implement in src/lib/db.ts.

Persistence
- The `docs` list is saved via a Netlify Function (`/.netlify/functions/docs`) backed by Netlify Blobs.
- In local dev or when the function is unreachable, a LocalStorage fallback is used (keyed by an anonymous browser UID stored under `audread:uid`).
- To tie data to real user accounts, integrate Netlify Identity and send the verified user ID instead of the anonymous UID.

Serverless
- Functions: netlify/functions/*.ts — proxy to PONS, OpenAI TTS/STT, scheduled cache refresh.
- Edge: netlify/edge-functions/cors.ts — adds permissive CORS for /api/*.

Local development with Netlify Dev
- **IMPORTANT**: Enable Netlify Identity in your site dashboard first! See NETLIFY_IDENTITY_SETUP.md for detailed instructions.
- Start local dev with functions and Identity proxy:
	- Netlify Dev proxy is configured in netlify.toml to reuse Vite (targetPort=5173).
	- Start:
		- npm run dev (Vite only) or
		- npx --yes netlify-cli@17.36.1 dev (Netlify Dev + Vite + Functions)
	- Open http://localhost:8888 for Netlify Dev (or http://localhost:5173 for just Vite).
	- Use the Login button in the app header. Once logged in, Library and Settings are synced to Netlify.

Persistence model
- Not logged in: persists to LocalStorage per device.
- Logged in: persists per user in Netlify Blobs via /api/docs and /api/settings.
	- Authorization: Bearer <Netlify Identity JWT> is required by functions.
	- For stronger controls or relational queries, migrate to Netlify Database.

Notes on Amazon/Kindle
There’s no public API for a user’s purchased library; rely on user-side imports (EPUB/PDF/TXT, Calibre CSV). See links in AGENT_TODO.md.

License
MIT
# AudRead
