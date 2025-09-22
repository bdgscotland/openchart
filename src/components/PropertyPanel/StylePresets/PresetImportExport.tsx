import React, { useState, useCallback, useRef } from 'react';
import {
  Upload,
  Download,
  FileText,
  Package,
  Link,
  X,
  Check,
  AlertCircle,
  Info,
  Copy,
  Share2,
  Globe,
  Lock,
} from 'lucide-react';
import type {
  StylePreset,
  PresetCollection,
  StyleTheme,
  PresetExportFormat,
} from '../../../types/stylePresets';
import './PresetImportExport.css';

export interface PresetImportExportProps {
  onClose: () => void;
  onImportComplete?: (imported: any) => void;
  onExportComplete?: (exported: any) => void;
  className?: string;
}

export const PresetImportExport: React.FC<PresetImportExportProps> = ({
  onClose,
  onImportComplete,
  onExportComplete,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'share'>('import');
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'success' | 'error'>('idle');
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle');
  const [importResult, setImportResult] = useState<any>(null);
  const [exportResult, setExportResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [importMethod, setImportMethod] = useState<'file' | 'url' | 'text'>('file');
  const [exportFormat, setExportFormat] = useState<'json' | 'css' | 'figma'>('json');
  const [shareSettings, setShareSettings] = useState({
    isPublic: false,
    allowDownload: true,
    requireAttribution: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Handle file import
  const handleFileImport = useCallback(async (file: File) => {
    setImportStatus('importing');
    setError(null);

    try {
      const content = await file.text();
      const data = JSON.parse(content);

      // Validate import data
      if (!data.version || !data.type || !data.data) {
        throw new Error('Invalid import file format');
      }

      // Process different import types
      let processed;
      switch (data.type) {
        case 'preset':
          processed = await processPresetImport(data.data);
          break;
        case 'collection':
          processed = await processCollectionImport(data.data);
          break;
        case 'theme':
          processed = await processThemeImport(data.data);
          break;
        default:
          throw new Error(`Unsupported import type: ${data.type}`);
      }

      setImportResult(processed);
      setImportStatus('success');
      onImportComplete?.(processed);
    } catch (err) {
      console.error('Import failed:', err);
      setError(err instanceof Error ? err.message : 'Import failed');
      setImportStatus('error');
    }
  }, [onImportComplete]);

  // Handle URL import
  const handleUrlImport = useCallback(async (url: string) => {
    setImportStatus('importing');
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch from URL: ${response.statusText}`);
      }

      const data = await response.json();

      // Process the imported data
      const processed = await processPresetImport(data);
      setImportResult(processed);
      setImportStatus('success');
      onImportComplete?.(processed);
    } catch (err) {
      console.error('URL import failed:', err);
      setError(err instanceof Error ? err.message : 'URL import failed');
      setImportStatus('error');
    }
  }, [onImportComplete]);

  // Handle text import
  const handleTextImport = useCallback(async (text: string) => {
    setImportStatus('importing');
    setError(null);

    try {
      const data = JSON.parse(text);
      const processed = await processPresetImport(data);
      setImportResult(processed);
      setImportStatus('success');
      onImportComplete?.(processed);
    } catch (err) {
      console.error('Text import failed:', err);
      setError(err instanceof Error ? err.message : 'Invalid JSON format');
      setImportStatus('error');
    }
  }, [onImportComplete]);

  // Process preset import
  const processPresetImport = async (data: any): Promise<any> => {
    // Validate and normalize preset data
    if (Array.isArray(data)) {
      // Multiple presets
      return data.map(preset => validateAndNormalizePreset(preset));
    } else {
      // Single preset
      return [validateAndNormalizePreset(data)];
    }
  };

  // Process collection import
  const processCollectionImport = async (data: any): Promise<any> => {
    // Validate collection structure
    if (!data.name || !data.presets) {
      throw new Error('Invalid collection format');
    }

    return {
      ...data,
      presets: data.presets.map((preset: any) => validateAndNormalizePreset(preset)),
    };
  };

  // Process theme import
  const processThemeImport = async (data: any): Promise<any> => {
    // Validate theme structure
    if (!data.name || !data.colors || !data.typography) {
      throw new Error('Invalid theme format');
    }

    return data;
  };

  // Validate and normalize preset
  const validateAndNormalizePreset = (preset: any): StylePreset => {
    const now = new Date().toISOString();

    return {
      id: preset.id || generateId(),
      name: preset.name || 'Imported Preset',
      description: preset.description,
      style: preset.style || {},
      category: preset.category || 'custom',
      tags: preset.tags || [],
      thumbnail: preset.thumbnail,
      created: preset.created || now,
      modified: now,
      author: preset.author,
      isCustom: true,
      isShared: false,
      usageCount: 0,
      rating: preset.rating,
    };
  };

  // Generate unique ID
  const generateId = () => {
    return `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Handle export
  const handleExport = useCallback(async (
    data: StylePreset[] | PresetCollection | StyleTheme,
    type: 'preset' | 'collection' | 'theme'
  ) => {
    setExportStatus('exporting');
    setError(null);

    try {
      let exportData: PresetExportFormat;
      let filename: string;

      switch (exportFormat) {
        case 'json':
          exportData = {
            version: '1.0.0',
            type,
            data,
            metadata: {
              exportedAt: new Date().toISOString(),
              application: 'OpenChart',
              version: '1.0.0',
            },
          };
          filename = `openchart-${type}-${new Date().toISOString().split('T')[0]}.json`;
          break;

        case 'css':
          const cssContent = generateCSSFromPresets(data as StylePreset[]);
          exportData = cssContent as any; // For CSS export
          filename = `openchart-styles-${new Date().toISOString().split('T')[0]}.css`;
          break;

        case 'figma':
          const figmaContent = generateFigmaTokens(data as StylePreset[]);
          exportData = figmaContent as any; // For Figma tokens
          filename = `openchart-figma-tokens-${new Date().toISOString().split('T')[0]}.json`;
          break;

        default:
          throw new Error(`Unsupported export format: ${exportFormat}`);
      }

      // Create and download file
      const blob = new Blob([
        typeof exportData === 'string' ? exportData : JSON.stringify(exportData, null, 2)
      ], {
        type: exportFormat === 'json' ? 'application/json' : 'text/plain',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      setExportResult({ filename, size: blob.size });
      setExportStatus('success');
      onExportComplete?.(exportData);
    } catch (err) {
      console.error('Export failed:', err);
      setError(err instanceof Error ? err.message : 'Export failed');
      setExportStatus('error');
    }
  }, [exportFormat, onExportComplete]);

  // Generate CSS from presets
  const generateCSSFromPresets = (presets: StylePreset[]): string => {
    let css = '/* OpenChart Style Presets */\n\n';

    presets.forEach(preset => {
      const className = `.preset-${preset.name.toLowerCase().replace(/\s+/g, '-')}`;
      css += `${className} {\n`;

      if (preset.style.fill) css += `  background-color: ${preset.style.fill};\n`;
      if (preset.style.stroke) css += `  border-color: ${preset.style.stroke};\n`;
      if (preset.style.strokeWidth) css += `  border-width: ${preset.style.strokeWidth}px;\n`;
      if (preset.style.opacity) css += `  opacity: ${preset.style.opacity};\n`;
      if (preset.style.fontSize) css += `  font-size: ${preset.style.fontSize}px;\n`;
      if (preset.style.fontFamily) css += `  font-family: ${preset.style.fontFamily};\n`;
      if (preset.style.fontWeight) css += `  font-weight: ${preset.style.fontWeight};\n`;
      if (preset.style.color) css += `  color: ${preset.style.color};\n`;
      if (preset.style.cornerRadius) css += `  border-radius: ${preset.style.cornerRadius}px;\n`;

      css += '}\n\n';
    });

    return css;
  };

  // Generate Figma design tokens
  const generateFigmaTokens = (presets: StylePreset[]): any => {
    const tokens: any = {
      colors: {},
      typography: {},
      effects: {},
    };

    presets.forEach(preset => {
      const tokenName = preset.name.toLowerCase().replace(/\s+/g, '-');

      if (preset.style.fill) {
        tokens.colors[`${tokenName}-fill`] = {
          value: preset.style.fill,
          type: 'color',
        };
      }

      if (preset.style.stroke) {
        tokens.colors[`${tokenName}-stroke`] = {
          value: preset.style.stroke,
          type: 'color',
        };
      }

      if (preset.style.fontSize && preset.style.fontFamily) {
        tokens.typography[tokenName] = {
          value: {
            fontSize: preset.style.fontSize,
            fontFamily: preset.style.fontFamily,
            fontWeight: preset.style.fontWeight || 'normal',
          },
          type: 'typography',
        };
      }
    });

    return tokens;
  };

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileImport(file);
    }
  }, [handleFileImport]);

  return (
    <div className="modal-overlay">
      <div className={`preset-import-export-modal ${className}`}>
        <div className="modal-header">
          <h3>Import & Export Presets</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="modal-tabs">
          <button
            className={`tab ${activeTab === 'import' ? 'active' : ''}`}
            onClick={() => setActiveTab('import')}
          >
            <Upload size={16} />
            Import
          </button>
          <button
            className={`tab ${activeTab === 'export' ? 'active' : ''}`}
            onClick={() => setActiveTab('export')}
          >
            <Download size={16} />
            Export
          </button>
          <button
            className={`tab ${activeTab === 'share' ? 'active' : ''}`}
            onClick={() => setActiveTab('share')}
          >
            <Share2 size={16} />
            Share
          </button>
        </div>

        <div className="modal-content">
          {/* Import Tab */}
          {activeTab === 'import' && (
            <div className="import-section">
              <div className="import-methods">
                <button
                  className={`method-btn ${importMethod === 'file' ? 'active' : ''}`}
                  onClick={() => setImportMethod('file')}
                >
                  <FileText size={16} />
                  From File
                </button>
                <button
                  className={`method-btn ${importMethod === 'url' ? 'active' : ''}`}
                  onClick={() => setImportMethod('url')}
                >
                  <Link size={16} />
                  From URL
                </button>
                <button
                  className={`method-btn ${importMethod === 'text' ? 'active' : ''}`}
                  onClick={() => setImportMethod('text')}
                >
                  <Copy size={16} />
                  From Text
                </button>
              </div>

              {importMethod === 'file' && (
                <div className="import-method-content">
                  <div className="file-drop-zone">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileInputChange}
                      style={{ display: 'none' }}
                    />
                    <div className="drop-zone-content">
                      <Upload size={48} />
                      <h4>Select or drop a file</h4>
                      <p>Supports JSON files with presets, collections, or themes</p>
                      <button
                        className="select-file-btn"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Select File
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {importMethod === 'url' && (
                <div className="import-method-content">
                  <div className="url-import">
                    <label>Import from URL</label>
                    <input
                      type="url"
                      placeholder="https://example.com/presets.json"
                      className="url-input"
                    />
                    <button className="import-btn">Import from URL</button>
                  </div>
                </div>
              )}

              {importMethod === 'text' && (
                <div className="import-method-content">
                  <div className="text-import">
                    <label>Paste JSON content</label>
                    <textarea
                      ref={textAreaRef}
                      placeholder="Paste your preset JSON here..."
                      rows={8}
                      className="text-input"
                    />
                    <button
                      className="import-btn"
                      onClick={() => {
                        const text = textAreaRef.current?.value;
                        if (text) handleTextImport(text);
                      }}
                    >
                      Import from Text
                    </button>
                  </div>
                </div>
              )}

              {/* Import Status */}
              {importStatus !== 'idle' && (
                <div className={`import-status ${importStatus}`}>
                  {importStatus === 'importing' && (
                    <div className="status-loading">
                      <div className="loading-spinner" />
                      <span>Importing...</span>
                    </div>
                  )}

                  {importStatus === 'success' && importResult && (
                    <div className="status-success">
                      <Check size={20} />
                      <div>
                        <h4>Import Successful!</h4>
                        <p>
                          Imported {Array.isArray(importResult) ? importResult.length : 1} item(s)
                        </p>
                      </div>
                    </div>
                  )}

                  {importStatus === 'error' && (
                    <div className="status-error">
                      <AlertCircle size={20} />
                      <div>
                        <h4>Import Failed</h4>
                        <p>{error}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="export-section">
              <div className="export-format">
                <label>Export Format</label>
                <div className="format-options">
                  <button
                    className={`format-btn ${exportFormat === 'json' ? 'active' : ''}`}
                    onClick={() => setExportFormat('json')}
                  >
                    <Package size={16} />
                    JSON
                    <span>Native format</span>
                  </button>
                  <button
                    className={`format-btn ${exportFormat === 'css' ? 'active' : ''}`}
                    onClick={() => setExportFormat('css')}
                  >
                    <FileText size={16} />
                    CSS
                    <span>Stylesheet</span>
                  </button>
                  <button
                    className={`format-btn ${exportFormat === 'figma' ? 'active' : ''}`}
                    onClick={() => setExportFormat('figma')}
                  >
                    <Globe size={16} />
                    Figma
                    <span>Design tokens</span>
                  </button>
                </div>
              </div>

              <div className="export-options">
                <button
                  className="export-btn primary"
                  onClick={() => {
                    // This would be connected to actual preset data
                    // For now, showing the interface
                    console.log('Export all presets');
                  }}
                >
                  <Download size={16} />
                  Export All Presets
                </button>

                <button
                  className="export-btn"
                  onClick={() => {
                    console.log('Export selected presets');
                  }}
                >
                  <Download size={16} />
                  Export Selected
                </button>

                <button
                  className="export-btn"
                  onClick={() => {
                    console.log('Export as collection');
                  }}
                >
                  <Package size={16} />
                  Export as Collection
                </button>
              </div>

              {/* Export Status */}
              {exportStatus !== 'idle' && (
                <div className={`export-status ${exportStatus}`}>
                  {exportStatus === 'exporting' && (
                    <div className="status-loading">
                      <div className="loading-spinner" />
                      <span>Exporting...</span>
                    </div>
                  )}

                  {exportStatus === 'success' && exportResult && (
                    <div className="status-success">
                      <Check size={20} />
                      <div>
                        <h4>Export Successful!</h4>
                        <p>
                          Downloaded {exportResult.filename} ({Math.round(exportResult.size / 1024)} KB)
                        </p>
                      </div>
                    </div>
                  )}

                  {exportStatus === 'error' && (
                    <div className="status-error">
                      <AlertCircle size={20} />
                      <div>
                        <h4>Export Failed</h4>
                        <p>{error}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Share Tab */}
          {activeTab === 'share' && (
            <div className="share-section">
              <div className="share-info">
                <Info size={20} />
                <div>
                  <h4>Share Your Presets</h4>
                  <p>Share your style presets with the community or team members</p>
                </div>
              </div>

              <div className="share-settings">
                <div className="setting-item">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={shareSettings.isPublic}
                      onChange={(e) => setShareSettings(prev => ({
                        ...prev,
                        isPublic: e.target.checked
                      }))}
                    />
                    <Globe size={16} />
                    Make public
                    <span>Anyone can find and use these presets</span>
                  </label>
                </div>

                <div className="setting-item">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={shareSettings.allowDownload}
                      onChange={(e) => setShareSettings(prev => ({
                        ...prev,
                        allowDownload: e.target.checked
                      }))}
                    />
                    <Download size={16} />
                    Allow download
                    <span>Others can download and use these presets</span>
                  </label>
                </div>

                <div className="setting-item">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={shareSettings.requireAttribution}
                      onChange={(e) => setShareSettings(prev => ({
                        ...prev,
                        requireAttribution: e.target.checked
                      }))}
                    />
                    <User size={16} />
                    Require attribution
                    <span>Others must credit you when using these presets</span>
                  </label>
                </div>
              </div>

              <div className="share-actions">
                <button className="share-btn primary">
                  <Share2 size={16} />
                  Create Share Link
                </button>
                <button className="share-btn">
                  <Copy size={16} />
                  Copy Share Code
                </button>
              </div>

              <div className="coming-soon">
                <Lock size={24} />
                <h4>Sharing Coming Soon</h4>
                <p>Preset sharing features will be available in a future update</p>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PresetImportExport;