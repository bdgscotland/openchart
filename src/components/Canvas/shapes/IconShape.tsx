import React from 'react';
import { icons, Heart } from 'lucide-react';
import BaseShape, { type BaseShapeProps } from './BaseShape';

export const IconShape: React.FC<BaseShapeProps> = (props) => {
  const { data } = props;

  // Get icon name from data.iconName or fallback to 'Heart'
  const iconName = data.iconName || 'Heart';

  // Dynamically get the icon component from Lucide
  const IconComponent = icons[iconName as keyof typeof icons];

  // Fallback to Heart icon if the specified icon doesn't exist
  const DisplayIcon = IconComponent || Heart;

  // Get size from data (maintaining aspect ratio)
  const size = Math.min(data.width || 48, data.height || 48);

  // Get color and stroke width from style
  const iconColor = data.style?.stroke || data.borderColor || '#000000';
  const strokeWidth = data.style?.strokeWidth || 2;

  return (
    <BaseShape
      {...props}
      shapeConfig={{
        borderRadius: '4px',
        backgroundColor: 'transparent',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <DisplayIcon
          size={size * 0.7} // Scale icon to 70% of container for padding
          strokeWidth={strokeWidth}
          color={iconColor}
          style={{
            opacity: data.style?.opacity || 1,
          }}
        />
      </div>
    </BaseShape>
  );
};

export default IconShape;
