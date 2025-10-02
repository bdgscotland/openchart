/**
 * Creates a network diagram example
 */
export function createNetworkDiagramExample() {
  const nodes = [
    {
      id: 'internet-node',
      type: 'circle',
      position: { x: 100, y: 100 },
      data: {
        label: 'Internet',
        width: 100,
        height: 100,
        style: {
          fill: '#E0E0E0',
          stroke: '#666666',
          strokeWidth: 2,
        },
        layerId: 'default',
        zIndex: 0,
      },
    },
    {
      id: 'router-node',
      type: 'rectangle',
      position: { x: 300, y: 80 },
      data: {
        label: 'Router',
        width: 120,
        height: 80,
        style: {
          fill: '#FFA500',
          stroke: '#000000',
          strokeWidth: 2,
        },
        layerId: 'default',
        zIndex: 0,
      },
    },
    {
      id: 'switch-node',
      type: 'rectangle',
      position: { x: 500, y: 80 },
      data: {
        label: 'Switch',
        width: 120,
        height: 80,
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
      id: 'web-server-node',
      type: 'rectangle',
      position: { x: 450, y: 250 },
      data: {
        label: 'Web Server',
        width: 100,
        height: 120,
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
      id: 'db-server-node',
      type: 'rectangle',
      position: { x: 570, y: 250 },
      data: {
        label: 'DB Server',
        width: 100,
        height: 120,
        style: {
          fill: '#DDA0DD',
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
      source: 'internet-node',
      target: 'router-node',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#000000', strokeWidth: 2 },
      data: { layerId: 'default' },
    },
    {
      id: 'edge-2',
      source: 'router-node',
      target: 'switch-node',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#000000', strokeWidth: 2 },
      data: { layerId: 'default' },
    },
    {
      id: 'edge-3',
      source: 'switch-node',
      target: 'web-server-node',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#000000', strokeWidth: 2 },
      data: { layerId: 'default' },
    },
    {
      id: 'edge-4',
      source: 'switch-node',
      target: 'db-server-node',
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
