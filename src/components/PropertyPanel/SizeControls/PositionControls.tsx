import React, { useCallback, useState, useEffect } from 'react';
import type { PositionControlsProps, Position } from './types';
import './PositionControls.css';

export const PositionControls: React.FC<PositionControlsProps> = ({
  position,
  isMultiSelection,
  onPositionChange,
  onKeyDown
}) => {
  const [inputX, setInputX] = useState(position.x.toString());
  const [inputY, setInputY] = useState(position.y.toString());
  const [isEditingX, setIsEditingX] = useState(false);
  const [isEditingY, setIsEditingY] = useState(false);

  // Update input values when position prop changes
  useEffect(() => {
    if (!isEditingX) {
      setInputX(Math.round(position.x).toString());
    }
  }, [position.x, isEditingX]);

  useEffect(() => {
    if (!isEditingY) {
      setInputY(Math.round(position.y).toString());
    }
  }, [position.y, isEditingY]);

  const handleXChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputX(value);

    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onPositionChange({ ...position, x: numValue });
    }
  }, [position, onPositionChange]);

  const handleYChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputY(value);

    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onPositionChange({ ...position, y: numValue });
    }
  }, [position, onPositionChange]);

  const handleXBlur = useCallback(() => {
    setIsEditingX(false);
    const numValue = parseFloat(inputX);
    if (isNaN(numValue)) {
      setInputX(Math.round(position.x).toString());
    } else {
      onPositionChange({ ...position, x: numValue });
    }
  }, [inputX, position, onPositionChange]);

  const handleYBlur = useCallback(() => {
    setIsEditingY(false);
    const numValue = parseFloat(inputY);
    if (isNaN(numValue)) {
      setInputY(Math.round(position.y).toString());
    } else {
      onPositionChange({ ...position, y: numValue });
    }
  }, [inputY, position, onPositionChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const isXInput = target.getAttribute('data-axis') === 'x';
    const currentValue = isXInput ? parseFloat(inputX) || position.x : parseFloat(inputY) || position.y;

    // Handle arrow keys for movement
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();

      const increment = e.shiftKey ? 10 : e.altKey ? 0.5 : 1;
      let newPosition = { ...position };

      switch (e.key) {
        case 'ArrowUp':
          newPosition.y = position.y - increment;
          break;
        case 'ArrowDown':
          newPosition.y = position.y + increment;
          break;
        case 'ArrowLeft':
          newPosition.x = position.x - increment;
          break;
        case 'ArrowRight':
          newPosition.x = position.x + increment;
          break;
      }

      onPositionChange(newPosition);

      // Update input values
      setInputX(Math.round(newPosition.x).toString());
      setInputY(Math.round(newPosition.y).toString());
    }

    // Handle steppers with + and -
    else if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      const increment = e.shiftKey ? 10 : 1;
      const newValue = currentValue + increment;

      if (isXInput) {
        setInputX(newValue.toString());
        onPositionChange({ ...position, x: newValue });
      } else {
        setInputY(newValue.toString());
        onPositionChange({ ...position, y: newValue });
      }
    }
    else if (e.key === '-') {
      e.preventDefault();
      const increment = e.shiftKey ? 10 : 1;
      const newValue = currentValue - increment;

      if (isXInput) {
        setInputX(newValue.toString());
        onPositionChange({ ...position, x: newValue });
      } else {
        setInputY(newValue.toString());
        onPositionChange({ ...position, y: newValue });
      }
    }

    // Handle Enter and Escape
    if (e.key === 'Enter') {
      target.blur();
    } else if (e.key === 'Escape') {
      if (isXInput) {
        setInputX(Math.round(position.x).toString());
      } else {
        setInputY(Math.round(position.y).toString());
      }
      target.blur();
    }

    // Pass through to parent
    onKeyDown?.(e);
  }, [inputX, inputY, position, onPositionChange, onKeyDown]);

  const handleCenterHorizontally = useCallback(() => {
    // Center at x=0 (assuming this is relative to canvas center)
    onPositionChange({ ...position, x: 0 });
  }, [position, onPositionChange]);

  const handleCenterVertically = useCallback(() => {
    // Center at y=0 (assuming this is relative to canvas center)
    onPositionChange({ ...position, y: 0 });
  }, [position, onPositionChange]);

  const handleResetPosition = useCallback(() => {
    onPositionChange({ x: 0, y: 0 });
  }, [onPositionChange]);

  const handleStepperClick = useCallback((axis: 'x' | 'y', direction: 'up' | 'down') => {
    const increment = 1;
    const currentValue = axis === 'x' ? position.x : position.y;
    const newValue = direction === 'up' ? currentValue + increment : currentValue - increment;

    const newPosition = {
      ...position,
      [axis]: newValue
    };

    onPositionChange(newPosition);
  }, [position, onPositionChange]);

  return (
    <div className="position-controls">
      <div className="position-controls__header">
        <h4 className="position-controls__title">Position</h4>
        {isMultiSelection && (
          <span className="position-controls__multi-note">Relative movement</span>
        )}
      </div>

      <div className="position-controls__inputs">
        <div className="position-controls__input-group">
          <label className="position-controls__label">X</label>
          <div className="position-controls__input-wrapper">
            <input
              type="number"
              value={inputX}
              onChange={handleXChange}
              onBlur={handleXBlur}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsEditingX(true)}
              className="position-controls__input"
              data-axis="x"
              step="0.1"
            />
            <div className="position-controls__steppers">
              <button
                type="button"
                className="position-controls__stepper position-controls__stepper--up"
                onClick={() => handleStepperClick('x', 'up')}
                tabIndex={-1}
              >
                ▲
              </button>
              <button
                type="button"
                className="position-controls__stepper position-controls__stepper--down"
                onClick={() => handleStepperClick('x', 'down')}
                tabIndex={-1}
              >
                ▼
              </button>
            </div>
          </div>
        </div>

        <div className="position-controls__input-group">
          <label className="position-controls__label">Y</label>
          <div className="position-controls__input-wrapper">
            <input
              type="number"
              value={inputY}
              onChange={handleYChange}
              onBlur={handleYBlur}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsEditingY(true)}
              className="position-controls__input"
              data-axis="y"
              step="0.1"
            />
            <div className="position-controls__steppers">
              <button
                type="button"
                className="position-controls__stepper position-controls__stepper--up"
                onClick={() => handleStepperClick('y', 'up')}
                tabIndex={-1}
              >
                ▲
              </button>
              <button
                type="button"
                className="position-controls__stepper position-controls__stepper--down"
                onClick={() => handleStepperClick('y', 'down')}
                tabIndex={-1}
              >
                ▼
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="position-controls__actions">
        <button
          type="button"
          className="position-controls__action-button"
          onClick={handleCenterHorizontally}
          title="Center horizontally"
        >
          ↔️ Center H
        </button>

        <button
          type="button"
          className="position-controls__action-button"
          onClick={handleCenterVertically}
          title="Center vertically"
        >
          ↕️ Center V
        </button>

        <button
          type="button"
          className="position-controls__action-button"
          onClick={handleResetPosition}
          title="Reset to origin (0, 0)"
        >
          🎯 Reset
        </button>
      </div>

      <div className="position-controls__hints">
        <div className="position-controls__hint">
          <span className="position-controls__hint-key">↑↓←→</span>
          <span className="position-controls__hint-desc">Move 1px</span>
        </div>
        <div className="position-controls__hint">
          <span className="position-controls__hint-key">Shift + ↑↓←→</span>
          <span className="position-controls__hint-desc">Move 10px</span>
        </div>
        <div className="position-controls__hint">
          <span className="position-controls__hint-key">Alt + ↑↓←→</span>
          <span className="position-controls__hint-desc">Move 0.5px</span>
        </div>
      </div>
    </div>
  );
};