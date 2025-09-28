import React, { useCallback, useState, useEffect } from 'react';
import { DimensionInput } from './DimensionInput';
import type { SizeControlsProps, Dimensions } from './types';
import './SizeControls.css';

export const SizeControls: React.FC<SizeControlsProps> = ({
  dimensions,
  position,
  aspectRatioLocked,
  isMultiSelection,
  selectedNodeIds,
  onDimensionsChange,
  onPositionChange,
  onAspectRatioToggle
}) => {
  const [aspectRatio, setAspectRatio] = useState<number>(1);

  // Calculate aspect ratio when dimensions change
  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      setAspectRatio(dimensions.width / dimensions.height);
    }
  }, [dimensions.width, dimensions.height]);

  const handleWidthChange = useCallback((value: number, unit: typeof dimensions.unit) => {
    const newDimensions: Dimensions = {
      ...dimensions,
      width: value,
      unit
    };

    // Maintain aspect ratio if locked
    if (aspectRatioLocked && aspectRatio > 0) {
      newDimensions.height = Math.round(value / aspectRatio);
    }

    onDimensionsChange(newDimensions);
  }, [dimensions, aspectRatioLocked, aspectRatio, onDimensionsChange]);

  const handleHeightChange = useCallback((value: number, unit: typeof dimensions.unit) => {
    const newDimensions: Dimensions = {
      ...dimensions,
      height: value,
      unit
    };

    // Maintain aspect ratio if locked
    if (aspectRatioLocked && aspectRatio > 0) {
      newDimensions.width = Math.round(value * aspectRatio);
    }

    onDimensionsChange(newDimensions);
  }, [dimensions, aspectRatioLocked, aspectRatio, onDimensionsChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts for bulk adjustments
    if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
      e.preventDefault();

      const increment = e.altKey ? 1 : 10; // Alt for fine, normal for coarse
      const newDimensions = { ...dimensions };

      switch (e.key) {
        case 'ArrowRight': // Increase width
          newDimensions.width = Math.max(1, dimensions.width + increment);
          if (aspectRatioLocked) {
            newDimensions.height = Math.round(newDimensions.width / aspectRatio);
          }
          break;
        case 'ArrowLeft': // Decrease width
          newDimensions.width = Math.max(1, dimensions.width - increment);
          if (aspectRatioLocked) {
            newDimensions.height = Math.round(newDimensions.width / aspectRatio);
          }
          break;
        case 'ArrowUp': // Increase height
          newDimensions.height = Math.max(1, dimensions.height + increment);
          if (aspectRatioLocked) {
            newDimensions.width = Math.round(newDimensions.height * aspectRatio);
          }
          break;
        case 'ArrowDown': // Decrease height
          newDimensions.height = Math.max(1, dimensions.height - increment);
          if (aspectRatioLocked) {
            newDimensions.width = Math.round(newDimensions.height * aspectRatio);
          }
          break;
        default:
          return;
      }

      onDimensionsChange(newDimensions);
    }
  }, [dimensions, aspectRatioLocked, aspectRatio, onDimensionsChange]);

  const handleSwapDimensions = useCallback(() => {
    const newDimensions: Dimensions = {
      ...dimensions,
      width: dimensions.height,
      height: dimensions.width
    };
    onDimensionsChange(newDimensions);
  }, [dimensions, onDimensionsChange]);

  const handleResetToSquare = useCallback(() => {
    const size = Math.max(dimensions.width, dimensions.height);
    const newDimensions: Dimensions = {
      ...dimensions,
      width: size,
      height: size
    };
    onDimensionsChange(newDimensions);
  }, [dimensions, onDimensionsChange]);

  const formatAspectRatio = useCallback((ratio: number): string => {
    // Common aspect ratios
    const commonRatios = [
      { ratio: 1, label: '1:1' },
      { ratio: 16/9, label: '16:9' },
      { ratio: 4/3, label: '4:3' },
      { ratio: 3/2, label: '3:2' },
      { ratio: 16/10, label: '16:10' },
      { ratio: 21/9, label: '21:9' }
    ];

    const closest = commonRatios.find(r => Math.abs(r.ratio - ratio) < 0.01);
    if (closest) return closest.label;

    // Custom ratio
    return `${ratio.toFixed(2)}:1`;
  }, []);

  return (
    <div className="size-controls" onKeyDown={handleKeyDown} tabIndex={-1}>
      <div className="size-controls__header">
        <h3 className="size-controls__title">Size & Position</h3>
        {isMultiSelection && (
          <span className="size-controls__multi-badge">
            {selectedNodeIds.length} selected
          </span>
        )}
      </div>

      <div className="size-controls__section">
        <div className="size-controls__dimensions">
          <div className="size-controls__dimension-row">
            <DimensionInput
              label="Width"
              value={dimensions.width}
              unit={dimensions.unit}
              onChange={handleWidthChange}
              onKeyDown={handleKeyDown}
              min={1}
              max={9999}
            />

            <div className="size-controls__aspect-lock">
              <button
                type="button"
                className={`size-controls__aspect-button ${
                  aspectRatioLocked ? 'size-controls__aspect-button--locked' : ''
                }`}
                onClick={() => onAspectRatioToggle(!aspectRatioLocked)}
                title={aspectRatioLocked ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
              >
                {aspectRatioLocked ? '🔒' : '🔓'}
              </button>
            </div>

            <DimensionInput
              label="Height"
              value={dimensions.height}
              unit={dimensions.unit}
              onChange={handleHeightChange}
              onKeyDown={handleKeyDown}
              min={1}
              max={9999}
            />
          </div>

          {aspectRatioLocked && (
            <div className="size-controls__aspect-info">
              <span className="size-controls__aspect-ratio">
                Ratio: {formatAspectRatio(aspectRatio)}
              </span>
            </div>
          )}
        </div>

        <div className="size-controls__actions">
          <button
            type="button"
            className="size-controls__action-button"
            onClick={handleSwapDimensions}
            title="Swap width and height"
          >
            ↔️ Swap
          </button>

          <button
            type="button"
            className="size-controls__action-button"
            onClick={handleResetToSquare}
            title="Make square (largest dimension)"
          >
            ⬜ Square
          </button>
        </div>
      </div>

      <div className="size-controls__hints">
        <div className="size-controls__hint">
          <span className="size-controls__hint-key">Ctrl+Shift+↑↓←→</span>
          <span className="size-controls__hint-desc">Resize with keyboard</span>
        </div>
        <div className="size-controls__hint">
          <span className="size-controls__hint-key">+ Alt</span>
          <span className="size-controls__hint-desc">Fine adjustment (1px)</span>
        </div>
      </div>
    </div>
  );
};