import React from 'react';
import { PropertyPanelDemo } from '../demo/PropertyPanelDemo';

export const DemoPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh' }}>
      <PropertyPanelDemo />
    </div>
  );
};

export default DemoPage;