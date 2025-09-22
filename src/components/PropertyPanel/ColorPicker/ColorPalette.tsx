import React, { useState } from 'react';
import { ColorSwatchGrid } from './ColorSwatch';
import { COLOR_PALETTES } from './colorUtils';

interface ColorPaletteProps {
  selectedColor?: string;
  onColorSelect: (color: string) => void;
  onColorDoubleClick?: (color: string) => void;
  className?: string;
}

type PaletteType = keyof typeof COLOR_PALETTES;

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  selectedColor,
  onColorSelect,
  onColorDoubleClick,
  className = '',
}) => {
  const [activePalette, setActivePalette] = useState<PaletteType>('basic');

  const paletteInfo = {
    basic: { name: 'Basic', columns: 9 },
    material: { name: 'Material', columns: 7 },
    tailwind: { name: 'Tailwind', columns: 7 },
  };

  const handlePaletteChange = (palette: PaletteType) => {
    setActivePalette(palette);
  };

  return (
    <div className={`color-palette-container ${className}`}>
      {/* Palette Selection Tabs */}
      <div className="color-palette__tabs" role="tablist" aria-label="Color palette selection">
        {Object.entries(paletteInfo).map(([key, info]) => (
          <button
            key={key}
            type="button"
            className={`
              color-palette__tab
              ${activePalette === key ? 'color-palette__tab--active' : ''}
            `}
            onClick={() => handlePaletteChange(key as PaletteType)}
            role="tab"
            aria-selected={activePalette === key}
            aria-controls={`palette-${key}`}
            tabIndex={activePalette === key ? 0 : -1}
          >
            {info.name}
          </button>
        ))}
      </div>

      {/* Active Palette */}
      <div
        id={`palette-${activePalette}`}
        role="tabpanel"
        aria-labelledby={`tab-${activePalette}`}
        className="color-palette__content"
      >
        <ColorSwatchGrid
          colors={COLOR_PALETTES[activePalette]}
          selectedColor={selectedColor}
          onColorSelect={onColorSelect}
          onColorDoubleClick={onColorDoubleClick}
          columns={paletteInfo[activePalette].columns}
          className={`color-palette--${activePalette}`}
          aria-label={`${paletteInfo[activePalette].name} color palette`}
        />
      </div>

      {/* Additional Color Sets */}
      <div className="color-palette__section">
        <h4 className="color-palette__section-title">Grayscale</h4>
        <ColorSwatchGrid
          colors={[
            '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da',
            '#adb5bd', '#6c757d', '#495057', '#343a40', '#212529', '#000000'
          ]}
          selectedColor={selectedColor}
          onColorSelect={onColorSelect}
          onColorDoubleClick={onColorDoubleClick}
          columns={11}
          swatchSize="small"
          aria-label="Grayscale color palette"
        />
      </div>

      <div className="color-palette__section">
        <h4 className="color-palette__section-title">Transparency</h4>
        <ColorSwatchGrid
          colors={[
            'rgba(0, 0, 0, 0)',
            'rgba(255, 255, 255, 0.1)',
            'rgba(255, 255, 255, 0.2)',
            'rgba(255, 255, 255, 0.3)',
            'rgba(255, 255, 255, 0.5)',
            'rgba(255, 255, 255, 0.7)',
            'rgba(255, 255, 255, 0.9)',
            'rgba(0, 0, 0, 0.1)',
            'rgba(0, 0, 0, 0.2)',
            'rgba(0, 0, 0, 0.3)',
            'rgba(0, 0, 0, 0.5)',
          ]}
          selectedColor={selectedColor}
          onColorSelect={onColorSelect}
          onColorDoubleClick={onColorDoubleClick}
          columns={11}
          swatchSize="small"
          aria-label="Transparency color palette"
        />
      </div>

      {/* Theme Colors */}
      <div className="color-palette__section">
        <h4 className="color-palette__section-title">Theme Colors</h4>
        <ColorSwatchGrid
          colors={[
            '#2563eb', // Primary blue
            '#dc2626', // Danger red
            '#059669', // Success green
            '#d97706', // Warning orange
            '#7c3aed', // Purple
            '#0891b2', // Cyan
            '#be185d', // Pink
            '#374151', // Gray
          ]}
          selectedColor={selectedColor}
          onColorSelect={onColorSelect}
          onColorDoubleClick={onColorDoubleClick}
          columns={8}
          swatchSize="medium"
          aria-label="Theme color palette"
        />
      </div>
    </div>
  );
};

export default ColorPalette;