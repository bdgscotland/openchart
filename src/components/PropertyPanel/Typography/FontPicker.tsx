import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Check } from 'lucide-react';
import './FontPicker.css';

// Popular web fonts with fallbacks
export const WEB_SAFE_FONTS = [
  { name: 'Arial', family: 'Arial, sans-serif', category: 'Sans Serif' },
  { name: 'Helvetica', family: 'Helvetica, Arial, sans-serif', category: 'Sans Serif' },
  { name: 'Georgia', family: 'Georgia, serif', category: 'Serif' },
  { name: 'Times New Roman', family: 'Times New Roman, Times, serif', category: 'Serif' },
  { name: 'Courier New', family: 'Courier New, Courier, monospace', category: 'Monospace' },
  { name: 'Verdana', family: 'Verdana, Geneva, sans-serif', category: 'Sans Serif' },
  { name: 'Trebuchet MS', family: 'Trebuchet MS, Helvetica, sans-serif', category: 'Sans Serif' },
  { name: 'Impact', family: 'Impact, Charcoal, sans-serif', category: 'Display' },
  { name: 'Comic Sans MS', family: 'Comic Sans MS, cursive', category: 'Cursive' },
  { name: 'Palatino', family: 'Palatino, Palatino Linotype, serif', category: 'Serif' }
];

// Google Fonts (subset for demo - would load dynamically in production)
export const GOOGLE_FONTS = [
  { name: 'Open Sans', family: '"Open Sans", sans-serif', category: 'Sans Serif' },
  { name: 'Roboto', family: '"Roboto", sans-serif', category: 'Sans Serif' },
  { name: 'Lato', family: '"Lato", sans-serif', category: 'Sans Serif' },
  { name: 'Montserrat', family: '"Montserrat", sans-serif', category: 'Sans Serif' },
  { name: 'Source Sans Pro', family: '"Source Sans Pro", sans-serif', category: 'Sans Serif' },
  { name: 'Oswald', family: '"Oswald", sans-serif', category: 'Sans Serif' },
  { name: 'Raleway', family: '"Raleway", sans-serif', category: 'Sans Serif' },
  { name: 'Poppins', family: '"Poppins", sans-serif', category: 'Sans Serif' },
  { name: 'Playfair Display', family: '"Playfair Display", serif', category: 'Serif' },
  { name: 'Merriweather', family: '"Merriweather", serif', category: 'Serif' },
  { name: 'Libre Baskerville', family: '"Libre Baskerville", serif', category: 'Serif' },
  { name: 'Fira Code', family: '"Fira Code", monospace', category: 'Monospace' },
  { name: 'Source Code Pro', family: '"Source Code Pro", monospace', category: 'Monospace' },
  { name: 'Dancing Script', family: '"Dancing Script", cursive', category: 'Cursive' },
  { name: 'Pacifico', family: '"Pacifico", cursive', category: 'Cursive' }
];

export const ALL_FONTS = [...WEB_SAFE_FONTS, ...GOOGLE_FONTS];

export const FONT_WEIGHTS = [
  { value: '100', label: 'Thin (100)' },
  { value: '200', label: 'Extra Light (200)' },
  { value: '300', label: 'Light (300)' },
  { value: '400', label: 'Regular (400)', alias: 'normal' },
  { value: '500', label: 'Medium (500)' },
  { value: '600', label: 'Semi Bold (600)' },
  { value: '700', label: 'Bold (700)', alias: 'bold' },
  { value: '800', label: 'Extra Bold (800)' },
  { value: '900', label: 'Black (900)' }
];

export const FONT_STYLES = [
  { value: 'normal', label: 'Normal' },
  { value: 'italic', label: 'Italic' },
  { value: 'oblique', label: 'Oblique' }
];

export const FONT_SIZES = [
  8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 48, 60, 72, 96
];

interface FontPickerProps {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  onFontFamilyChange: (family: string) => void;
  onFontSizeChange: (size: number) => void;
  onFontWeightChange: (weight: string) => void;
  onFontStyleChange: (style: string) => void;
  className?: string;
}

export const FontPicker: React.FC<FontPickerProps> = ({
  fontFamily = 'Arial, sans-serif',
  fontSize = 14,
  fontWeight = 'normal',
  fontStyle = 'normal',
  onFontFamilyChange,
  onFontSizeChange,
  onFontWeightChange,
  onFontStyleChange,
  className = ''
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter fonts based on search and category
  const filteredFonts = ALL_FONTS.filter(font => {
    const matchesSearch = font.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         font.family.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || font.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(ALL_FONTS.map(font => font.category)))];

  // Get display name for current font
  const getCurrentFontName = () => {
    const font = ALL_FONTS.find(f => f.family === fontFamily);
    return font ? font.name : fontFamily?.split(',')[0] || 'Arial';
  };

  const handleFontSelect = (font: typeof ALL_FONTS[0]) => {
    onFontFamilyChange(font.family);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  const handleSizeInput = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 999) {
      onFontSizeChange(numValue);
    }
  };

  return (
    <div className={`font-picker ${className}`}>
      {/* Font Family Selector */}
      <div className="form-group">
        <label className="form-label">Font Family</label>
        <div className="font-family-selector" ref={dropdownRef}>
          <button
            className="font-family-button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{ fontFamily }}
          >
            <span className="font-name">{getCurrentFontName()}</span>
            <span className="dropdown-arrow">{isDropdownOpen ? '▲' : '▼'}</span>
          </button>

          {isDropdownOpen && (
            <div className="font-dropdown">
              {/* Search and Filter */}
              <div className="font-dropdown-header">
                <div className="search-container">
                  <Search size={14} />
                  <input
                    type="text"
                    placeholder="Search fonts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="font-search"
                  />
                  {searchTerm && (
                    <button
                      className="clear-search"
                      onClick={() => setSearchTerm('')}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div className="category-filter">
                  {categories.map(category => (
                    <button
                      key={category}
                      className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category === 'all' ? 'All' : category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font List */}
              <div className="font-list">
                {filteredFonts.map(font => (
                  <button
                    key={font.name}
                    className={`font-option ${font.family === fontFamily ? 'selected' : ''}`}
                    onClick={() => handleFontSelect(font)}
                    style={{ fontFamily: font.family }}
                  >
                    <span className="font-preview">
                      {font.name}
                      <span className="font-sample">The quick brown fox</span>
                    </span>
                    {font.family === fontFamily && <Check size={16} />}
                  </button>
                ))}
                {filteredFonts.length === 0 && (
                  <div className="no-fonts">No fonts found</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Font Size */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Size</label>
          <div className="size-input-container">
            <input
              type="number"
              value={fontSize}
              onChange={(e) => handleSizeInput(e.target.value)}
              min="1"
              max="999"
              className="size-input"
            />
            <span className="input-unit">px</span>
          </div>
          <div className="size-presets">
            {FONT_SIZES.slice(0, 8).map(size => (
              <button
                key={size}
                className={`size-preset ${fontSize === size ? 'active' : ''}`}
                onClick={() => onFontSizeChange(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Font Weight and Style */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Weight</label>
          <select
            value={fontWeight}
            onChange={(e) => onFontWeightChange(e.target.value)}
            className="select-input"
          >
            {FONT_WEIGHTS.map(weight => (
              <option key={weight.value} value={weight.value}>
                {weight.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Style</label>
          <select
            value={fontStyle}
            onChange={(e) => onFontStyleChange(e.target.value)}
            className="select-input"
          >
            {FONT_STYLES.map(style => (
              <option key={style.value} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FontPicker;