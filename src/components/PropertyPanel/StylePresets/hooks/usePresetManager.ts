import { useState, useCallback } from 'react';
import { useStylePresets } from './useStylePresets';
import type {
  StylePreset,
  PresetCollection,
  PresetExportFormat,
} from '../../../../types/stylePresets';

interface UsePresetManagerReturn {
  // Data from useStylePresets
  presets: StylePreset[];
  collections: PresetCollection[];
  favorites: string[];
  recentlyUsed: string[];

  // State
  isLoading: boolean;
  error: string | null;

  // Preset management
  createPreset: (preset: Omit<StylePreset, 'id' | 'created' | 'modified'>) => Promise<StylePreset>;
  updatePreset: (presetId: string, updates: Partial<StylePreset>) => Promise<StylePreset>;
  deletePreset: (presetId: string) => Promise<void>;
  duplicatePreset: (presetId: string, newName?: string) => Promise<StylePreset>;
  toggleFavorite: (presetId: string) => void;

  // Collection management
  createCollection: (collection: Omit<PresetCollection, 'id' | 'created'>) => Promise<PresetCollection>;
  updateCollection: (collectionId: string, updates: Partial<PresetCollection>) => Promise<PresetCollection>;
  deleteCollection: (collectionId: string) => Promise<void>;

  // Import/Export
  exportPresets: (presets: StylePreset[]) => Promise<PresetExportFormat>;
  importPresets: (data: any) => Promise<StylePreset[]>;
  exportCollection: (collection: PresetCollection) => Promise<PresetExportFormat>;
  importCollection: (data: any) => Promise<PresetCollection>;

  // Bulk operations
  bulkUpdatePresets: (presetIds: string[], updates: Partial<StylePreset>) => Promise<void>;
  bulkDeletePresets: (presetIds: string[]) => Promise<void>;
  bulkExportPresets: (presetIds: string[]) => Promise<PresetExportFormat>;
}

export const usePresetManager = (): UsePresetManagerReturn => {
  const {
    presets,
    collections,
    favorites,
    recentlyUsed,
    isLoading,
    error,
    createPreset: baseCreatePreset,
    updatePreset: baseUpdatePreset,
    deletePreset: baseDeletePreset,
    duplicatePreset: baseDuplicatePreset,
    toggleFavorite: baseToggleFavorite,
    createCollection: baseCreateCollection,
    updateCollection: baseUpdateCollection,
    deleteCollection: baseDeleteCollection,
    exportPresets: baseExportPresets,
    importPresets: baseImportPresets,
  } = useStylePresets();

  // Enhanced preset creation with validation
  const createPreset = useCallback(async (
    presetData: Omit<StylePreset, 'id' | 'created' | 'modified'>
  ): Promise<StylePreset> => {
    // Validate preset data
    if (!presetData.name?.trim()) {
      throw new Error('Preset name is required');
    }

    if (!presetData.style || Object.keys(presetData.style).length === 0) {
      throw new Error('Preset style is required');
    }

    // Check for duplicate names
    const existingPreset = presets.find(p =>
      p.name.toLowerCase() === presetData.name.toLowerCase() && p.isCustom
    );

    if (existingPreset) {
      throw new Error('A preset with this name already exists');
    }

    return baseCreatePreset(presetData);
  }, [presets, baseCreatePreset]);

  // Enhanced preset update with validation
  const updatePreset = useCallback(async (
    presetId: string,
    updates: Partial<StylePreset>
  ): Promise<StylePreset> => {
    const existingPreset = presets.find(p => p.id === presetId);

    if (!existingPreset) {
      throw new Error('Preset not found');
    }

    if (!existingPreset.isCustom) {
      throw new Error('Cannot modify built-in presets');
    }

    // Validate name uniqueness if name is being updated
    if (updates.name && updates.name !== existingPreset.name) {
      const duplicatePreset = presets.find(p =>
        p.name.toLowerCase() === updates.name!.toLowerCase() &&
        p.isCustom &&
        p.id !== presetId
      );

      if (duplicatePreset) {
        throw new Error('A preset with this name already exists');
      }
    }

    return baseUpdatePreset(presetId, updates);
  }, [presets, baseUpdatePreset]);

  // Enhanced preset deletion with safety checks
  const deletePreset = useCallback(async (presetId: string): Promise<void> => {
    const existingPreset = presets.find(p => p.id === presetId);

    if (!existingPreset) {
      throw new Error('Preset not found');
    }

    if (!existingPreset.isCustom) {
      throw new Error('Cannot delete built-in presets');
    }

    return baseDeletePreset(presetId);
  }, [presets, baseDeletePreset]);

  // Enhanced duplication with smart naming
  const duplicatePreset = useCallback(async (
    presetId: string,
    newName?: string
  ): Promise<StylePreset> => {
    const originalPreset = presets.find(p => p.id === presetId);

    if (!originalPreset) {
      throw new Error('Preset not found');
    }

    // Generate unique name if not provided
    if (!newName) {
      let baseName = `${originalPreset.name} (Copy)`;
      let counter = 1;

      while (presets.some(p => p.name === baseName)) {
        baseName = `${originalPreset.name} (Copy ${counter})`;
        counter++;
      }

      newName = baseName;
    }

    return baseDuplicatePreset(presetId, newName);
  }, [presets, baseDuplicatePreset]);

  // Enhanced collection export with metadata
  const exportCollection = useCallback(async (
    collection: PresetCollection
  ): Promise<PresetExportFormat> => {
    return {
      version: '1.0.0',
      type: 'collection',
      data: collection,
      metadata: {
        exportedAt: new Date().toISOString(),
        application: 'OpenChart',
        version: '1.0.0',
      },
    };
  }, []);

  // Import collection with validation
  const importCollection = useCallback(async (data: any): Promise<PresetCollection> => {
    if (!data.name || !data.presets) {
      throw new Error('Invalid collection format');
    }

    // Import presets first
    const importedPresets = await baseImportPresets(data.presets);

    // Create collection with imported presets
    const collection = await baseCreateCollection({
      name: data.name,
      description: data.description,
      presets: importedPresets,
      tags: data.tags || [],
      modified: new Date().toISOString(),
      author: data.author,
      isPublic: false,
    });

    return collection;
  }, [baseImportPresets, baseCreateCollection]);

  // Bulk update presets
  const bulkUpdatePresets = useCallback(async (
    presetIds: string[],
    updates: Partial<StylePreset>
  ): Promise<void> => {
    const updatePromises = presetIds.map(id => updatePreset(id, updates));
    await Promise.all(updatePromises);
  }, [updatePreset]);

  // Bulk delete presets
  const bulkDeletePresets = useCallback(async (presetIds: string[]): Promise<void> => {
    const deletePromises = presetIds.map(id => deletePreset(id));
    await Promise.all(deletePromises);
  }, [deletePreset]);

  // Bulk export presets
  const bulkExportPresets = useCallback(async (presetIds: string[]): Promise<PresetExportFormat> => {
    const presetsToExport = presets.filter(p => presetIds.includes(p.id));
    return baseExportPresets(presetsToExport);
  }, [presets, baseExportPresets]);

  // Enhanced export with full format support
  const exportPresets = useCallback(async (presetsToExport: StylePreset[]): Promise<PresetExportFormat> => {
    if (presetsToExport.length === 0) {
      throw new Error('No presets selected for export');
    }

    return {
      version: '1.0.0',
      type: 'preset',
      data: presetsToExport,
      metadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: 'OpenChart User', // Could be dynamic
        application: 'OpenChart',
        version: '1.0.0',
      },
    };
  }, []);

  // Enhanced import with better error handling
  const importPresets = useCallback(async (data: any): Promise<StylePreset[]> => {
    try {
      // Validate import data structure
      if (!data) {
        throw new Error('No data provided for import');
      }

      let presetsData: any[];

      if (Array.isArray(data)) {
        presetsData = data;
      } else if (data.data) {
        presetsData = Array.isArray(data.data) ? data.data : [data.data];
      } else if (data.presets) {
        presetsData = data.presets;
      } else {
        throw new Error('Invalid import format - no preset data found');
      }

      // Validate each preset
      const validatedPresets = presetsData.map((presetData, index) => {
        if (!presetData.name) {
          throw new Error(`Preset ${index + 1} is missing a name`);
        }

        if (!presetData.style) {
          throw new Error(`Preset "${presetData.name}" is missing style data`);
        }

        return presetData;
      });

      return baseImportPresets(validatedPresets);
    } catch (err) {
      console.error('Import failed:', err);
      throw new Error(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [baseImportPresets]);

  return {
    // Data
    presets,
    collections,
    favorites,
    recentlyUsed,

    // State
    isLoading,
    error,

    // Preset management
    createPreset,
    updatePreset,
    deletePreset,
    duplicatePreset,
    toggleFavorite: baseToggleFavorite,

    // Collection management
    createCollection: baseCreateCollection,
    updateCollection: baseUpdateCollection,
    deleteCollection: baseDeleteCollection,

    // Import/Export
    exportPresets,
    importPresets,
    exportCollection,
    importCollection,

    // Bulk operations
    bulkUpdatePresets,
    bulkDeletePresets,
    bulkExportPresets,
  };
};