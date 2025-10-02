import { v4 as uuidv4 } from 'uuid';
import type {
  DiagramSchema,
  DiagramElement,
  RectangleElement,
  CircleElement,
  DiamondElement,
  ArrowElement,
  TextElement,
  IconElement,
  Connection,
  Point,
  Size,
  ElementStyle,
} from '../../types/diagram';

import {
  DEFAULT_CANVAS_CONFIG,
  DEFAULT_ELEMENT_STYLE,
  DEFAULT_CONNECTION_STYLE,
} from '../../types/diagram';

/**
 * Creates a new empty diagram with default configuration
 */
export function createNewDiagram(title?: string): DiagramSchema {
  const now = new Date().toISOString();
  
  return {
    version: '1.0.0',
    type: 'diagram',
    metadata: {
      id: uuidv4(),
      created: now,
      modified: now,
      title: title || 'Untitled Diagram',
    },
    canvas: { ...DEFAULT_CANVAS_CONFIG },
    elements: [],
    connections: [],
  };
}

/**
 * Creates a new rectangle element
 */
export function createRectangle(
  position: Point,
  size: Size,
  text?: string,
  style?: Partial<ElementStyle>
): RectangleElement {
  return {
    id: uuidv4(),
    type: 'rectangle',
    position,
    size,
    text,
    style: { ...DEFAULT_ELEMENT_STYLE, ...style },
    visible: true,
    zIndex: 1,
  };
}

/**
 * Creates a new circle element
 */
export function createCircle(
  position: Point,
  size: Size,
  text?: string,
  style?: Partial<ElementStyle>
): CircleElement {
  return {
    id: uuidv4(),
    type: 'circle',
    position,
    size,
    text,
    style: { ...DEFAULT_ELEMENT_STYLE, ...style },
    visible: true,
    zIndex: 1,
  };
}

/**
 * Creates a new diamond element
 */
export function createDiamond(
  position: Point,
  size: Size,
  text?: string,
  style?: Partial<ElementStyle>
): DiamondElement {
  return {
    id: uuidv4(),
    type: 'diamond',
    position,
    size,
    text,
    style: { ...DEFAULT_ELEMENT_STYLE, ...style },
    visible: true,
    zIndex: 1,
  };
}

/**
 * Creates a new arrow element
 */
export function createArrow(
  position: Point,
  size: Size,
  direction: 'up' | 'down' | 'left' | 'right' = 'right',
  style?: Partial<ElementStyle>
): ArrowElement {
  return {
    id: uuidv4(),
    type: 'arrow',
    position,
    size,
    direction,
    style: { ...DEFAULT_ELEMENT_STYLE, ...style },
    visible: true,
    zIndex: 1,
  };
}

/**
 * Creates a new text element
 */
export function createTextElement(
  position: Point,
  size: Size,
  text: string,
  style?: Partial<ElementStyle>
): TextElement {
  return {
    id: uuidv4(),
    type: 'text',
    position,
    size,
    text,
    style: { ...DEFAULT_ELEMENT_STYLE, ...style },
    visible: true,
    zIndex: 1,
  };
}


/**
 * Creates a new icon element
 */
export function createIcon(
  position: Point,
  iconName: string,
  size?: Size,
  style?: Partial<ElementStyle>
): IconElement {
  return {
    id: uuidv4(),
    type: 'icon',
    position,
    size: size || { width: 48, height: 48 },
    iconName,
    style: {
      fill: 'none',
      stroke: style?.stroke || '#000000',
      strokeWidth: style?.strokeWidth || 2,
      opacity: style?.opacity || 1,
      ...style,
    },
    visible: true,
    zIndex: 1,
  };
}

/**
 * Creates a new connection between two elements
 */
export function createConnection(
  fromElementId: string,
  toElementId: string,
  fromAnchor: 'top' | 'bottom' | 'left' | 'right' | 'center' = 'center',
  toAnchor: 'top' | 'bottom' | 'left' | 'right' | 'center' = 'center',
  connectionType: 'straight' | 'curved' | 'stepped' = 'straight'
): Connection {
  return {
    id: uuidv4(),
    from: {
      elementId: fromElementId,
      anchor: fromAnchor,
    },
    to: {
      elementId: toElementId,
      anchor: toAnchor,
    },
    type: connectionType,
    style: { ...DEFAULT_CONNECTION_STYLE },
  };
}

/**
 * Updates the modified timestamp of a diagram
 */
export function updateDiagramTimestamp(diagram: DiagramSchema): DiagramSchema {
  return {
    ...diagram,
    metadata: {
      ...diagram.metadata,
      modified: new Date().toISOString(),
    },
  };
}

/**
 * Adds an element to a diagram
 */
export function addElementToDiagram(
  diagram: DiagramSchema,
  element: DiagramElement
): DiagramSchema {
  return updateDiagramTimestamp({
    ...diagram,
    elements: [...diagram.elements, element],
  });
}

/**
 * Removes an element from a diagram and its associated connections
 */
export function removeElementFromDiagram(
  diagram: DiagramSchema,
  elementId: string
): DiagramSchema {
  return updateDiagramTimestamp({
    ...diagram,
    elements: diagram.elements.filter(el => el.id !== elementId),
    connections: diagram.connections.filter(
      conn => conn.from.elementId !== elementId && conn.to.elementId !== elementId
    ),
  });
}

/**
 * Adds a connection to a diagram
 */
export function addConnectionToDiagram(
  diagram: DiagramSchema,
  connection: Connection
): DiagramSchema {
  return updateDiagramTimestamp({
    ...diagram,
    connections: [...diagram.connections, connection],
  });
}

/**
 * Removes a connection from a diagram
 */
export function removeConnectionFromDiagram(
  diagram: DiagramSchema,
  connectionId: string
): DiagramSchema {
  return updateDiagramTimestamp({
    ...diagram,
    connections: diagram.connections.filter(conn => conn.id !== connectionId),
  });
}