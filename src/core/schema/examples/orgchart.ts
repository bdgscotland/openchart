/**
 * Creates a basic organizational chart example
 */
export function createOrgChartExample() {
  const nodes = [
    {
      id: 'ceo-node',
      type: 'rectangle',
      position: { x: 400, y: 50 },
      data: {
        label: 'CEO',
        width: 160,
        height: 80,
        style: {
          fill: '#FFD700',
          stroke: '#000000',
          strokeWidth: 2,
        },
        layerId: 'default',
        zIndex: 0,
      },
    },
    {
      id: 'cto-node',
      type: 'rectangle',
      position: { x: 200, y: 200 },
      data: {
        label: 'CTO',
        width: 140,
        height: 80,
        style: {
          fill: '#87CEEB',
          stroke: '#000000',
          strokeWidth: 2,
        },
        layerId: 'default',
        zIndex: 0,
      },
    },
    {
      id: 'cfo-node',
      type: 'rectangle',
      position: { x: 400, y: 200 },
      data: {
        label: 'CFO',
        width: 140,
        height: 80,
        style: {
          fill: '#87CEEB',
          stroke: '#000000',
          strokeWidth: 2,
        },
        layerId: 'default',
        zIndex: 0,
      },
    },
    {
      id: 'cmo-node',
      type: 'rectangle',
      position: { x: 600, y: 200 },
      data: {
        label: 'CMO',
        width: 140,
        height: 80,
        style: {
          fill: '#87CEEB',
          stroke: '#000000',
          strokeWidth: 2,
        },
        layerId: 'default',
        zIndex: 0,
      },
    },
  ];

  const edges = [
    {
      id: 'edge-1',
      source: 'ceo-node',
      target: 'cto-node',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#000000', strokeWidth: 2 },
      data: { layerId: 'default' },
    },
    {
      id: 'edge-2',
      source: 'ceo-node',
      target: 'cfo-node',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#000000', strokeWidth: 2 },
      data: { layerId: 'default' },
    },
    {
      id: 'edge-3',
      source: 'ceo-node',
      target: 'cmo-node',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#000000', strokeWidth: 2 },
      data: { layerId: 'default' },
    },
  ];

  return {
    nodes,
    edges,
    viewport: { x: 0, y: 0, zoom: 1 },
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    layers: [
      {
        id: 'default',
        name: 'Default Layer',
        visible: true,
        locked: false,
        opacity: 1,
      },
    ],
    activeLayerId: 'default',
  };
}
