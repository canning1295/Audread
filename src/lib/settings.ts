// Settings management using IndexedDB for local storage
import {
  loadSettings as loadSettingsFromDB,
  saveSettings as saveSettingsToDB,
  type AppSettings,
} from './indexeddb';

export type { AppSettings };

export async function loadSettings(): Promise<AppSettings> {
  console.log('[Settings] Loading settings from IndexedDB');
  try {
    const settings = await loadSettingsFromDB();
    console.log('[Settings] Settings loaded successfully');
    return settings;
  } catch (error) {
    console.error('[Settings] Failed to load settings:', error);
    return {};
  }
}

export async function saveSettings(partial: AppSettings): Promise<void> {
  console.log('[Settings] Saving settings to IndexedDB');
  try {
    // Load existing settings and merge
    const existing = await loadSettingsFromDB();
    const merged: AppSettings = {
      amazon: { ...(existing.amazon || {}), ...(partial.amazon || {}) },
      providers: { ...(existing.providers || {}), ...(partial.providers || {}) },
      preferences: { ...(existing.preferences || {}), ...(partial.preferences || {}) },
    };
    
    await saveSettingsToDB(merged);
    console.log('[Settings] Settings saved successfully');
  } catch (error) {
    console.error('[Settings] Failed to save settings:', error);
    throw error;
  }
}
