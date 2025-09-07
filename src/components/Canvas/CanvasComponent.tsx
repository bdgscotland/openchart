import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Text, Line, Group } from 'react-konva';
import type Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import type { 
  DiagramSchema, 
  DiagramElement, 
  RectangleElement, 
  CircleElement, 
  DiamondElement 
} from '../../types/diagram';
import './Canvas.css';

interface CanvasComponentProps {
  diagram: DiagramSchema;
  selectedElementIds: string[];
  onElementSelect: (elementId: string, isMultiSelect: boolean) => void;
  onElementMove: (elementId: string, newPosition: { x: number; y: number }) => void;
  onElementResize: (elementId: string, newSize: { width: number; height: number }) => void;
  onCanvasClick: (position: { x: number; y: number }) => void;
  width?: number;
  height?: number;
}

export const CanvasComponent: React.FC<CanvasComponentProps> = ({
  diagram,
  selectedElementIds,
  onElementSelect,
  onElementMove,
  onElementResize,
  onCanvasClick,
  width = 1920,
  height = 1080,
}) => {
  const stageRef = useRef<Konva.Stage>(null);
  const [scale, setScale] = useState(diagram.canvas.zoom || 1);
  const [isPanning, setIsPanning] = useState(false);
  const [lastCenter, setLastCenter] = useState<{ x: number; y: number } | null>(null);
  
  // Handle canvas click (deselect or add element)
  const handleStageClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
    // If clicked on empty area
    if (e.target === e.target.getStage()) {
      const pos = e.target.getStage()?.getPointerPosition();
      if (pos) {
        onCanvasClick({ x: pos.x / scale, y: pos.y / scale });
      }
    }
  }, [onCanvasClick, scale]);

  // Handle element selection
  const handleElementClick = useCallback((elementId: string, e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    const isMultiSelect = e.evt.ctrlKey || e.evt.metaKey;
    onElementSelect(elementId, isMultiSelect);
  }, [onElementSelect]);

  // Handle element dragging
  const handleElementDragEnd = useCallback((elementId: string, e: KonvaEventObject<DragEvent>) => {
    const node = e.target;
    onElementMove(elementId, {
      x: node.x(),
      y: node.y(),
    });
  }, [onElementMove]);

  // Handle zoom with mouse wheel
  const handleWheel = useCallback((e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    if (!stage) return;

    const scaleBy = 1.1;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    let direction = e.evt.deltaY > 0 ? -1 : 1;
    // When using trackpad, deltaY values can be very small
    if (e.evt.ctrlKey) {
      direction = -direction;
    }

    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.max(0.1, Math.min(3, newScale));
    
    setScale(clampedScale);
    stage.scale({ x: clampedScale, y: clampedScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };
    stage.position(newPos);
  }, []);

  // Handle panning with mouse drag
  const handleMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
    // Only start panning if clicking on stage (empty area) and not dragging an element
    if (e.target === e.target.getStage()) {
      setIsPanning(true);
      const pos = e.target.getStage()?.getPointerPosition();
      if (pos) {
        setLastCenter(pos);
      }
    }
  }, []);

  const handleMouseMove = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (!isPanning || !lastCenter) return;
    
    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const dx = pointer.x - lastCenter.x;
    const dy = pointer.y - lastCenter.y;

    const newPos = {
      x: stage.x() + dx,
      y: stage.y() + dy,
    };

    stage.position(newPos);
    setLastCenter(pointer);
  }, [isPanning, lastCenter]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setLastCenter(null);
  }, []);

  // Enhanced rectangle rendering with premium effects
  const renderRectangle = (element: RectangleElement) => {
    const isSelected = selectedElementIds.includes(element.id);
    const [isHovered, setIsHovered] = useState(false);
    
    const baseStroke = element.style.stroke || '#ffffff';
    const baseFill = element.style.fill || 'rgba(255, 255, 255, 0.05)';
    
    return (
      <React.Fragment key={element.id}>
        {/* Premium shadow effect */}
        <Rect
          x={element.position.x + 2}
          y={element.position.y + 2}
          width={element.size.width}
          height={element.size.height}
          fill="rgba(0, 0, 0, 0.2)"
          cornerRadius={element.style.cornerRadius || 8}
          opacity={isSelected || isHovered ? 0.4 : 0.2}
          listening={false}
          blur={6}
        />
        
        {/* Main rectangle with premium styling */}
        <Rect
          id={element.id}
          x={element.position.x}
          y={element.position.y}
          width={element.size.width}
          height={element.size.height}
          fill={isSelected ? 'rgba(0, 212, 255, 0.1)' : baseFill}
          stroke={isSelected ? '#00d4ff' : (isHovered ? '#8b5cf6' : baseStroke)}
          strokeWidth={isSelected ? 3 : (isHovered ? 2.5 : (element.style.strokeWidth || 2))}
          cornerRadius={element.style.cornerRadius || 8}
          opacity={element.style.opacity || (isHovered ? 0.9 : 0.8)}
          draggable={!element.locked}
          shadowColor={isSelected ? 'rgba(0, 212, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)'}
          shadowBlur={isSelected ? 15 : (isHovered ? 8 : 0)}
          shadowOpacity={isSelected ? 0.8 : (isHovered ? 0.6 : 0)}
          onClick={(e) => handleElementClick(element.id, e)}
          onDragEnd={(e) => handleElementDragEnd(element.id, e)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        />
        
        {/* Premium selection glow */}
        {isSelected && (
          <Rect
            x={element.position.x - 2}
            y={element.position.y - 2}
            width={element.size.width + 4}
            height={element.size.height + 4}
            fill="transparent"
            stroke="#00d4ff"
            strokeWidth={1}
            cornerRadius={(element.style.cornerRadius || 8) + 2}
            opacity={0.6}
            listening={false}
            dash={[8, 4]}
            strokeScaleEnabled={false}
          />
        )}
        
        {/* Enhanced text rendering */}
        {element.text && (
          <Text
            x={element.position.x}
            y={element.position.y + element.size.height / 2 - 7}
            width={element.size.width}
            height={element.size.height}
            text={element.text}
            fontSize={element.style.fontSize || 14}
            fontFamily={element.style.fontFamily || 'Inter, sans-serif'}
            fontStyle={element.style.fontStyle || 'normal'}
            fill={isSelected ? '#ffffff' : (element.style.textColor || '#ffffff')}
            align={element.style.textAlign || 'center'}
            verticalAlign="middle"
            listening={false}
            shadowColor="rgba(0, 0, 0, 0.5)"
            shadowBlur={2}
            shadowOpacity={0.8}
          />
        )}
      </React.Fragment>
    );
  };

  // Enhanced circle rendering with premium effects
  const renderCircle = (element: CircleElement) => {
    const isSelected = selectedElementIds.includes(element.id);
    const [isHovered, setIsHovered] = useState(false);
    const radius = Math.min(element.size.width, element.size.height) / 2;
    
    const baseStroke = element.style.stroke || '#ffffff';
    const baseFill = element.style.fill || 'rgba(255, 255, 255, 0.05)';
    
    return (
      <React.Fragment key={element.id}>
        {/* Premium shadow effect */}
        <Circle
          x={element.position.x + element.size.width / 2 + 2}
          y={element.position.y + element.size.height / 2 + 2}
          radius={radius}
          fill="rgba(0, 0, 0, 0.2)"
          opacity={isSelected || isHovered ? 0.4 : 0.2}
          listening={false}
          blur={6}
        />
        
        {/* Main circle with premium styling */}
        <Circle
          id={element.id}
          x={element.position.x + element.size.width / 2}
          y={element.position.y + element.size.height / 2}
          radius={radius}
          fill={isSelected ? 'rgba(0, 212, 255, 0.1)' : baseFill}
          stroke={isSelected ? '#00d4ff' : (isHovered ? '#8b5cf6' : baseStroke)}
          strokeWidth={isSelected ? 3 : (isHovered ? 2.5 : (element.style.strokeWidth || 2))}
          opacity={element.style.opacity || (isHovered ? 0.9 : 0.8)}
          draggable={!element.locked}
          shadowColor={isSelected ? 'rgba(0, 212, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)'}
          shadowBlur={isSelected ? 15 : (isHovered ? 8 : 0)}
          shadowOpacity={isSelected ? 0.8 : (isHovered ? 0.6 : 0)}
          onClick={(e) => handleElementClick(element.id, e)}
          onDragEnd={(e) => {
            const node = e.target;
            onElementMove(element.id, {
              x: node.x() - element.size.width / 2,
              y: node.y() - element.size.height / 2,
            });
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        />
        
        {/* Premium selection glow */}
        {isSelected && (
          <Circle
            x={element.position.x + element.size.width / 2}
            y={element.position.y + element.size.height / 2}
            radius={radius + 2}
            fill="transparent"
            stroke="#00d4ff"
            strokeWidth={1}
            opacity={0.6}
            listening={false}
            dash={[8, 4]}
            strokeScaleEnabled={false}
          />
        )}
        
        {/* Enhanced text rendering */}
        {element.text && (
          <Text
            x={element.position.x}
            y={element.position.y + element.size.height / 2 - 7}
            width={element.size.width}
            height={element.size.height}
            text={element.text}
            fontSize={element.style.fontSize || 14}
            fontFamily={element.style.fontFamily || 'Inter, sans-serif'}
            fontStyle={element.style.fontStyle || 'normal'}
            fill={isSelected ? '#ffffff' : (element.style.textColor || '#ffffff')}
            align={element.style.textAlign || 'center'}
            verticalAlign="middle"
            listening={false}
            shadowColor="rgba(0, 0, 0, 0.5)"
            shadowBlur={2}
            shadowOpacity={0.8}
          />
        )}
      </React.Fragment>
    );
  };

  // Enhanced diamond rendering with premium effects
  const renderDiamond = (element: DiamondElement) => {
    const isSelected = selectedElementIds.includes(element.id);
    const [isHovered, setIsHovered] = useState(false);
    
    const baseStroke = element.style.stroke || '#ffffff';
    const baseFill = element.style.fill || 'rgba(255, 255, 255, 0.05)';
    
    return (
      <React.Fragment key={element.id}>
        {/* Premium shadow effect */}
        <Rect
          x={element.position.x + element.size.width / 2 + 2}
          y={element.position.y + element.size.height / 2 + 2}
          width={element.size.width * 0.7}
          height={element.size.height * 0.7}
          offsetX={element.size.width * 0.35}
          offsetY={element.size.height * 0.35}
          rotation={45}
          fill="rgba(0, 0, 0, 0.2)"
          opacity={isSelected || isHovered ? 0.4 : 0.2}
          listening={false}
          blur={6}
        />
        
        {/* Main diamond with premium styling */}
        <Rect
          id={element.id}
          x={element.position.x + element.size.width / 2}
          y={element.position.y + element.size.height / 2}
          width={element.size.width * 0.7}
          height={element.size.height * 0.7}
          offsetX={element.size.width * 0.35}
          offsetY={element.size.height * 0.35}
          rotation={45}
          fill={isSelected ? 'rgba(0, 212, 255, 0.1)' : baseFill}
          stroke={isSelected ? '#00d4ff' : (isHovered ? '#8b5cf6' : baseStroke)}
          strokeWidth={isSelected ? 3 : (isHovered ? 2.5 : (element.style.strokeWidth || 2))}
          opacity={element.style.opacity || (isHovered ? 0.9 : 0.8)}
          draggable={!element.locked}
          shadowColor={isSelected ? 'rgba(0, 212, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)'}
          shadowBlur={isSelected ? 15 : (isHovered ? 8 : 0)}
          shadowOpacity={isSelected ? 0.8 : (isHovered ? 0.6 : 0)}
          onClick={(e) => handleElementClick(element.id, e)}
          onDragEnd={(e) => {
            const node = e.target;
            onElementMove(element.id, {
              x: node.x() - element.size.width / 2,
              y: node.y() - element.size.height / 2,
            });
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        />
        
        {/* Premium selection glow */}
        {isSelected && (
          <Rect
            x={element.position.x + element.size.width / 2}
            y={element.position.y + element.size.height / 2}
            width={element.size.width * 0.75}
            height={element.size.height * 0.75}
            offsetX={element.size.width * 0.375}
            offsetY={element.size.height * 0.375}
            rotation={45}
            fill="transparent"
            stroke="#00d4ff"
            strokeWidth={1}
            opacity={0.6}
            listening={false}
            dash={[8, 4]}
            strokeScaleEnabled={false}
          />
        )}
        
        {/* Enhanced text rendering */}
        {element.text && (
          <Text
            x={element.position.x}
            y={element.position.y + element.size.height / 2 - 7}
            width={element.size.width}
            height={element.size.height}
            text={element.text}
            fontSize={element.style.fontSize || 14}
            fontFamily={element.style.fontFamily || 'Inter, sans-serif'}
            fontStyle={element.style.fontStyle || 'normal'}
            fill={isSelected ? '#ffffff' : (element.style.textColor || '#ffffff')}
            align={element.style.textAlign || 'center'}
            verticalAlign="middle"
            listening={false}
            shadowColor="rgba(0, 0, 0, 0.5)"
            shadowBlur={2}
            shadowOpacity={0.8}
          />
        )}
      </React.Fragment>
    );
  };

  // Render elements based on type
  const renderElement = (element: DiagramElement) => {
    if (!element.visible) return null;

    switch (element.type) {
      case 'rectangle':
        return renderRectangle(element as RectangleElement);
      case 'circle':
        return renderCircle(element as CircleElement);
      case 'diamond':
        return renderDiamond(element as DiamondElement);
      default:
        console.warn(`Unknown element type: ${(element as any).type}`);
        return null;
    }
  };

  // Sort elements by z-index
  const sortedElements = [...diagram.elements].sort(
    (a, b) => (a.zIndex || 1) - (b.zIndex || 1)
  );

  // Enhanced grid rendering function
  const renderPremiumGrid = () => {
    const gridSize = 24;
    const lines = [];
    const stageWidth = width / scale;
    const stageHeight = height / scale;

    // Vertical lines
    for (let i = 0; i < stageWidth; i += gridSize) {
      lines.push(
        <Line
          key={`v${i}`}
          points={[i, 0, i, stageHeight]}
          stroke="rgba(0, 212, 255, 0.25)"
          strokeWidth={1}
          opacity={0.8}
          listening={false}
        />
      );
    }

    // Horizontal lines  
    for (let i = 0; i < stageHeight; i += gridSize) {
      lines.push(
        <Line
          key={`h${i}`}
          points={[0, i, stageWidth, i]}
          stroke="rgba(0, 212, 255, 0.25)"
          strokeWidth={1}
          opacity={0.8}
          listening={false}
        />
      );
    }

    return lines;
  };

  return (
    <div className="premium-canvas-container">
      <div className="konva-stage-container">
        <Stage
          ref={stageRef}
          width={width}
          height={height}
          onWheel={handleWheel}
          onClick={handleStageClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          scaleX={scale}
          scaleY={scale}
          style={{ 
            backgroundColor: 'transparent',
            cursor: isPanning ? 'grabbing' : 'default'
          }}
        >
          {/* Grid Layer - Behind all elements */}
          <Layer>
            {diagram.canvas.grid && renderPremiumGrid()}
          </Layer>
          
          {/* Main Content Layer */}
          <Layer>
            {/* Render all diagram elements */}
            {sortedElements.map(renderElement)}
          </Layer>
          
          {/* Selection/UI Layer - Above all elements */}
          <Layer>
            {/* Future: Selection rectangles, handles, etc. */}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};