import React, { useState, useMemo, useCallback } from 'react';
import { Palette, ChevronDown, Check, Plus, Download, Moon, Sun, Monitor } from 'lucide-react';
import { useThemeManager } from './hooks/useThemeManager';
import type { StyleTheme } from '../../../types/stylePresets';
import './ThemeSelector.css';

export interface ThemeSelectorProps {
  themes: StyleTheme[];
  currentTheme?: string;
  onThemeChange: (themeId: string) => void;
  onCreateTheme?: (theme: Omit<StyleTheme, 'id' | 'created'>) => void;
  showCreateButton?: boolean;
  compact?: boolean;
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  themes,
  currentTheme,
  onThemeChange,
  onCreateTheme,
  showCreateButton = true,
  compact = false,
  className = '',
}) => {
  const { getThemeColors, applyTheme, createThemeFromCurrent } = useThemeManager();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Get current theme object
  const currentThemeObj = useMemo(() => {
    return themes.find(theme => theme.id === currentTheme);
  }, [themes, currentTheme]);

  // Group themes by type
  const groupedThemes = useMemo(() => {
    const builtIn = themes.filter(theme => theme.isBuiltIn);
    const custom = themes.filter(theme => !theme.isBuiltIn);

    return { builtIn, custom };
  }, [themes]);

  // Handle theme selection
  const handleThemeSelect = useCallback((themeId: string) => {
    onThemeChange(themeId);
    setIsDropdownOpen(false);

    // Apply theme colors to current elements if needed
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      applyTheme(theme);
    }
  }, [onThemeChange, themes, applyTheme]);

  // Handle theme creation
  const handleCreateTheme = useCallback(async (
    name: string,
    description: string,
    baseTheme?: StyleTheme
  ) => {
    if (!onCreateTheme) return;

    const newTheme = await createThemeFromCurrent(name, description, baseTheme);
    onCreateTheme(newTheme);
    setShowCreateForm(false);
  }, [onCreateTheme, createThemeFromCurrent]);

  if (compact) {
    return (
      <div className={`theme-selector compact ${className}`}>
        <div className="theme-selector-compact-container">
          <div className="current-theme-preview">
            {currentThemeObj && (
              <ThemePreview
                theme={currentThemeObj}
                size="small"
                showLabel={false}
              />
            )}
          </div>
          <select
            value={currentTheme || ''}
            onChange={(e) => handleThemeSelect(e.target.value)}
            className="theme-select-compact"
          >
            <option value="">No Theme</option>
            {groupedThemes.builtIn.length > 0 && (
              <optgroup label="Built-in Themes">
                {groupedThemes.builtIn.map(theme => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name}
                  </option>
                ))}
              </optgroup>
            )}
            {groupedThemes.custom.length > 0 && (
              <optgroup label="Custom Themes">
                {groupedThemes.custom.map(theme => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className={`theme-selector ${className}`}>
      {/* Header */}
      <div className="theme-selector-header">
        <div className="header-title">
          <Palette size={16} />
          <span>Theme</span>
        </div>
        {showCreateButton && (
          <button
            className="create-theme-btn"
            onClick={() => setShowCreateForm(true)}
            title="Create New Theme"
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      {/* Current Theme Display */}
      <div className="current-theme-container">
        <button
          className={`current-theme-button ${isDropdownOpen ? 'open' : ''}`}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="current-theme-content">
            {currentThemeObj ? (
              <>
                <ThemePreview theme={currentThemeObj} size="medium" />
                <div className="current-theme-info">
                  <span className="theme-name">{currentThemeObj.name}</span>
                  {currentThemeObj.description && (
                    <span className="theme-description">{currentThemeObj.description}</span>
                  )}
                </div>
              </>
            ) : (
              <div className="no-theme-selected">
                <span>No theme selected</span>
              </div>
            )}
          </div>
          <ChevronDown
            size={16}
            className={`dropdown-chevron ${isDropdownOpen ? 'rotated' : ''}`}
          />
        </button>

        {/* Theme Dropdown */}
        {isDropdownOpen && (
          <div className="theme-dropdown">
            <div className="theme-dropdown-content">
              {/* No Theme Option */}
              <button
                className={`theme-option ${!currentTheme ? 'selected' : ''}`}
                onClick={() => handleThemeSelect('')}
              >
                <div className="theme-option-content">
                  <div className="no-theme-preview">
                    <Monitor size={16} />
                  </div>
                  <div className="theme-option-info">
                    <span className="theme-option-name">No Theme</span>
                    <span className="theme-option-description">Use default styles</span>
                  </div>
                </div>
                {!currentTheme && <Check size={14} className="selected-check" />}
              </button>

              {/* Built-in Themes */}
              {groupedThemes.builtIn.length > 0 && (
                <div className="theme-group">
                  <div className="theme-group-header">Built-in Themes</div>
                  {groupedThemes.builtIn.map(theme => (
                    <button
                      key={theme.id}
                      className={`theme-option ${theme.id === currentTheme ? 'selected' : ''}`}
                      onClick={() => handleThemeSelect(theme.id)}
                    >
                      <div className="theme-option-content">
                        <ThemePreview theme={theme} size="small" />
                        <div className="theme-option-info">
                          <span className="theme-option-name">{theme.name}</span>
                          {theme.description && (
                            <span className="theme-option-description">{theme.description}</span>
                          )}
                        </div>
                      </div>
                      {theme.id === currentTheme && (
                        <Check size={14} className="selected-check" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Custom Themes */}
              {groupedThemes.custom.length > 0 && (
                <div className="theme-group">
                  <div className="theme-group-header">Custom Themes</div>
                  {groupedThemes.custom.map(theme => (
                    <button
                      key={theme.id}
                      className={`theme-option ${theme.id === currentTheme ? 'selected' : ''}`}
                      onClick={() => handleThemeSelect(theme.id)}
                    >
                      <div className="theme-option-content">
                        <ThemePreview theme={theme} size="small" />
                        <div className="theme-option-info">
                          <span className="theme-option-name">{theme.name}</span>
                          {theme.description && (
                            <span className="theme-option-description">{theme.description}</span>
                          )}
                        </div>
                      </div>
                      {theme.id === currentTheme && (
                        <Check size={14} className="selected-check" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Create Theme Option */}
              {showCreateButton && (
                <div className="theme-group">
                  <button
                    className="theme-option create-option"
                    onClick={() => {
                      setShowCreateForm(true);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <div className="theme-option-content">
                      <div className="create-theme-preview">
                        <Plus size={16} />
                      </div>
                      <div className="theme-option-info">
                        <span className="theme-option-name">Create New Theme</span>
                        <span className="theme-option-description">Based on current settings</span>
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Theme Colors Preview */}
      {currentThemeObj && (
        <div className="theme-colors-preview">
          <div className="colors-grid">
            {Object.entries(currentThemeObj.colors).map(([colorName, colorValue]) => (
              <div key={colorName} className="color-swatch-container">
                <div
                  className="color-swatch"
                  style={{ backgroundColor: colorValue }}
                  title={`${colorName}: ${colorValue}`}
                />
                <span className="color-name">{colorName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Theme Modal */}
      {showCreateForm && (
        <CreateThemeModal
          themes={themes}
          onCreateTheme={handleCreateTheme}
          onClose={() => setShowCreateForm(false)}
        />
      )}

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="dropdown-overlay"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

// Theme Preview Component
interface ThemePreviewProps {
  theme: StyleTheme;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const ThemePreview: React.FC<ThemePreviewProps> = ({
  theme,
  size = 'medium',
  showLabel = true,
}) => {
  const sizeClasses = {
    small: 'theme-preview-small',
    medium: 'theme-preview-medium',
    large: 'theme-preview-large',
  };

  return (
    <div className={`theme-preview ${sizeClasses[size]}`}>
      <div className="theme-color-swatches">
        <div
          className="color-swatch primary"
          style={{ backgroundColor: theme.colors.primary }}
        />
        <div
          className="color-swatch secondary"
          style={{ backgroundColor: theme.colors.secondary }}
        />
        <div
          className="color-swatch accent"
          style={{ backgroundColor: theme.colors.accent }}
        />
      </div>
      {showLabel && size !== 'small' && (
        <div className="theme-preview-label">
          <span className="theme-preview-name">{theme.name}</span>
        </div>
      )}
    </div>
  );
};

// Create Theme Modal Component
interface CreateThemeModalProps {
  themes: StyleTheme[];
  onCreateTheme: (name: string, description: string, baseTheme?: StyleTheme) => void;
  onClose: () => void;
}

const CreateThemeModal: React.FC<CreateThemeModalProps> = ({
  themes,
  onCreateTheme,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [baseThemeId, setBaseThemeId] = useState('');
  const [colors, setColors] = useState({
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#f59e0b',
    background: '#ffffff',
    text: '#1f2937',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  });

  const baseTheme = useMemo(() => {
    return themes.find(theme => theme.id === baseThemeId);
  }, [themes, baseThemeId]);

  // Update colors when base theme changes
  React.useEffect(() => {
    if (baseTheme) {
      setColors(baseTheme.colors);
    }
  }, [baseTheme]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateTheme(name.trim(), description.trim(), baseTheme);
  };

  const handleColorChange = (colorName: string, colorValue: string) => {
    setColors(prev => ({
      ...prev,
      [colorName]: colorValue,
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content create-theme-modal">
        <div className="modal-header">
          <h3>Create New Theme</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="create-theme-form">
          <div className="form-group">
            <label>Theme Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter theme name"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>Base Theme</label>
            <select
              value={baseThemeId}
              onChange={(e) => setBaseThemeId(e.target.value)}
            >
              <option value="">Start from scratch</option>
              {themes.map(theme => (
                <option key={theme.id} value={theme.id}>
                  {theme.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Theme Colors</label>
            <div className="color-inputs-grid">
              {Object.entries(colors).map(([colorName, colorValue]) => (
                <div key={colorName} className="color-input-container">
                  <label className="color-input-label">
                    {colorName.charAt(0).toUpperCase() + colorName.slice(1)}
                  </label>
                  <div className="color-input-row">
                    <input
                      type="color"
                      value={colorValue}
                      onChange={(e) => handleColorChange(colorName, e.target.value)}
                      className="color-input-picker"
                    />
                    <input
                      type="text"
                      value={colorValue}
                      onChange={(e) => handleColorChange(colorName, e.target.value)}
                      className="color-input-text"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="theme-preview-container">
            <label>Preview</label>
            <div className="theme-preview-large">
              <div className="preview-shapes">
                <div
                  className="preview-shape rectangle"
                  style={{
                    backgroundColor: colors.primary,
                    borderColor: colors.secondary,
                    color: colors.text,
                  }}
                >
                  Primary
                </div>
                <div
                  className="preview-shape circle"
                  style={{
                    backgroundColor: colors.accent,
                    borderColor: colors.secondary,
                    color: colors.background,
                  }}
                >
                  Accent
                </div>
                <div
                  className="preview-shape diamond"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.primary,
                    color: colors.text,
                  }}
                >
                  Background
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={!name.trim()}>
              Create Theme
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ThemeSelector;