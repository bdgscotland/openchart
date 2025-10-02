/**
 * User Registration Event Storm Example
 * Demonstrates user registration and email verification flow
 */
export function createEventStormRegistrationExample() {
  const nodes = [
    {
      id: 'event-1',
      type: 'es-event',
      position: { x: 100, y: 100 },
      data: {
        label: 'Registration Started',
        stickyType: 'event',
        color: '#FFB84D',
        phase: 'big-picture',
        zIndex: 0,
        layerId: 'default'
      }
    },
    {
      id: 'event-2',
      type: 'es-event',
      position: { x: 500, y: 100 },
      data: {
        label: 'Email Verified',
        stickyType: 'event',
        color: '#FFB84D',
        phase: 'big-picture',
        zIndex: 0,
        layerId: 'default'
      }
    },
    {
      id: 'event-3',
      type: 'es-event',
      position: { x: 900, y: 100 },
      data: {
        label: 'Account Created',
        stickyType: 'event',
        color: '#FFB84D',
        phase: 'big-picture',
        zIndex: 0,
        layerId: 'default'
      }
    },
    {
      id: 'actor-1',
      type: 'es-actor',
      position: { x: 100, y: 280 },
      data: {
        label: 'New User',
        stickyType: 'actor',
        color: '#FFE066',
        phase: 'big-picture',
        zIndex: 0,
        layerId: 'default'
      }
    },
    {
      id: 'command-1',
      type: 'es-command',
      position: { x: 300, y: 100 },
      data: {
        label: 'Verify Email',
        stickyType: 'command',
        color: '#6DB3F2',
        phase: 'process-modeling',
        zIndex: 0,
        layerId: 'default'
      }
    },
    {
      id: 'command-2',
      type: 'es-command',
      position: { x: 700, y: 100 },
      data: {
        label: 'Create Account',
        stickyType: 'command',
        color: '#6DB3F2',
        phase: 'process-modeling',
        zIndex: 0,
        layerId: 'default'
      }
    },
    {
      id: 'question-1',
      type: 'es-question',
      position: { x: 500, y: 280 },
      data: {
        label: 'What if email verification fails?',
        stickyType: 'question',
        color: '#CC99FF',
        phase: 'big-picture',
        zIndex: 0,
        layerId: 'default'
      }
    }
  ];

  const edges = [
    {
      id: 'edge-1',
      source: 'event-1',
      target: 'command-1',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#FFB84D', strokeWidth: 2 },
      data: { layerId: 'default' }
    },
    {
      id: 'edge-2',
      source: 'command-1',
      target: 'event-2',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#FFB84D', strokeWidth: 2 },
      data: { layerId: 'default' }
    },
    {
      id: 'edge-3',
      source: 'event-2',
      target: 'command-2',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#FFB84D', strokeWidth: 2 },
      data: { layerId: 'default' }
    },
    {
      id: 'edge-4',
      source: 'command-2',
      target: 'event-3',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#FFB84D', strokeWidth: 2 },
      data: { layerId: 'default' }
    }
  ];

  return {
    nodes,
    edges,
    viewport: { x: 0, y: 0, zoom: 0.9 },
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    layers: [
      {
        id: 'default',
        name: 'Default Layer',
        visible: true,
        locked: false,
        opacity: 1
      }
    ],
    activeLayerId: 'default',
    diagramSettings: {
      mode: 'eventStorm',
      grid: {
        enabled: true,
        size: 20,
        style: 'dots',
        color: '#e0e0e0',
        opacity: 0.5,
        snapToGrid: true,
        snapDistance: 10
      },
      background: {
        color: '#ffffff',
        opacity: 1.0,
        repeat: 'no-repeat',
        size: 'auto'
      },
      viewport: {
        zoom: 0.9,
        minZoom: 0.1,
        maxZoom: 5.0,
        panEnabled: true,
        zoomEnabled: true,
        infiniteCanvas: true
      },
      rulers: {
        enabled: false,
        units: 'px',
        showGuides: true,
        guidesColor: '#4a90e2'
      },
      uiPanels: {
        formatPanel: true,
        outlinePanel: false,
        layersPanel: false,
        shapesPanel: true,
        searchShapes: false,
        scratchpad: false,
        tags: false
      },
      display: {
        tooltips: true,
        animations: true,
        guides: true,
        pageTabs: false,
        pageView: true
      },
      connectionVisualization: {
        connectionArrows: true,
        connectionPoints: false
      },
      paper: {
        size: 'Custom',
        orientation: 'landscape',
        width: 1920,
        height: 1080,
        margins: { top: 50, right: 50, bottom: 50, left: 50 }
      },
      view: {
        fullscreen: false,
        units: 'px',
        scale: 100
      },
      eventStormSettings: {
        phase: 'big-picture',
        showTimeline: true,
        autoArrangeEnabled: false,
        timelineOrientation: 'horizontal',
        showTimestamps: false,
        showAggregateNames: true,
        groupByAggregate: false,
        groupByBoundedContext: false,
        validationEnabled: true,
        strictMode: false,
        workshopMode: false,
        participantCursors: false
      }
    }
  };
}
