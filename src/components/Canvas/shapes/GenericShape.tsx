import React from 'react';
import { BaseShape } from './BaseShape';
import type { BaseShapeProps } from './BaseShape';

// Generic shape component that can render different types based on shapeType
export const GenericShape: React.FC<BaseShapeProps & { shapeType: string }> = (props) => {
  const { data, shapeType } = props;
  const { width = 120, height = 80, style = {} } = data;

  // Get colors from style object or fallback to defaults
  const fillColor = style.fill || data.backgroundColor || '#f0f9ff';
  const strokeColor = style.stroke || data.borderColor || '#d1d5db';
  const strokeWidth = style.strokeWidth || 2;

  const renderShape = () => {
    switch (shapeType) {
      case 'manual-operation': {
        // Trapezoid shape
        const trapezoidSkew = width * 0.15;
        return (
          <path
            d={`M ${trapezoidSkew} 0
               L ${width - trapezoidSkew} 0
               L ${width} ${height}
               L 0 ${height}
               Z`}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      }

      case 'preparation': {
        // Hexagon shape
        const hexSkew = width * 0.2;
        return (
          <path
            d={`M ${hexSkew} 0
               L ${width - hexSkew} 0
               L ${width} ${height / 2}
               L ${width - hexSkew} ${height}
               L ${hexSkew} ${height}
               L 0 ${height / 2}
               Z`}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      }

      case 'internal-storage':
        // Rectangle with internal divider
        return (
          <g>
            <rect
              x="0"
              y="0"
              width={width}
              height={height}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            <line
              x1="0"
              y1={height * 0.2}
              x2={width}
              y2={height * 0.2}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            <line
              x1={width * 0.2}
              y1="0"
              x2={width * 0.2}
              y2={height}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
          </g>
        );

      case 'display': {
        // Curved display shape
        const curve = width * 0.1;
        return (
          <path
            d={`M ${curve} 0
               L ${width - curve} 0
               Q ${width} ${height / 2} ${width - curve} ${height}
               L ${curve} ${height}
               Q 0 ${height / 2} ${curve} 0
               Z`}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      }

      case 'arrow': {
        // Simple arrow
        const arrowHead = height * 2;
        const arrowBody = width - arrowHead;
        const arrowBodyHeight = height * 0.4;
        const centerY = height / 2;
        return (
          <path
            d={`M 0 ${centerY - arrowBodyHeight / 2}
               L ${arrowBody} ${centerY - arrowBodyHeight / 2}
               L ${arrowBody} 0
               L ${width} ${centerY}
               L ${arrowBody} ${height}
               L ${arrowBody} ${centerY + arrowBodyHeight / 2}
               L 0 ${centerY + arrowBodyHeight / 2}
               Z`}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      }

      case 'cloud':
        // Cloud shape using circles
        return (
          <g>
            <circle cx={width * 0.2} cy={height * 0.7} r={height * 0.3} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx={width * 0.5} cy={height * 0.8} r={height * 0.35} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx={width * 0.8} cy={height * 0.7} r={height * 0.3} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx={width * 0.35} cy={height * 0.4} r={height * 0.25} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx={width * 0.65} cy={height * 0.4} r={height * 0.25} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'cylinder': {
        // Database cylinder
        const ellipseRy = height * 0.15;
        return (
          <g>
            <ellipse cx={width / 2} cy={ellipseRy} rx={width / 2} ry={ellipseRy} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="0" y={ellipseRy} width={width} height={height - 2 * ellipseRy} fill={fillColor} stroke="none" />
            <line x1="0" y1={ellipseRy} x2="0" y2={height - ellipseRy} stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1={width} y1={ellipseRy} x2={width} y2={height - ellipseRy} stroke={strokeColor} strokeWidth={strokeWidth} />
            <ellipse cx={width / 2} cy={height - ellipseRy} rx={width / 2} ry={ellipseRy} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );
      }

      case 'text':
        // Just a text container
        return (
          <rect
            x="0"
            y="0"
            width={width}
            height={height}
            fill="transparent"
            stroke="none"
          />
        );

      // New Basic Shapes
      case 'parallelogram': {
        const skew = width * 0.2;
        return (
          <path
            d={`M ${skew} 0
               L ${width} 0
               L ${width - skew} ${height}
               L 0 ${height}
               Z`}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      }

      case 'trapezoid': {
        const topInset = width * 0.15;
        return (
          <path
            d={`M ${topInset} 0
               L ${width - topInset} 0
               L ${width} ${height}
               L 0 ${height}
               Z`}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      }

      case 'octagon': {
        const cut = Math.min(width, height) * 0.3;
        return (
          <path
            d={`M ${cut} 0
               L ${width - cut} 0
               L ${width} ${cut}
               L ${width} ${height - cut}
               L ${width - cut} ${height}
               L ${cut} ${height}
               L 0 ${height - cut}
               L 0 ${cut}
               Z`}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      }

      case 'heart': {
        const heartPath = `M ${width/2} ${height * 0.85}
                          C ${width/2} ${height * 0.85} ${width * 0.05} ${height * 0.5} ${width * 0.05} ${height * 0.3}
                          C ${width * 0.05} ${height * 0.15} ${width * 0.2} ${height * 0.05} ${width * 0.35} ${height * 0.05}
                          C ${width * 0.425} ${height * 0.05} ${width/2} ${height * 0.2} ${width/2} ${height * 0.2}
                          C ${width/2} ${height * 0.2} ${width * 0.575} ${height * 0.05} ${width * 0.65} ${height * 0.05}
                          C ${width * 0.8} ${height * 0.05} ${width * 0.95} ${height * 0.15} ${width * 0.95} ${height * 0.3}
                          C ${width * 0.95} ${height * 0.5} ${width/2} ${height * 0.85} ${width/2} ${height * 0.85} Z`;
        return (
          <path
            d={heartPath}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      }

      // New Flowchart Shapes
      case 'delay': {
        // D-shaped delay symbol
        const radius = height / 2;
        return (
          <path
            d={`M 0 0
               L ${width - radius} 0
               A ${radius} ${radius} 0 0 1 ${width - radius} ${height}
               L 0 ${height}
               Z`}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      }

      case 'or-gate': {
        // Logic OR gate shape
        const curve = width * 0.4;
        return (
          <path
            d={`M 0 0
               Q ${curve} ${height/2} 0 ${height}
               L ${width * 0.6} ${height}
               Q ${width} ${height * 0.7} ${width} ${height/2}
               Q ${width} ${height * 0.3} ${width * 0.6} 0
               Z`}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      }

      case 'storage-cylinder': {
        // Enhanced cylinder for storage
        const ellipseRy = height * 0.12;
        return (
          <g>
            <ellipse cx={width / 2} cy={ellipseRy} rx={width / 2} ry={ellipseRy} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="0" y={ellipseRy} width={width} height={height - 2 * ellipseRy} fill={fillColor} stroke="none" />
            <line x1="0" y1={ellipseRy} x2="0" y2={height - ellipseRy} stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1={width} y1={ellipseRy} x2={width} y2={height - ellipseRy} stroke={strokeColor} strokeWidth={strokeWidth} />
            <ellipse cx={width / 2} cy={height - ellipseRy} rx={width / 2} ry={ellipseRy} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Storage indicator lines */}
            <line x1={width * 0.15} y1={height * 0.3} x2={width * 0.85} y2={height * 0.3} stroke={strokeColor} strokeWidth="1" strokeDasharray="3,3" />
            <line x1={width * 0.15} y1={height * 0.5} x2={width * 0.85} y2={height * 0.5} stroke={strokeColor} strokeWidth="1" strokeDasharray="3,3" />
            <line x1={width * 0.15} y1={height * 0.7} x2={width * 0.85} y2={height * 0.7} stroke={strokeColor} strokeWidth="1" strokeDasharray="3,3" />
          </g>
        );
      }

      // New Arrow Shapes
      case 'callout-arrow': {
        // Arrow with speech bubble
        const arrowWidth = width * 0.6;
        const bubbleHeight = height * 0.7;
        return (
          <g>
            {/* Speech bubble */}
            <ellipse cx={width * 0.3} cy={bubbleHeight/2} rx={width * 0.25} ry={bubbleHeight/2} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Bubble tail */}
            <path d={`M ${width * 0.45} ${bubbleHeight * 0.8} L ${width * 0.55} ${height} L ${width * 0.35} ${bubbleHeight * 0.9} Z`} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Arrow */}
            <path
              d={`M ${width * 0.55} ${height * 0.4}
                 L ${arrowWidth} ${height * 0.4}
                 L ${arrowWidth} ${height * 0.2}
                 L ${width} ${height * 0.5}
                 L ${arrowWidth} ${height * 0.8}
                 L ${arrowWidth} ${height * 0.6}
                 L ${width * 0.55} ${height * 0.6}
                 Z`}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
          </g>
        );
      }

      case 'u-turn-arrow': {
        // U-shaped return arrow
        const strokeWidth = height * 0.15;
        const radius = (width - strokeWidth) / 2;
        return (
          <g>
            {/* U-shaped path */}
            <path
              d={`M ${strokeWidth/2} 0
                 L ${strokeWidth/2} ${height - radius - strokeWidth/2}
                 A ${radius} ${radius} 0 0 0 ${width - strokeWidth/2} ${height - radius - strokeWidth/2}
                 L ${width - strokeWidth/2} ${height * 0.3}`}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            {/* Arrow head */}
            <path
              d={`M ${width - strokeWidth} ${height * 0.15}
                 L ${width - strokeWidth/2} ${height * 0.3}
                 L ${width - strokeWidth * 1.5} ${height * 0.25}
                 Z`}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="1"
            />
          </g>
        );
      }

      case 'stepped-arrow': {
        // Right-angle stepped arrow
        const arrowBodyHeight = height * 0.3;
        const centerY = height / 2;
        const stepX = width * 0.6;
        return (
          <path
            d={`M 0 ${centerY - arrowBodyHeight / 2}
               L ${stepX} ${centerY - arrowBodyHeight / 2}
               L ${stepX} 0
               L ${width} ${centerY}
               L ${stepX} ${height}
               L ${stepX} ${centerY + arrowBodyHeight / 2}
               L 0 ${centerY + arrowBodyHeight / 2}
               Z`}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      }

      // New ER Shapes
      case 'identifying-relationship': {
        // Double diamond for identifying relationship
        const outerPadding = 4;
        return (
          <g>
            {/* Outer diamond */}
            <path
              d={`M ${width/2} 0
                 L ${width} ${height/2}
                 L ${width/2} ${height}
                 L 0 ${height/2}
                 Z`}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {/* Inner diamond */}
            <path
              d={`M ${width/2} ${outerPadding}
                 L ${width - outerPadding} ${height/2}
                 L ${width/2} ${height - outerPadding}
                 L ${outerPadding} ${height/2}
                 Z`}
              fill="transparent"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
          </g>
        );
      }

      case 'crows-foot': {
        // Crow's foot cardinality notation
        return (
          <g>
            <line x1="0" y1={height/2} x2={width * 0.7} y2={height/2} stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1={width * 0.7} y1={height/2} x2={width} y2="0" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1={width * 0.7} y1={height/2} x2={width} y2={height} stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1={width * 0.7} y1={height/2} x2={width * 0.85} y2={height * 0.25} stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1={width * 0.7} y1={height/2} x2={width * 0.85} y2={height * 0.75} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );
      }

      // New General Shapes
      case 'warning-triangle': {
        // Warning triangle with exclamation
        return (
          <g>
            <path
              d={`M ${width/2} 0
                 L ${width} ${height}
                 L 0 ${height}
                 Z`}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {/* Exclamation mark */}
            <line x1={width/2} y1={height * 0.25} x2={width/2} y2={height * 0.65} stroke="white" strokeWidth="3" strokeLinecap="round" />
            <circle cx={width/2} cy={height * 0.8} r="2" fill="white" />
          </g>
        );
      }

      case 'speech-bubble': {
        // Speech bubble with tail
        const bubbleHeight = height * 0.8;
        return (
          <g>
            {/* Main bubble */}
            <rect x="0" y="0" width={width} height={bubbleHeight} rx="8" ry="8" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Bubble tail */}
            <path
              d={`M ${width * 0.2} ${bubbleHeight}
                 L ${width * 0.15} ${height}
                 L ${width * 0.35} ${bubbleHeight}
                 Z`}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
          </g>
        );
      }

      // Default fallback for unknown shapes
      default:
        return (
          <rect
            x="0"
            y="0"
            width={width}
            height={height}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            rx="4"
            ry="4"
          />
        );
    }
  };

  return (
    <BaseShape {...props}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ color: strokeColor }}
      >
        {renderShape()}
      </svg>
    </BaseShape>
  );
};