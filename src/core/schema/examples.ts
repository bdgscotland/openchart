import { createNewDiagram, createRectangle, createCircle, createDiamond, createConnection, addElementToDiagram, addConnectionToDiagram } from './diagram-factory';
import type { DiagramSchema } from '../../types/diagram';

/**
 * Creates a simple flowchart example
 */
export function createSimpleFlowchartExample(): DiagramSchema {
  let diagram = createNewDiagram('Simple Process Flow');

  // Create start node
  const startNode = createCircle(
    { x: 100, y: 100 }, 
    { width: 120, height: 120 }, 
    'Start',
    { fill: '#90EE90' }
  );

  // Create process node
  const processNode = createRectangle(
    { x: 300, y: 80 }, 
    { width: 180, height: 100 }, 
    'Process Data',
    { fill: '#87CEEB' }
  );

  // Create decision node
  const decisionNode = createDiamond(
    { x: 550, y: 60 }, 
    { width: 140, height: 140 }, 
    'Valid?',
    { fill: '#FFB6C1' }
  );

  // Create end node
  const endNode = createCircle(
    { x: 750, y: 100 }, 
    { width: 120, height: 120 }, 
    'End',
    { fill: '#F0E68C' }
  );

  // Add elements to diagram
  diagram = addElementToDiagram(diagram, startNode);
  diagram = addElementToDiagram(diagram, processNode);
  diagram = addElementToDiagram(diagram, decisionNode);
  diagram = addElementToDiagram(diagram, endNode);

  // Create connections
  const conn1 = createConnection(startNode.id, processNode.id, 'right', 'left');
  const conn2 = createConnection(processNode.id, decisionNode.id, 'right', 'left');
  const conn3 = createConnection(decisionNode.id, endNode.id, 'right', 'left');

  diagram = addConnectionToDiagram(diagram, conn1);
  diagram = addConnectionToDiagram(diagram, conn2);
  diagram = addConnectionToDiagram(diagram, conn3);

  return diagram;
}

/**
 * Creates a basic organizational chart example
 */
export function createOrgChartExample(): DiagramSchema {
  let diagram = createNewDiagram('Organization Chart');

  // CEO
  const ceo = createRectangle(
    { x: 400, y: 50 }, 
    { width: 160, height: 80 }, 
    'CEO',
    { fill: '#FFD700' }
  );

  // Department heads
  const cto = createRectangle(
    { x: 200, y: 200 }, 
    { width: 140, height: 80 }, 
    'CTO',
    { fill: '#87CEEB' }
  );

  const cfo = createRectangle(
    { x: 400, y: 200 }, 
    { width: 140, height: 80 }, 
    'CFO',
    { fill: '#87CEEB' }
  );

  const cmo = createRectangle(
    { x: 600, y: 200 }, 
    { width: 140, height: 80 }, 
    'CMO',
    { fill: '#87CEEB' }
  );

  // Add elements
  diagram = addElementToDiagram(diagram, ceo);
  diagram = addElementToDiagram(diagram, cto);
  diagram = addElementToDiagram(diagram, cfo);
  diagram = addElementToDiagram(diagram, cmo);

  // Create connections
  const conn1 = createConnection(ceo.id, cto.id, 'bottom', 'top');
  const conn2 = createConnection(ceo.id, cfo.id, 'bottom', 'top');
  const conn3 = createConnection(ceo.id, cmo.id, 'bottom', 'top');

  diagram = addConnectionToDiagram(diagram, conn1);
  diagram = addConnectionToDiagram(diagram, conn2);
  diagram = addConnectionToDiagram(diagram, conn3);

  return diagram;
}

/**
 * Creates a network diagram example
 */
export function createNetworkDiagramExample(): DiagramSchema {
  let diagram = createNewDiagram('Network Architecture');

  // Internet cloud
  const internet = createCircle(
    { x: 100, y: 100 }, 
    { width: 100, height: 100 }, 
    'Internet',
    { fill: '#E0E0E0', stroke: '#666666' }
  );

  // Router
  const router = createRectangle(
    { x: 300, y: 80 }, 
    { width: 120, height: 80 }, 
    'Router',
    { fill: '#FFA500' }
  );

  // Switch
  const switch1 = createRectangle(
    { x: 500, y: 80 }, 
    { width: 120, height: 80 }, 
    'Switch',
    { fill: '#90EE90' }
  );

  // Servers
  const server1 = createRectangle(
    { x: 450, y: 250 }, 
    { width: 100, height: 120 }, 
    'Web Server',
    { fill: '#87CEEB' }
  );

  const server2 = createRectangle(
    { x: 570, y: 250 }, 
    { width: 100, height: 120 }, 
    'DB Server',
    { fill: '#DDA0DD' }
  );

  // Add elements
  diagram = addElementToDiagram(diagram, internet);
  diagram = addElementToDiagram(diagram, router);
  diagram = addElementToDiagram(diagram, switch1);
  diagram = addElementToDiagram(diagram, server1);
  diagram = addElementToDiagram(diagram, server2);

  // Create connections
  const conn1 = createConnection(internet.id, router.id, 'right', 'left');
  const conn2 = createConnection(router.id, switch1.id, 'right', 'left');
  const conn3 = createConnection(switch1.id, server1.id, 'bottom', 'top');
  const conn4 = createConnection(switch1.id, server2.id, 'bottom', 'top');

  diagram = addConnectionToDiagram(diagram, conn1);
  diagram = addConnectionToDiagram(diagram, conn2);
  diagram = addConnectionToDiagram(diagram, conn3);
  diagram = addConnectionToDiagram(diagram, conn4);

  return diagram;
}

/**
 * Gets all example diagrams
 */
export function getAllExamples(): Array<{ name: string; diagram: DiagramSchema }> {
  return [
    { name: 'Simple Flowchart', diagram: createSimpleFlowchartExample() },
    { name: 'Organization Chart', diagram: createOrgChartExample() },
    { name: 'Network Diagram', diagram: createNetworkDiagramExample() },
  ];
}