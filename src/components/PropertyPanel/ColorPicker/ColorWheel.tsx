import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  parseColor,
  formatColor,
  rgbaToHsva,
  hsvaToRgba,
  type HSVAColor
} from './colorUtils';

interface ColorWheelProps {
  color: string;
  onChange: (color: string) => void;
  size?: number;
  className?: string;
}


export const ColorWheel: React.FC<ColorWheelProps> = ({
  color,
  onChange,
  size = 200,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentHsva, setCurrentHsva] = useState<HSVAColor>(() => {
    return rgbaToHsva(parseColor(color));
  });

  // Update HSVA when color prop changes
  useEffect(() => {
    const rgba = parseColor(color);
    const hsva = rgbaToHsva(rgba);
    setCurrentHsva(hsva);
  }, [color]);

  // Draw the color wheel
  const drawColorWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Create color wheel
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= radius) {
          // Calculate hue and saturation from position
          const angle = Math.atan2(dy, dx);
          const hue = ((angle * 180 / Math.PI) + 360) % 360;
          const saturation = Math.min(distance / radius, 1) * 100;

          // Use current lightness/value for the wheel
          const hsva: HSVAColor = {
            h: hue,
            s: saturation,
            v: currentHsva.v,
            a: currentHsva.a,
          };

          const rgba = hsvaToRgba(hsva);
          const index = (y * size + x) * 4;

          data[index] = rgba.r;     // Red
          data[index + 1] = rgba.g; // Green
          data[index + 2] = rgba.b; // Blue
          data[index + 3] = 255;    // Alpha
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Draw current position indicator
    drawPositionIndicator(ctx, centerX, centerY, radius);
  }, [size, currentHsva]);

  const drawPositionIndicator = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number
  ) => {
    // Calculate position from current hue and saturation
    const angle = (currentHsva.h * Math.PI) / 180;
    const distance = (currentHsva.s / 100) * radius;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;

    // Draw indicator circle
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner circle for contrast
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = formatColor(hsvaToRgba(currentHsva));
    ctx.fill();
  };

  // Redraw when HSVA changes
  useEffect(() => {
    drawColorWheel();
  }, [drawColorWheel]);

  const getColorFromPosition = (x: number, y: number): HSVAColor => {
    const canvas = canvasRef.current;
    if (!canvas) return currentHsva;

    const rect = canvas.getBoundingClientRect();
    const canvasX = ((x - rect.left) / rect.width) * size;
    const canvasY = ((y - rect.top) / rect.height) * size;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;

    const dx = canvasX - centerX;
    const dy = canvasY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > radius) {
      // If outside the wheel, clamp to the edge
      const angle = Math.atan2(dy, dx);
      const clampedX = centerX + Math.cos(angle) * radius;
      const clampedY = centerY + Math.sin(angle) * radius;

      const clampedDx = clampedX - centerX;
      const clampedDy = clampedY - centerY;
      const hue = ((Math.atan2(clampedDy, clampedDx) * 180 / Math.PI) + 360) % 360;

      return {
        h: hue,
        s: 100,
        v: currentHsva.v,
        a: currentHsva.a,
      };
    }

    const angle = Math.atan2(dy, dx);
    const hue = ((angle * 180 / Math.PI) + 360) % 360;
    const saturation = Math.min(distance / radius, 1) * 100;

    return {
      h: hue,
      s: saturation,
      v: currentHsva.v,
      a: currentHsva.a,
    };
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    setIsDragging(true);
    handleColorChange(event.clientX, event.clientY);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isDragging) {
      handleColorChange(event.clientX, event.clientY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleColorChange = (clientX: number, clientY: number) => {
    const newHsva = getColorFromPosition(clientX, clientY);
    setCurrentHsva(newHsva);

    const rgba = hsvaToRgba(newHsva);
    const newColor = formatColor(rgba);
    onChange(newColor);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const step = event.shiftKey ? 10 : 1;
    const newHsva = { ...currentHsva };

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        newHsva.h = (newHsva.h - step + 360) % 360;
        break;
      case 'ArrowRight':
        event.preventDefault();
        newHsva.h = (newHsva.h + step) % 360;
        break;
      case 'ArrowUp':
        event.preventDefault();
        newHsva.s = Math.min(100, newHsva.s + step);
        break;
      case 'ArrowDown':
        event.preventDefault();
        newHsva.s = Math.max(0, newHsva.s - step);
        break;
      default:
        return;
    }

    setCurrentHsva(newHsva);
    const rgba = hsvaToRgba(newHsva);
    const newColor = formatColor(rgba);
    onChange(newColor);
  };

  // Touch event handlers
  const handleTouchStart = (event: React.TouchEvent) => {
    event.preventDefault();
    setIsDragging(true);
    const touch = event.touches[0];
    handleColorChange(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    event.preventDefault();
    if (isDragging) {
      const touch = event.touches[0];
      handleColorChange(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  // Global mouse events for dragging
  useEffect(() => {
    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (isDragging) {
        handleColorChange(event.clientX, event.clientY);
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging]);

  return (
    <div className={`color-wheel ${className}`}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="color-wheel__canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="slider"
        aria-label={`Color wheel. Current color: ${color}. Use arrow keys to adjust hue and saturation.`}
        aria-valuemin={0}
        aria-valuemax={360}
        aria-valuenow={currentHsva.h}
        aria-valuetext={`Hue: ${Math.round(currentHsva.h)}°, Saturation: ${Math.round(currentHsva.s)}%`}
      />

      {/* Instructions for screen readers */}
      <div className="sr-only">
        Use the color wheel to select hue and saturation.
        Arrow keys: Left/Right to adjust hue, Up/Down to adjust saturation.
        Hold Shift for larger steps.
      </div>
    </div>
  );
};

interface ColorSliderProps {
  type: 'hue' | 'saturation' | 'lightness' | 'alpha';
  value: number;
  max: number;
  onChange: (value: number) => void;
  color?: string;
  className?: string;
}

export const ColorSlider: React.FC<ColorSliderProps> = ({
  type,
  value,
  max,
  onChange,
  color = '#ff0000',
  className = '',
}) => {
  const getBackgroundStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties & Record<string, string> = {};

    switch (type) {
      case 'hue':
        return {
          background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
        };
      case 'saturation':
        baseStyle['--color-picker-hue'] = color;
        return baseStyle;
      case 'lightness':
        baseStyle['--color-picker-hue'] = color;
        return baseStyle;
      case 'alpha':
        baseStyle['--color-picker-color'] = color;
        return baseStyle;
      default:
        return {};
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'hue':
        return 'Hue';
      case 'saturation':
        return 'Saturation';
      case 'lightness':
        return 'Lightness';
      case 'alpha':
        return 'Alpha';
      default:
        return type;
    }
  };

  const getUnit = () => {
    switch (type) {
      case 'hue':
        return '°';
      case 'saturation':
      case 'lightness':
      case 'alpha':
        return '%';
      default:
        return '';
    }
  };

  const displayValue = type === 'alpha' ? Math.round(value) : Math.round(value);

  return (
    <div className={`color-slider color-slider--${type} ${className}`}>
      <div className="color-slider__label">
        <span>{getLabel()}</span>
        <span className="color-slider__value">
          {displayValue}{getUnit()}
        </span>
      </div>
      <div className="color-slider__input-wrapper">
        <div
          className="color-slider__track"
          style={getBackgroundStyle()}
        />
        <input
          type="range"
          className="color-slider__input"
          min={0}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          aria-label={`${getLabel()}: ${displayValue}${getUnit()}`}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={value}
        />
      </div>
    </div>
  );
};

export default ColorWheel;