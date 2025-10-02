/**
 * Creates a simple flowchart example
 */
export function createSimpleFlowchartExample() {
  const nodes = [
    {
      id: 'start-node',
      type: 'shape',
      position: { x: 100, y: 100 },
      data: {
        label: 'Start',
        shape: 'circle',
        width: 120,
        height: 120,
        style: {
          fill: '#90EE90',
          stroke: '#000000',
          strokeWidth: 2,
        },
        layerId: 'default',
        zIndex: 0,
      },
    },
    {
      id: 'process-node',
      type: 'shape',
      position: { x: 300, y: 80 },
      data: {
        label: 'Process Data',
        shape: 'rectangle',
        width: 180,
        height: 100,
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
      id: 'decision-node',
      type: 'shape',
      position: { x: 550, y: 60 },
      data: {
        label: 'Valid?',
        shape: 'diamond',
        width: 140,
        height: 140,
        style: {
          fill: '#FFB6C1',
          stroke: '#000000',
          strokeWidth: 2,
        },
        layerId: 'default',
        zIndex: 0,
      },
    },
    {
      id: 'end-node',
      type: 'shape',
      position: { x: 750, y: 100 },
      data: {
        label: 'End',
        shape: 'circle',
        width: 120,
        height: 120,
        style: {
          fill: '#F0E68C',
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
      source: 'start-node',
      target: 'process-node',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#000000', strokeWidth: 2 },
      data: { layerId: 'default' },
    },
    {
      id: 'edge-2',
      source: 'process-node',
      target: 'decision-node',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#000000', strokeWidth: 2 },
      data: { layerId: 'default' },
    },
    {
      id: 'edge-3',
      source: 'decision-node',
      target: 'end-node',
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
