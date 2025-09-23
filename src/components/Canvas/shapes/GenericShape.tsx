import React from 'react';
import { BaseShape } from './BaseShape';
import type { ShapeComponentProps } from './BaseShape';

// Generic shape component that can render different types based on shapeType
export const GenericShape: React.FC<ShapeComponentProps & { shapeType: string }> = (props) => {
  const { width = 120, height = 80, shapeType } = props;

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
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
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
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
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
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="0"
              y1={height * 0.2}
              x2={width}
              y2={height * 0.2}
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1={width * 0.2}
              y1="0"
              x2={width * 0.2}
              y2={height}
              stroke="currentColor"
              strokeWidth="2"
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
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
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
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
          />
        );
      }

      case 'cloud':
        // Cloud shape using circles
        return (
          <g>
            <circle cx={width * 0.2} cy={height * 0.7} r={height * 0.3} fill="currentColor" stroke="currentColor" strokeWidth="2" />
            <circle cx={width * 0.5} cy={height * 0.8} r={height * 0.35} fill="currentColor" stroke="currentColor" strokeWidth="2" />
            <circle cx={width * 0.8} cy={height * 0.7} r={height * 0.3} fill="currentColor" stroke="currentColor" strokeWidth="2" />
            <circle cx={width * 0.35} cy={height * 0.4} r={height * 0.25} fill="currentColor" stroke="currentColor" strokeWidth="2" />
            <circle cx={width * 0.65} cy={height * 0.4} r={height * 0.25} fill="currentColor" stroke="currentColor" strokeWidth="2" />
          </g>
        );

      case 'cylinder': {
        // Database cylinder
        const ellipseRy = height * 0.15;
        return (
          <g>
            <ellipse cx={width / 2} cy={ellipseRy} rx={width / 2} ry={ellipseRy} fill="currentColor" stroke="currentColor" strokeWidth="2" />
            <rect x="0" y={ellipseRy} width={width} height={height - 2 * ellipseRy} fill="currentColor" stroke="none" />
            <line x1="0" y1={ellipseRy} x2="0" y2={height - ellipseRy} stroke="currentColor" strokeWidth="2" />
            <line x1={width} y1={ellipseRy} x2={width} y2={height - ellipseRy} stroke="currentColor" strokeWidth="2" />
            <ellipse cx={width / 2} cy={height - ellipseRy} rx={width / 2} ry={ellipseRy} fill="currentColor" stroke="currentColor" strokeWidth="2" />
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

      // Default fallback for unknown shapes
      default:
        return (
          <rect
            x="0"
            y="0"
            width={width}
            height={height}
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
            rx="4"
            ry="4"
          />
        );
    }
  };

  return (
    <BaseShape {...props}>
      {renderShape()}
    </BaseShape>
  );
};