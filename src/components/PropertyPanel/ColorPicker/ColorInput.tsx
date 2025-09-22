import React, { useState, useCallback, useEffect } from 'react';
import {
  parseColor,
  getAllFormats,
  type RGBAColor,
  type HSLAColor,
  type ColorFormats
} from './colorUtils';

interface ColorInputProps {
  color: string;
  onChange: (color: string) => void;
  format?: 'hex' | 'rgb' | 'hsl';
  showAlpha?: boolean;
  className?: string;
}

type InputFormat = 'hex' | 'rgb' | 'hsl';

export const ColorInput: React.FC<ColorInputProps> = ({
  color,
  onChange,
  format: initialFormat = 'hex',
  showAlpha = true,
  className = '',
}) => {
  const [format, setFormat] = useState<InputFormat>(initialFormat);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(true);

  // Parse current color and get all formats
  const rgba = parseColor(color);
  const allFormats = getAllFormats(rgba);

  // Update input values when color changes
  useEffect(() => {
    updateInputValues(rgba, format);
  }, [color, format]);

  const updateInputValues = useCallback((rgba: RGBAColor, currentFormat: InputFormat) => {
    const formats = getAllFormats(rgba);

    switch (currentFormat) {
      case 'hex':
        setInputValues({
          hex: formats.hex.replace('#', ''),
        });
        break;
      case 'rgb':
        setInputValues({
          r: rgba.r.toString(),
          g: rgba.g.toString(),
          b: rgba.b.toString(),
          ...(showAlpha && { a: (rgba.a * 100).toFixed(0) }),
        });
        break;
      case 'hsl':
        setInputValues({
          h: formats.hsla.h.toString(),
          s: formats.hsla.s.toString(),
          l: formats.hsla.l.toString(),
          ...(showAlpha && { a: (rgba.a * 100).toFixed(0) }),
        });
        break;
    }
  }, [showAlpha]);

  const handleFormatChange = (newFormat: InputFormat) => {
    setFormat(newFormat);
    updateInputValues(rgba, newFormat);
  };

  const handleInputChange = (field: string, value: string) => {
    const newValues = { ...inputValues, [field]: value };
    setInputValues(newValues);

    // Validate and convert to color
    try {
      let newColor: string;

      switch (format) {
        case 'hex':
          // Validate hex
          const hexValue = newValues.hex.replace('#', '');
          if (!/^[0-9A-Fa-f]{0,8}$/.test(hexValue)) {
            setIsValid(false);
            return;
          }

          if (hexValue.length === 3 || hexValue.length === 6 || hexValue.length === 8) {
            newColor = `#${hexValue}`;
            setIsValid(true);
            onChange(newColor);
          } else {
            setIsValid(false);
          }
          break;

        case 'rgb':
          const r = parseInt(newValues.r) || 0;
          const g = parseInt(newValues.g) || 0;
          const b = parseInt(newValues.b) || 0;
          const a = showAlpha ? (parseInt(newValues.a) || 100) / 100 : 1;

          if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255 && a >= 0 && a <= 1) {
            newColor = showAlpha && a < 1
              ? `rgba(${r}, ${g}, ${b}, ${a})`
              : `rgb(${r}, ${g}, ${b})`;
            setIsValid(true);
            onChange(newColor);
          } else {
            setIsValid(false);
          }
          break;

        case 'hsl':
          const h = parseInt(newValues.h) || 0;
          const s = parseInt(newValues.s) || 0;
          const l = parseInt(newValues.l) || 0;
          const hslA = showAlpha ? (parseInt(newValues.a) || 100) / 100 : 1;

          if (h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100 && hslA >= 0 && hslA <= 1) {
            newColor = showAlpha && hslA < 1
              ? `hsla(${h}, ${s}%, ${l}%, ${hslA})`
              : `hsl(${h}, ${s}%, ${l}%)`;
            setIsValid(true);
            onChange(newColor);
          } else {
            setIsValid(false);
          }
          break;
      }
    } catch (error) {
      setIsValid(false);
    }
  };

  const handleInputBlur = () => {
    // Reset to valid values on blur if invalid
    if (!isValid) {
      updateInputValues(rgba, format);
      setIsValid(true);
    }
  };

  const getFieldRanges = (format: InputFormat): Record<string, { min: number; max: number; step: number }> => {
    switch (format) {
      case 'hex':
        return { hex: { min: 0, max: 16777215, step: 1 } };
      case 'rgb':
        return {
          r: { min: 0, max: 255, step: 1 },
          g: { min: 0, max: 255, step: 1 },
          b: { min: 0, max: 255, step: 1 },
          ...(showAlpha && { a: { min: 0, max: 100, step: 1 } }),
        };
      case 'hsl':
        return {
          h: { min: 0, max: 360, step: 1 },
          s: { min: 0, max: 100, step: 1 },
          l: { min: 0, max: 100, step: 1 },
          ...(showAlpha && { a: { min: 0, max: 100, step: 1 } }),
        };
      default:
        return {};
    }
  };

  const renderHexInput = () => (
    <div className="color-input__field">
      <label className="color-input__label" htmlFor="hex-input">
        HEX
      </label>
      <div className="relative">
        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">#</span>
        <input
          id="hex-input"
          type="text"
          className={`color-input__input pl-6 ${!isValid ? 'color-input__input--invalid' : ''}`}
          value={inputValues.hex || ''}
          onChange={(e) => handleInputChange('hex', e.target.value)}
          onBlur={handleInputBlur}
          placeholder="000000"
          maxLength={8}
          aria-label="Hexadecimal color value"
          aria-describedby="hex-help"
        />
      </div>
      <div id="hex-help" className="sr-only">
        Enter a hexadecimal color value (3, 6, or 8 characters)
      </div>
    </div>
  );

  const renderRgbInputs = () => {
    const ranges = getFieldRanges('rgb');

    return (
      <>
        <div className="color-input__field">
          <label className="color-input__label" htmlFor="r-input">R</label>
          <input
            id="r-input"
            type="number"
            className={`color-input__input ${!isValid ? 'color-input__input--invalid' : ''}`}
            value={inputValues.r || ''}
            onChange={(e) => handleInputChange('r', e.target.value)}
            onBlur={handleInputBlur}
            min={ranges.r?.min || 0}
            max={ranges.r?.max || 255}
            step={ranges.r?.step || 1}
            aria-label="Red component (0-255)"
          />
        </div>
        <div className="color-input__field">
          <label className="color-input__label" htmlFor="g-input">G</label>
          <input
            id="g-input"
            type="number"
            className={`color-input__input ${!isValid ? 'color-input__input--invalid' : ''}`}
            value={inputValues.g || ''}
            onChange={(e) => handleInputChange('g', e.target.value)}
            onBlur={handleInputBlur}
            min={ranges.g?.min || 0}
            max={ranges.g?.max || 255}
            step={ranges.g?.step || 1}
            aria-label="Green component (0-255)"
          />
        </div>
        <div className="color-input__field">
          <label className="color-input__label" htmlFor="b-input">B</label>
          <input
            id="b-input"
            type="number"
            className={`color-input__input ${!isValid ? 'color-input__input--invalid' : ''}`}
            value={inputValues.b || ''}
            onChange={(e) => handleInputChange('b', e.target.value)}
            onBlur={handleInputBlur}
            min={ranges.b?.min || 0}
            max={ranges.b?.max || 255}
            step={ranges.b?.step || 1}
            aria-label="Blue component (0-255)"
          />
        </div>
        {showAlpha && (
          <div className="color-input__field">
            <label className="color-input__label" htmlFor="a-input">A</label>
            <input
              id="a-input"
              type="number"
              className={`color-input__input ${!isValid ? 'color-input__input--invalid' : ''}`}
              value={inputValues.a || ''}
              onChange={(e) => handleInputChange('a', e.target.value)}
              onBlur={handleInputBlur}
              min={ranges.a?.min || 0}
              max={ranges.a?.max || 100}
              step={ranges.a?.step || 1}
              aria-label="Alpha component (0-100%)"
            />
          </div>
        )}
      </>
    );
  };

  const renderHslInputs = () => {
    const ranges = getFieldRanges('hsl');

    return (
      <>
        <div className="color-input__field">
          <label className="color-input__label" htmlFor="h-input">H</label>
          <input
            id="h-input"
            type="number"
            className={`color-input__input ${!isValid ? 'color-input__input--invalid' : ''}`}
            value={inputValues.h || ''}
            onChange={(e) => handleInputChange('h', e.target.value)}
            onBlur={handleInputBlur}
            min={ranges.h?.min || 0}
            max={ranges.h?.max || 360}
            step={ranges.h?.step || 1}
            aria-label="Hue component (0-360°)"
          />
        </div>
        <div className="color-input__field">
          <label className="color-input__label" htmlFor="s-input">S</label>
          <input
            id="s-input"
            type="number"
            className={`color-input__input ${!isValid ? 'color-input__input--invalid' : ''}`}
            value={inputValues.s || ''}
            onChange={(e) => handleInputChange('s', e.target.value)}
            onBlur={handleInputBlur}
            min={ranges.s?.min || 0}
            max={ranges.s?.max || 100}
            step={ranges.s?.step || 1}
            aria-label="Saturation component (0-100%)"
          />
        </div>
        <div className="color-input__field">
          <label className="color-input__label" htmlFor="l-input">L</label>
          <input
            id="l-input"
            type="number"
            className={`color-input__input ${!isValid ? 'color-input__input--invalid' : ''}`}
            value={inputValues.l || ''}
            onChange={(e) => handleInputChange('l', e.target.value)}
            onBlur={handleInputBlur}
            min={ranges.l?.min || 0}
            max={ranges.l?.max || 100}
            step={ranges.l?.step || 1}
            aria-label="Lightness component (0-100%)"
          />
        </div>
        {showAlpha && (
          <div className="color-input__field">
            <label className="color-input__label" htmlFor="a-input-hsl">A</label>
            <input
              id="a-input-hsl"
              type="number"
              className={`color-input__input ${!isValid ? 'color-input__input--invalid' : ''}`}
              value={inputValues.a || ''}
              onChange={(e) => handleInputChange('a', e.target.value)}
              onBlur={handleInputBlur}
              min={ranges.a?.min || 0}
              max={ranges.a?.max || 100}
              step={ranges.a?.step || 1}
              aria-label="Alpha component (0-100%)"
            />
          </div>
        )}
      </>
    );
  };

  return (
    <div className={`color-input ${className}`}>
      {/* Format Selection */}
      <div className="color-input__format-tabs" role="tablist" aria-label="Color format selection">
        {(['hex', 'rgb', 'hsl'] as const).map((fmt) => (
          <button
            key={fmt}
            type="button"
            className={`
              color-input__format-tab
              ${format === fmt ? 'color-input__format-tab--active' : ''}
            `}
            onClick={() => handleFormatChange(fmt)}
            role="tab"
            aria-selected={format === fmt}
            aria-controls={`format-${fmt}`}
            tabIndex={format === fmt ? 0 : -1}
          >
            {fmt.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Input Fields */}
      <div
        id={`format-${format}`}
        role="tabpanel"
        aria-labelledby={`tab-${format}`}
        className="color-input__group"
      >
        {format === 'hex' && renderHexInput()}
        {format === 'rgb' && renderRgbInputs()}
        {format === 'hsl' && renderHslInputs()}
      </div>

      {/* Color Preview and Formats */}
      <div className="color-input__preview">
        <div className="text-xs text-gray-500 space-y-1">
          <div>HEX: <code className="text-xs">{allFormats.hex}</code></div>
          <div>RGB: <code className="text-xs">{allFormats.rgb}</code></div>
          <div>HSL: <code className="text-xs">{allFormats.hsl}</code></div>
        </div>
      </div>
    </div>
  );
};

export default ColorInput;