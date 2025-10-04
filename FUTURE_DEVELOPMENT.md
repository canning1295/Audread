# AudRead - Future Development TODOs

## ✅ Completed: Local-First Architecture
- All data now stored locally in IndexedDB (documents, sentences, settings, audio cache)
- Removed authentication requirements (Auth0, Netlify Identity)
- Simplified app to work completely offline
- No user login required

## 🔄 Future Feature: Cross-Device Sync

### Overview
Currently, AudRead stores all data locally in the browser's IndexedDB. This means:
- ✅ Works completely offline
- ✅ No login required
- ✅ Fast and private
- ❌ Data doesn't sync across devices
- ❌ Data can be lost if browser data is cleared

### Proposed Solution: Optional Cloud Sync

Implement an optional cloud sync feature that users can enable:

#### Option 1: Direct Sync to Cloud Storage
- Add authentication back (could be simpler than Auth0 - email/password, social login)
- Sync IndexedDB to cloud storage (Netlify Blobs, S3, or similar)
- Implement conflict resolution for when data changes on multiple devices
- Keep the app working offline-first

#### Option 2: Import/Export Feature (Simpler)
- Add "Export Library" button to download all data as a JSON file
- Add "Import Library" button to restore from backup
- Users can manually sync by importing/exporting between devices
- No auth needed, works offline

#### Option 3: P2P Sync
- Use WebRTC or similar to sync directly between devices
- No cloud storage needed
- More complex to implement

### Implementation Checklist (When Adding Sync)

#### Backend
- [ ] Choose sync architecture (cloud, import/export, or P2P)
- [ ] Set up authentication if needed (simpler option than Auth0)
- [ ] Create sync API endpoints
- [ ] Implement conflict resolution logic
- [ ] Add data migration tools

#### Frontend
- [ ] Add "Enable Sync" option in Settings
- [ ] Implement sync status indicator
- [ ] Add conflict resolution UI
- [ ] Create export/import UI (if going with Option 2)
- [ ] Add "Last Synced" timestamp display
- [ ] Implement automatic sync on app startup (if online)
- [ ] Add manual sync button

#### Data Model Updates
- [ ] Add `lastModified` timestamp to all records
- [ ] Add `deviceId` to track which device made changes
- [ ] Add `syncStatus` field (synced, pending, conflict)
- [ ] Implement data versioning

### Considerations
1. **Privacy**: Ensure encrypted transit and storage if using cloud sync
2. **Storage Costs**: Consider storage limits and costs for audio caching
3. **Conflict Resolution**: What happens if same book edited on two devices?
4. **Bandwidth**: Audio files can be large - consider sync strategies
5. **Offline Changes**: Queue changes made offline and sync when online

### Recommended Approach
Start with **Option 2 (Import/Export)** because:
- ✅ Simplest to implement
- ✅ No authentication complexity
- ✅ No ongoing cloud costs
- ✅ Users stay in control of their data
- ✅ Works completely offline
- ✅ Easy to backup and restore

Later, if needed, upgrade to Option 1 for automatic sync.

---

## Other Future Enhancements

### Reading Features
- [ ] Highlight current sentence being read
- [ ] Add bookmarks and notes
- [ ] Reading statistics (time spent, pages read, etc.)
- [ ] Multiple reading modes (day/night/sepia themes)
- [ ] Font size and family customization
- [ ] Reading progress indicator

### Audio Features
- [ ] Playback speed control
- [ ] Multiple TTS voice options
- [ ] Download audio for offline playback
- [ ] Audio bookmark/resume functionality
- [ ] Background audio playback

### Library Features
- [ ] Collections/folders for organizing books
- [ ] Search within library
- [ ] Sort by various criteria (date, title, language)
- [ ] Recently read section
- [ ] Reading goals and progress tracking

### Dictionary Features
- [ ] Save favorite words
- [ ] Vocabulary practice/flashcards
- [ ] Multiple dictionary sources
- [ ] Offline dictionary support
- [ ] Word history

### Performance
- [ ] Lazy load large documents
- [ ] Virtual scrolling for long books
- [ ] Optimize IndexedDB queries
- [ ] Implement service worker for offline functionality
- [ ] Progressive Web App (PWA) enhancements

### Developer Experience
- [ ] Add comprehensive tests
- [ ] Set up CI/CD pipeline
- [ ] Add error tracking (Sentry or similar)
- [ ] Improve development documentation
- [ ] Add contribution guidelines

---

**Last Updated**: October 4, 2025
**Version**: 0.2.0 (Local-First Architecture)
