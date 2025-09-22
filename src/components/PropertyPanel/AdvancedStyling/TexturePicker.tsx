import React, { useState, useCallback } from 'react';
import { Upload, RotateCcw, Copy, Image, Grid, Zap } from 'lucide-react';
import type { TexturePattern } from './types';
import { generateTextureCSS } from './cssUtils';
import './TexturePicker.css';

interface TexturePickerProps {
  texture: TexturePattern | null;
  onChange: (texture: TexturePattern | null) => void;
  className?: string;
}

interface TexturePreviewProps {
  texture: TexturePattern | null;
  size?: 'small' | 'medium' | 'large';
}

const TexturePreview: React.FC<TexturePreviewProps> = ({
  texture,
  size = 'medium'
}) => {
  let background = '#ffffff';

  if (texture) {
    if (texture.type === 'image' && texture.url) {
      background = `url(${texture.url})`;
    } else if (texture.type === 'pattern') {
      background = generateTextureCSS(texture);
    }
  }

  const sizeClasses = {
    small: 'texture-preview--small',
    medium: 'texture-preview--medium',
    large: 'texture-preview--large'
  };

  return (
    <div className={`texture-preview ${sizeClasses[size]}`}>
      <div
        className="texture-preview__element"
        style={{
          background,
          backgroundSize: texture?.size ? `${texture.size}px` : 'auto',
          backgroundRepeat: 'repeat',
          opacity: texture?.opacity || 1,
          transform: texture?.rotation ? `rotate(${texture.rotation}deg)` : 'none',
        }}
      />
    </div>
  );
};

interface PatternControlsProps {
  pattern: TexturePattern;
  onPatternChange: (pattern: TexturePattern) => void;
}

const PatternControls: React.FC<PatternControlsProps> = ({
  pattern,
  onPatternChange,
}) => {
  const handlePropertyChange = useCallback((property: keyof TexturePattern, value: any) => {
    onPatternChange({
      ...pattern,
      [property]: value,
    });
  }, [pattern, onPatternChange]);

  const PATTERN_TYPES = [
    { id: 'dots', name: 'Dots', icon: '●' },
    { id: 'stripes', name: 'Stripes', icon: '|||' },
    { id: 'checkerboard', name: 'Checkerboard', icon: '▦' },
    { id: 'diagonal', name: 'Diagonal', icon: '///' },
    { id: 'grid', name: 'Grid', icon: '⊞' },
  ] as const;

  return (
    <div className="pattern-controls">
      {/* Pattern Type */}
      <div className="pattern-controls__group">
        <label className="pattern-controls__label">Pattern Type</label>
        <div className="pattern-controls__type-grid">
          {PATTERN_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              className={`pattern-controls__type-button ${
                pattern.pattern === type.id ? 'active' : ''
              }`}
              onClick={() => handlePropertyChange('pattern', type.id)}
              title={type.name}
            >
              <span className="pattern-controls__type-icon">{type.icon}</span>
              <span className="pattern-controls__type-name">{type.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="pattern-controls__group">
        <label className="pattern-controls__label">Pattern Size</label>
        <div className="pattern-controls__size">
          <input
            type="range"
            min="2"
            max="50"
            step="1"
            value={pattern.size}
            onChange={(e) => handlePropertyChange('size', parseInt(e.target.value))}
            className="pattern-controls__size-slider"
          />
          <input
            type="number"
            min="2"
            max="50"
            step="1"
            value={pattern.size}
            onChange={(e) => handlePropertyChange('size', parseInt(e.target.value) || 2)}
            className="pattern-controls__size-input"
          />
          <span className="pattern-controls__unit">px</span>
        </div>
      </div>

      {/* Opacity */}
      <div className="pattern-controls__group">
        <label className="pattern-controls__label">Opacity</label>
        <div className="pattern-controls__opacity">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={pattern.opacity}
            onChange={(e) => handlePropertyChange('opacity', parseFloat(e.target.value))}
            className="pattern-controls__opacity-slider"
          />
          <input
            type="number"
            min="0"
            max="1"
            step="0.1"
            value={pattern.opacity}
            onChange={(e) => handlePropertyChange('opacity', parseFloat(e.target.value) || 0)}
            className="pattern-controls__opacity-input"
          />
          <span className="pattern-controls__unit">%</span>
        </div>
      </div>

      {/* Rotation (for stripes and diagonal) */}
      {(pattern.pattern === 'stripes' || pattern.pattern === 'diagonal') && (
        <div className="pattern-controls__group">
          <label className="pattern-controls__label">Rotation</label>
          <div className="pattern-controls__rotation">
            <input
              type="range"
              min="0"
              max="360"
              step="15"
              value={pattern.rotation || 0}
              onChange={(e) => handlePropertyChange('rotation', parseInt(e.target.value))}
              className="pattern-controls__rotation-slider"
            />
            <input
              type="number"
              min="0"
              max="360"
              step="15"
              value={pattern.rotation || 0}
              onChange={(e) => handlePropertyChange('rotation', parseInt(e.target.value) || 0)}
              className="pattern-controls__rotation-input"
            />
            <span className="pattern-controls__unit">°</span>
          </div>
        </div>
      )}
    </div>
  );
};

interface ImageUploadProps {
  onImageUpload: (url: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload }) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploading(true);

    try {
      // Create object URL for the uploaded image
      const url = URL.createObjectURL(file);
      onImageUpload(url);
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  }, [onImageUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  return (
    <div className="image-upload">
      <div
        className={`image-upload__area ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
      >
        <div className="image-upload__content">
          <Upload size={24} className="image-upload__icon" />
          <p className="image-upload__text">
            {uploading ? 'Uploading...' : 'Drop image here or click to select'}
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="image-upload__input"
            disabled={uploading}
          />
        </div>
      </div>
    </div>
  );
};

const PRESET_PATTERNS: TexturePattern[] = [
  {
    type: 'pattern',
    pattern: 'dots',
    size: 8,
    opacity: 0.2,
  },
  {
    type: 'pattern',
    pattern: 'stripes',
    size: 6,
    opacity: 0.15,
    rotation: 45,
  },
  {
    type: 'pattern',
    pattern: 'checkerboard',
    size: 12,
    opacity: 0.1,
  },
  {
    type: 'pattern',
    pattern: 'diagonal',
    size: 10,
    opacity: 0.2,
    rotation: 30,
  },
  {
    type: 'pattern',
    pattern: 'grid',
    size: 15,
    opacity: 0.15,
  },
];

export const TexturePicker: React.FC<TexturePickerProps> = ({
  texture,
  onChange,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'patterns' | 'images'>('patterns');
  const [showPresets, setShowPresets] = useState(false);

  const handleCreatePattern = useCallback((pattern: TexturePattern['pattern']) => {
    const newTexture: TexturePattern = {
      type: 'pattern',
      pattern,
      size: 10,
      opacity: 0.2,
    };
    onChange(newTexture);
  }, [onChange]);

  const handleImageUpload = useCallback((url: string) => {
    const newTexture: TexturePattern = {
      type: 'image',
      url,
      size: 100,
      opacity: 1,
    };
    onChange(newTexture);
    setActiveTab('images');
  }, [onChange]);

  const handlePresetSelect = useCallback((preset: TexturePattern) => {
    onChange(preset);
    setShowPresets(false);
  }, [onChange]);

  const handleReset = useCallback(() => {
    onChange(null);
  }, [onChange]);

  const handleCopyCSS = useCallback(async () => {
    if (!texture) return;

    const css = `background: ${generateTextureCSS(texture)};`;

    try {
      await navigator.clipboard.writeText(css);
    } catch (err) {
      console.error('Failed to copy CSS:', err);
    }
  }, [texture]);

  return (
    <div className={`texture-picker ${className}`}>
      {/* Header */}
      <div className="texture-picker__header">
        <h3 className="texture-picker__title">Texture & Patterns</h3>
        <div className="texture-picker__actions">
          <button
            type="button"
            className="texture-picker__action"
            onClick={() => setShowPresets(!showPresets)}
            title="Show presets"
          >
            <Grid size={16} />
          </button>
          {texture && (
            <button
              type="button"
              className="texture-picker__action"
              onClick={handleCopyCSS}
              title="Copy CSS"
            >
              <Copy size={16} />
            </button>
          )}
          <button
            type="button"
            className="texture-picker__action"
            onClick={handleReset}
            title="Clear texture"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="texture-picker__preview">
        <TexturePreview texture={texture} size="large" />
      </div>

      {/* Tabs */}
      <div className="texture-picker__tabs">
        <button
          type="button"
          className={`texture-picker__tab ${activeTab === 'patterns' ? 'active' : ''}`}
          onClick={() => setActiveTab('patterns')}
        >
          <Zap size={16} />
          Patterns
        </button>
        <button
          type="button"
          className={`texture-picker__tab ${activeTab === 'images' ? 'active' : ''}`}
          onClick={() => setActiveTab('images')}
        >
          <Image size={16} />
          Images
        </button>
      </div>

      {/* Content */}
      <div className="texture-picker__content">
        {activeTab === 'patterns' && (
          <div className="texture-picker__patterns">
            {texture?.type === 'pattern' ? (
              <PatternControls
                pattern={texture}
                onPatternChange={onChange}
              />
            ) : (
              <div className="texture-picker__pattern-start">
                <p>Select a pattern to get started:</p>
                <div className="texture-picker__pattern-types">
                  {['dots', 'stripes', 'checkerboard', 'diagonal', 'grid'].map((pattern) => (
                    <button
                      key={pattern}
                      type="button"
                      className="texture-picker__pattern-button"
                      onClick={() => handleCreatePattern(pattern as any)}
                    >
                      <div className="texture-picker__pattern-preview">
                        <TexturePreview
                          texture={{
                            type: 'pattern',
                            pattern: pattern as any,
                            size: 8,
                            opacity: 0.3,
                          }}
                          size="small"
                        />
                      </div>
                      <span className="texture-picker__pattern-name">
                        {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'images' && (
          <div className="texture-picker__images">
            {texture?.type === 'image' ? (
              <div className="texture-picker__image-controls">
                <div className="texture-picker__current-image">
                  <img
                    src={texture.url}
                    alt="Texture"
                    className="texture-picker__image-preview"
                  />
                </div>

                {/* Size Control */}
                <div className="texture-picker__group">
                  <label className="texture-picker__label">Size</label>
                  <div className="texture-picker__size">
                    <input
                      type="range"
                      min="10"
                      max="500"
                      step="10"
                      value={texture.size}
                      onChange={(e) => onChange({ ...texture, size: parseInt(e.target.value) })}
                      className="texture-picker__size-slider"
                    />
                    <input
                      type="number"
                      min="10"
                      max="500"
                      step="10"
                      value={texture.size}
                      onChange={(e) => onChange({ ...texture, size: parseInt(e.target.value) || 10 })}
                      className="texture-picker__size-input"
                    />
                    <span className="texture-picker__unit">px</span>
                  </div>
                </div>

                {/* Opacity Control */}
                <div className="texture-picker__group">
                  <label className="texture-picker__label">Opacity</label>
                  <div className="texture-picker__opacity">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={texture.opacity}
                      onChange={(e) => onChange({ ...texture, opacity: parseFloat(e.target.value) })}
                      className="texture-picker__opacity-slider"
                    />
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={texture.opacity}
                      onChange={(e) => onChange({ ...texture, opacity: parseFloat(e.target.value) || 0 })}
                      className="texture-picker__opacity-input"
                    />
                  </div>
                </div>

                <ImageUpload onImageUpload={handleImageUpload} />
              </div>
            ) : (
              <ImageUpload onImageUpload={handleImageUpload} />
            )}
          </div>
        )}
      </div>

      {/* Presets */}
      {showPresets && (
        <div className="texture-picker__presets">
          <h4 className="texture-picker__presets-title">Pattern Presets</h4>
          <div className="texture-picker__presets-grid">
            {PRESET_PATTERNS.map((preset, index) => (
              <div
                key={index}
                className="texture-picker__preset"
                onClick={() => handlePresetSelect(preset)}
              >
                <TexturePreview texture={preset} size="small" />
                <span className="texture-picker__preset-name">
                  {preset.pattern?.charAt(0).toUpperCase() + preset.pattern?.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CSS Output */}
      {texture && (
        <div className="texture-picker__css">
          <label className="texture-picker__css-label">CSS Output</label>
          <code className="texture-picker__css-output">
            background: {generateTextureCSS(texture)};
          </code>
        </div>
      )}
    </div>
  );
};

export default TexturePicker;