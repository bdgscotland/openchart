import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  StylePreset,
  StyleTheme,
  PresetCollection,
  PresetSearchFilters,
  PresetApplicationMode,
} from '../../../../types/stylePresets';
import { presetStorage } from '../utils/presetStorage';
import { getBuiltinPresets, getBuiltinThemes } from '../utils/presetBuiltins';
import { applyPresetToElements, searchPresets as searchPresetsUtil } from '../utils/presetUtils';

interface UseStylePresetsReturn {
  // Data
  presets: StylePreset[];
  themes: StyleTheme[];
  collections: PresetCollection[];
  favorites: string[];
  recentlyUsed: string[];
  currentTheme?: string;

  // State
  isLoading: boolean;
  error: string | null;

  // Actions
  createPreset: (preset: Omit<StylePreset, 'id' | 'created' | 'modified'>) => Promise<StylePreset>;
  updatePreset: (presetId: string, updates: Partial<StylePreset>) => Promise<StylePreset>;
  deletePreset: (presetId: string) => Promise<void>;
  duplicatePreset: (presetId: string, newName?: string) => Promise<StylePreset>;

  applyPreset: (preset: StylePreset, elementIds: string[], mode: PresetApplicationMode) => void;
  toggleFavorite: (presetId: string) => void;
  setCurrentTheme: (themeId: string) => void;

  searchPresets: (filters: PresetSearchFilters) => StylePreset[];

  // Import/Export
  exportPresets: (presets: StylePreset[]) => Promise<any>;
  importPresets: (data: any) => Promise<StylePreset[]>;

  // Collections
  createCollection: (collection: Omit<PresetCollection, 'id' | 'created'>) => Promise<PresetCollection>;
  updateCollection: (collectionId: string, updates: Partial<PresetCollection>) => Promise<PresetCollection>;
  deleteCollection: (collectionId: string) => Promise<void>;
}

export const useStylePresets = (): UseStylePresetsReturn => {
  // State
  const [presets, setPresets] = useState<StylePreset[]>([]);
  const [themes, setThemes] = useState<StyleTheme[]>([]);
  const [collections, setCollections] = useState<PresetCollection[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);
  const [currentTheme, setCurrentThemeState] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Load all preset data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load built-in presets and themes
      const builtinPresets = getBuiltinPresets();
      const builtinThemes = getBuiltinThemes();

      // Load user data from storage
      const [
        customPresets,
        userCollections,
        userFavorites,
        userRecentlyUsed,
        userCurrentTheme,
      ] = await Promise.all([
        presetStorage.getPresets(),
        presetStorage.getCollections(),
        presetStorage.getFavorites(),
        presetStorage.getRecentlyUsed(),
        presetStorage.getCurrentTheme(),
      ]);

      // Combine built-in and custom presets
      setPresets([...builtinPresets, ...customPresets]);
      setThemes(builtinThemes);
      setCollections(userCollections);
      setFavorites(userFavorites);
      setRecentlyUsed(userRecentlyUsed);
      setCurrentThemeState(userCurrentTheme);
    } catch (err) {
      console.error('Failed to load preset data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load presets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create new preset
  const createPreset = useCallback(async (
    presetData: Omit<StylePreset, 'id' | 'created' | 'modified'>
  ): Promise<StylePreset> => {
    try {
      const preset = await presetStorage.createPreset(presetData);
      setPresets(prev => [...prev, preset]);
      return preset;
    } catch (err) {
      console.error('Failed to create preset:', err);
      throw err;
    }
  }, []);

  // Update existing preset
  const updatePreset = useCallback(async (
    presetId: string,
    updates: Partial<StylePreset>
  ): Promise<StylePreset> => {
    try {
      const updatedPreset = await presetStorage.updatePreset(presetId, updates);
      setPresets(prev => prev.map(p => p.id === presetId ? updatedPreset : p));
      return updatedPreset;
    } catch (err) {
      console.error('Failed to update preset:', err);
      throw err;
    }
  }, []);

  // Delete preset
  const deletePreset = useCallback(async (presetId: string): Promise<void> => {
    try {
      await presetStorage.deletePreset(presetId);
      setPresets(prev => prev.filter(p => p.id !== presetId));
      setFavorites(prev => prev.filter(id => id !== presetId));
      setRecentlyUsed(prev => prev.filter(id => id !== presetId));
    } catch (err) {
      console.error('Failed to delete preset:', err);
      throw err;
    }
  }, []);

  // Duplicate preset
  const duplicatePreset = useCallback(async (
    presetId: string,
    newName?: string
  ): Promise<StylePreset> => {
    try {
      const originalPreset = presets.find(p => p.id === presetId);
      if (!originalPreset) {
        throw new Error('Preset not found');
      }

      const duplicatedPreset = await presetStorage.createPreset({
        ...originalPreset,
        name: newName || `${originalPreset.name} (Copy)`,
        isCustom: true,
        isShared: false,
      });

      setPresets(prev => [...prev, duplicatedPreset]);
      return duplicatedPreset;
    } catch (err) {
      console.error('Failed to duplicate preset:', err);
      throw err;
    }
  }, [presets]);

  // Apply preset to elements
  const applyPreset = useCallback((
    preset: StylePreset,
    elementIds: string[],
    mode: PresetApplicationMode
  ) => {
    try {
      // This would integrate with the diagram state management
      applyPresetToElements(preset, elementIds, mode);

      // Update usage tracking
      const updatedPreset = {
        ...preset,
        usageCount: (preset.usageCount || 0) + 1,
        modified: new Date().toISOString(),
      };

      updatePreset(preset.id, { usageCount: updatedPreset.usageCount });

      // Add to recently used
      addToRecentlyUsed(preset.id);
    } catch (err) {
      console.error('Failed to apply preset:', err);
    }
  }, [updatePreset]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (presetId: string) => {
    try {
      const newFavorites = favorites.includes(presetId)
        ? favorites.filter(id => id !== presetId)
        : [...favorites, presetId];

      await presetStorage.setFavorites(newFavorites);
      setFavorites(newFavorites);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  }, [favorites]);

  // Set current theme
  const setCurrentTheme = useCallback(async (themeId: string) => {
    try {
      await presetStorage.setCurrentTheme(themeId);
      setCurrentThemeState(themeId);
    } catch (err) {
      console.error('Failed to set current theme:', err);
    }
  }, []);

  // Add to recently used
  const addToRecentlyUsed = useCallback(async (presetId: string) => {
    try {
      const newRecentlyUsed = [
        presetId,
        ...recentlyUsed.filter(id => id !== presetId)
      ].slice(0, 10); // Keep only last 10

      await presetStorage.setRecentlyUsed(newRecentlyUsed);
      setRecentlyUsed(newRecentlyUsed);
    } catch (err) {
      console.error('Failed to update recently used:', err);
    }
  }, [recentlyUsed]);

  // Search presets
  const searchPresets = useCallback((filters: PresetSearchFilters): StylePreset[] => {
    return searchPresetsUtil(presets, filters);
  }, [presets]);

  // Export presets
  const exportPresets = useCallback(async (presetsToExport: StylePreset[]): Promise<any> => {
    return {
      version: '1.0.0',
      type: 'preset',
      data: presetsToExport,
      metadata: {
        exportedAt: new Date().toISOString(),
        application: 'OpenChart',
        version: '1.0.0',
      },
    };
  }, []);

  // Import presets
  const importPresets = useCallback(async (data: any): Promise<StylePreset[]> => {
    try {
      const importedPresets: StylePreset[] = [];

      if (Array.isArray(data)) {
        // Direct array of presets
        for (const presetData of data) {
          const preset = await createPreset({
            ...presetData,
            isCustom: true,
            isShared: false,
          });
          importedPresets.push(preset);
        }
      } else if (data.data) {
        // Wrapped in export format
        const presetsData = Array.isArray(data.data) ? data.data : [data.data];
        for (const presetData of presetsData) {
          const preset = await createPreset({
            ...presetData,
            isCustom: true,
            isShared: false,
          });
          importedPresets.push(preset);
        }
      } else {
        throw new Error('Invalid import format');
      }

      return importedPresets;
    } catch (err) {
      console.error('Failed to import presets:', err);
      throw err;
    }
  }, [createPreset]);

  // Create collection
  const createCollection = useCallback(async (
    collectionData: Omit<PresetCollection, 'id' | 'created'>
  ): Promise<PresetCollection> => {
    try {
      const collection = await presetStorage.createCollection(collectionData);
      setCollections(prev => [...prev, collection]);
      return collection;
    } catch (err) {
      console.error('Failed to create collection:', err);
      throw err;
    }
  }, []);

  // Update collection
  const updateCollection = useCallback(async (
    collectionId: string,
    updates: Partial<PresetCollection>
  ): Promise<PresetCollection> => {
    try {
      const updatedCollection = await presetStorage.updateCollection(collectionId, updates);
      setCollections(prev => prev.map(c => c.id === collectionId ? updatedCollection : c));
      return updatedCollection;
    } catch (err) {
      console.error('Failed to update collection:', err);
      throw err;
    }
  }, []);

  // Delete collection
  const deleteCollection = useCallback(async (collectionId: string): Promise<void> => {
    try {
      await presetStorage.deleteCollection(collectionId);
      setCollections(prev => prev.filter(c => c.id !== collectionId));
    } catch (err) {
      console.error('Failed to delete collection:', err);
      throw err;
    }
  }, []);

  return {
    // Data
    presets,
    themes,
    collections,
    favorites,
    recentlyUsed,
    currentTheme,

    // State
    isLoading,
    error,

    // Actions
    createPreset,
    updatePreset,
    deletePreset,
    duplicatePreset,
    applyPreset,
    toggleFavorite,
    setCurrentTheme,
    searchPresets,

    // Import/Export
    exportPresets,
    importPresets,

    // Collections
    createCollection,
    updateCollection,
    deleteCollection,
  };
};