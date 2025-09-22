// Local Storage management for Style Presets

import type {
  StylePreset,
  PresetCollection,
  StyleTheme,
} from '../../../../types/stylePresets';

const STORAGE_KEYS = {
  PRESETS: 'openchart_style_presets',
  COLLECTIONS: 'openchart_preset_collections',
  THEMES: 'openchart_style_themes',
  FAVORITES: 'openchart_preset_favorites',
  RECENTLY_USED: 'openchart_preset_recently_used',
  CURRENT_THEME: 'openchart_current_theme',
  SETTINGS: 'openchart_preset_settings',
} as const;

interface PresetSettings {
  autoBackup: boolean;
  maxRecentlyUsed: number;
  defaultApplicationMode: 'replace' | 'merge' | 'overlay' | 'smart';
  enableSuggestions: boolean;
}

const DEFAULT_SETTINGS: PresetSettings = {
  autoBackup: true,
  maxRecentlyUsed: 10,
  defaultApplicationMode: 'smart',
  enableSuggestions: true,
};

class PresetStorage {
  // Utility methods for safe localStorage access
  private getFromStorage<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Failed to parse ${key} from localStorage:`, error);
      return defaultValue;
    }
  }

  private setToStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
      // Could implement fallback storage or cleanup
    }
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private validatePreset(preset: Partial<StylePreset>): string[] {
    const errors: string[] = [];

    if (!preset.name?.trim()) {
      errors.push('Name is required');
    }

    if (!preset.style || Object.keys(preset.style).length === 0) {
      errors.push('Style is required');
    }

    if (!preset.category) {
      errors.push('Category is required');
    }

    return errors;
  }

  // Preset management
  async getPresets(): Promise<StylePreset[]> {
    return this.getFromStorage(STORAGE_KEYS.PRESETS, []);
  }

  async createPreset(presetData: Omit<StylePreset, 'id' | 'created' | 'modified'>): Promise<StylePreset> {
    const errors = this.validatePreset(presetData);
    if (errors.length > 0) {
      throw new Error(`Invalid preset data: ${errors.join(', ')}`);
    }

    const now = new Date().toISOString();
    const preset: StylePreset = {
      ...presetData,
      id: this.generateId(),
      created: now,
      modified: now,
    };

    const presets = await this.getPresets();
    const updatedPresets = [...presets, preset];

    this.setToStorage(STORAGE_KEYS.PRESETS, updatedPresets);

    // Auto-backup if enabled
    const settings = await this.getSettings();
    if (settings.autoBackup) {
      this.createBackup();
    }

    return preset;
  }

  async updatePreset(presetId: string, updates: Partial<StylePreset>): Promise<StylePreset> {
    const presets = await this.getPresets();
    const presetIndex = presets.findIndex(p => p.id === presetId);

    if (presetIndex === -1) {
      throw new Error('Preset not found');
    }

    const updatedPreset: StylePreset = {
      ...presets[presetIndex],
      ...updates,
      modified: new Date().toISOString(),
    };

    const errors = this.validatePreset(updatedPreset);
    if (errors.length > 0) {
      throw new Error(`Invalid preset data: ${errors.join(', ')}`);
    }

    presets[presetIndex] = updatedPreset;
    this.setToStorage(STORAGE_KEYS.PRESETS, presets);

    return updatedPreset;
  }

  async deletePreset(presetId: string): Promise<void> {
    const presets = await this.getPresets();
    const updatedPresets = presets.filter(p => p.id !== presetId);

    this.setToStorage(STORAGE_KEYS.PRESETS, updatedPresets);

    // Also remove from favorites and recently used
    const favorites = await this.getFavorites();
    const recentlyUsed = await this.getRecentlyUsed();

    await this.setFavorites(favorites.filter(id => id !== presetId));
    await this.setRecentlyUsed(recentlyUsed.filter(id => id !== presetId));
  }

  async getPresetById(presetId: string): Promise<StylePreset | null> {
    const presets = await this.getPresets();
    return presets.find(p => p.id === presetId) || null;
  }

  // Collection management
  async getCollections(): Promise<PresetCollection[]> {
    return this.getFromStorage(STORAGE_KEYS.COLLECTIONS, []);
  }

  async createCollection(collectionData: Omit<PresetCollection, 'id' | 'created'>): Promise<PresetCollection> {
    if (!collectionData.name?.trim()) {
      throw new Error('Collection name is required');
    }

    const now = new Date().toISOString();
    const collection: PresetCollection = {
      ...collectionData,
      id: this.generateId(),
      created: now,
    };

    const collections = await this.getCollections();
    const updatedCollections = [...collections, collection];

    this.setToStorage(STORAGE_KEYS.COLLECTIONS, updatedCollections);

    return collection;
  }

  async updateCollection(collectionId: string, updates: Partial<PresetCollection>): Promise<PresetCollection> {
    const collections = await this.getCollections();
    const collectionIndex = collections.findIndex(c => c.id === collectionId);

    if (collectionIndex === -1) {
      throw new Error('Collection not found');
    }

    const updatedCollection: PresetCollection = {
      ...collections[collectionIndex],
      ...updates,
      modified: new Date().toISOString(),
    };

    collections[collectionIndex] = updatedCollection;
    this.setToStorage(STORAGE_KEYS.COLLECTIONS, collections);

    return updatedCollection;
  }

  async deleteCollection(collectionId: string): Promise<void> {
    const collections = await this.getCollections();
    const updatedCollections = collections.filter(c => c.id !== collectionId);

    this.setToStorage(STORAGE_KEYS.COLLECTIONS, updatedCollections);
  }

  // Theme management
  async getThemes(): Promise<StyleTheme[]> {
    return this.getFromStorage(STORAGE_KEYS.THEMES, []);
  }

  async createTheme(themeData: Omit<StyleTheme, 'id' | 'created'>): Promise<StyleTheme> {
    if (!themeData.name?.trim()) {
      throw new Error('Theme name is required');
    }

    const theme: StyleTheme = {
      ...themeData,
      id: this.generateId(),
      created: new Date().toISOString(),
    };

    const themes = await this.getThemes();
    const updatedThemes = [...themes, theme];

    this.setToStorage(STORAGE_KEYS.THEMES, updatedThemes);

    return theme;
  }

  // Favorites management
  async getFavorites(): Promise<string[]> {
    return this.getFromStorage(STORAGE_KEYS.FAVORITES, []);
  }

  async setFavorites(favorites: string[]): Promise<void> {
    this.setToStorage(STORAGE_KEYS.FAVORITES, favorites);
  }

  async addToFavorites(presetId: string): Promise<void> {
    const favorites = await this.getFavorites();
    if (!favorites.includes(presetId)) {
      await this.setFavorites([...favorites, presetId]);
    }
  }

  async removeFromFavorites(presetId: string): Promise<void> {
    const favorites = await this.getFavorites();
    await this.setFavorites(favorites.filter(id => id !== presetId));
  }

  // Recently used management
  async getRecentlyUsed(): Promise<string[]> {
    return this.getFromStorage(STORAGE_KEYS.RECENTLY_USED, []);
  }

  async setRecentlyUsed(recentlyUsed: string[]): Promise<void> {
    const settings = await this.getSettings();
    const limited = recentlyUsed.slice(0, settings.maxRecentlyUsed);
    this.setToStorage(STORAGE_KEYS.RECENTLY_USED, limited);
  }

  async addToRecentlyUsed(presetId: string): Promise<void> {
    const recentlyUsed = await this.getRecentlyUsed();
    const updated = [presetId, ...recentlyUsed.filter(id => id !== presetId)];
    await this.setRecentlyUsed(updated);
  }

  // Current theme management
  async getCurrentTheme(): Promise<string | undefined> {
    return this.getFromStorage(STORAGE_KEYS.CURRENT_THEME, undefined);
  }

  async setCurrentTheme(themeId: string): Promise<void> {
    this.setToStorage(STORAGE_KEYS.CURRENT_THEME, themeId);
  }

  // Settings management
  async getSettings(): Promise<PresetSettings> {
    return this.getFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  async updateSettings(updates: Partial<PresetSettings>): Promise<PresetSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...updates };
    this.setToStorage(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  }

  // Backup and restore
  async createBackup(): Promise<string> {
    const data = {
      presets: await this.getPresets(),
      collections: await this.getCollections(),
      themes: await this.getThemes(),
      favorites: await this.getFavorites(),
      recentlyUsed: await this.getRecentlyUsed(),
      currentTheme: await this.getCurrentTheme(),
      settings: await this.getSettings(),
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };

    const backupString = JSON.stringify(data, null, 2);

    // Store backup in localStorage with timestamp
    const backupKey = `openchart_backup_${Date.now()}`;
    this.setToStorage(backupKey, data);

    return backupString;
  }

  async restoreFromBackup(backupData: any): Promise<void> {
    try {
      // Validate backup data structure
      if (!backupData.version || !backupData.presets) {
        throw new Error('Invalid backup format');
      }

      // Restore data
      if (backupData.presets) {
        this.setToStorage(STORAGE_KEYS.PRESETS, backupData.presets);
      }

      if (backupData.collections) {
        this.setToStorage(STORAGE_KEYS.COLLECTIONS, backupData.collections);
      }

      if (backupData.themes) {
        this.setToStorage(STORAGE_KEYS.THEMES, backupData.themes);
      }

      if (backupData.favorites) {
        this.setToStorage(STORAGE_KEYS.FAVORITES, backupData.favorites);
      }

      if (backupData.recentlyUsed) {
        this.setToStorage(STORAGE_KEYS.RECENTLY_USED, backupData.recentlyUsed);
      }

      if (backupData.currentTheme) {
        this.setToStorage(STORAGE_KEYS.CURRENT_THEME, backupData.currentTheme);
      }

      if (backupData.settings) {
        this.setToStorage(STORAGE_KEYS.SETTINGS, backupData.settings);
      }

    } catch (error) {
      console.error('Failed to restore backup:', error);
      throw new Error('Backup restoration failed');
    }
  }

  // Data cleanup and maintenance
  async cleanup(): Promise<void> {
    // Remove orphaned references
    const presets = await this.getPresets();
    const presetIds = new Set(presets.map(p => p.id));

    // Clean favorites
    const favorites = await this.getFavorites();
    const validFavorites = favorites.filter(id => presetIds.has(id));
    if (validFavorites.length !== favorites.length) {
      await this.setFavorites(validFavorites);
    }

    // Clean recently used
    const recentlyUsed = await this.getRecentlyUsed();
    const validRecentlyUsed = recentlyUsed.filter(id => presetIds.has(id));
    if (validRecentlyUsed.length !== recentlyUsed.length) {
      await this.setRecentlyUsed(validRecentlyUsed);
    }

    // Clean old backups (keep only last 5)
    this.cleanupOldBackups();
  }

  private cleanupOldBackups(): void {
    try {
      const backupKeys: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('openchart_backup_')) {
          backupKeys.push(key);
        }
      }

      // Sort by timestamp (newest first)
      backupKeys.sort((a, b) => {
        const timeA = parseInt(a.split('_').pop() || '0');
        const timeB = parseInt(b.split('_').pop() || '0');
        return timeB - timeA;
      });

      // Remove old backups (keep only 5 most recent)
      const toRemove = backupKeys.slice(5);
      toRemove.forEach(key => localStorage.removeItem(key));

    } catch (error) {
      console.warn('Failed to cleanup old backups:', error);
    }
  }

  // Export/Import utilities
  async exportAll(): Promise<any> {
    return {
      presets: await this.getPresets(),
      collections: await this.getCollections(),
      themes: await this.getThemes(),
      favorites: await this.getFavorites(),
      recentlyUsed: await this.getRecentlyUsed(),
      currentTheme: await this.getCurrentTheme(),
      settings: await this.getSettings(),
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
    };
  }

  async importAll(data: any): Promise<void> {
    // This is essentially the same as restore, but without validation
    await this.restoreFromBackup(data);
  }

  // Storage stats
  async getStorageStats(): Promise<{
    presetsCount: number;
    collectionsCount: number;
    themesCount: number;
    favoritesCount: number;
    totalSize: number;
    lastBackup?: string;
  }> {
    const presets = await this.getPresets();
    const collections = await this.getCollections();
    const themes = await this.getThemes();
    const favorites = await this.getFavorites();

    // Calculate approximate storage size
    let totalSize = 0;
    Object.values(STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += item.length;
      }
    });

    return {
      presetsCount: presets.length,
      collectionsCount: collections.length,
      themesCount: themes.length,
      favoritesCount: favorites.length,
      totalSize,
    };
  }
}

// Export singleton instance
export const presetStorage = new PresetStorage();