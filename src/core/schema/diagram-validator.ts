import type { DiagramSchema, DiagramElement, Connection } from '../../types/diagram';

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validates a diagram schema
 */
export function validateDiagramSchema(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  // Check if data exists
  if (!data) {
    return { isValid: false, errors: [{ field: 'root', message: 'Diagram data is required' }] };
  }

  // Validate version
  if (!data.version || typeof data.version !== 'string') {
    errors.push({ field: 'version', message: 'Version is required and must be a string', value: data.version });
  }

  // Validate type
  if (data.type !== 'diagram') {
    errors.push({ field: 'type', message: 'Type must be "diagram"', value: data.type });
  }

  // Validate metadata
  if (!data.metadata) {
    errors.push({ field: 'metadata', message: 'Metadata is required' });
  } else {
    validateMetadata(data.metadata, errors);
  }

  // Validate canvas
  if (!data.canvas) {
    errors.push({ field: 'canvas', message: 'Canvas configuration is required' });
  } else {
    validateCanvas(data.canvas, errors);
  }

  // Validate elements
  if (!Array.isArray(data.elements)) {
    errors.push({ field: 'elements', message: 'Elements must be an array' });
  } else {
    data.elements.forEach((element: any, index: number) => {
      validateElement(element, index, errors);
    });
  }

  // Validate connections
  if (!Array.isArray(data.connections)) {
    errors.push({ field: 'connections', message: 'Connections must be an array' });
  } else {
    data.connections.forEach((connection: any, index: number) => {
      validateConnection(connection, index, data.elements || [], errors);
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function validateMetadata(metadata: any, errors: ValidationError[]): void {
  if (!metadata.id || typeof metadata.id !== 'string') {
    errors.push({ field: 'metadata.id', message: 'ID is required and must be a string' });
  }

  if (!metadata.created || typeof metadata.created !== 'string') {
    errors.push({ field: 'metadata.created', message: 'Created timestamp is required and must be a string' });
  } else if (!isValidISODate(metadata.created)) {
    errors.push({ field: 'metadata.created', message: 'Created must be a valid ISO-8601 date' });
  }

  if (!metadata.modified || typeof metadata.modified !== 'string') {
    errors.push({ field: 'metadata.modified', message: 'Modified timestamp is required and must be a string' });
  } else if (!isValidISODate(metadata.modified)) {
    errors.push({ field: 'metadata.modified', message: 'Modified must be a valid ISO-8601 date' });
  }
}

function validateCanvas(canvas: any, errors: ValidationError[]): void {
  if (typeof canvas.width !== 'number' || canvas.width <= 0) {
    errors.push({ field: 'canvas.width', message: 'Width must be a positive number' });
  }

  if (typeof canvas.height !== 'number' || canvas.height <= 0) {
    errors.push({ field: 'canvas.height', message: 'Height must be a positive number' });
  }

  if (typeof canvas.grid !== 'boolean') {
    errors.push({ field: 'canvas.grid', message: 'Grid must be a boolean' });
  }
}

function validateElement(element: any, index: number, errors: ValidationError[]): void {
  const prefix = `elements[${index}]`;

  if (!element.id || typeof element.id !== 'string') {
    errors.push({ field: `${prefix}.id`, message: 'Element ID is required and must be a string' });
  }

  const validTypes = ['rectangle', 'circle', 'diamond', 'arrow', 'text'];
  if (!validTypes.includes(element.type)) {
    errors.push({ 
      field: `${prefix}.type`, 
      message: `Element type must be one of: ${validTypes.join(', ')}`,
      value: element.type 
    });
  }

  // Validate position
  if (!element.position || typeof element.position !== 'object') {
    errors.push({ field: `${prefix}.position`, message: 'Position is required and must be an object' });
  } else {
    if (typeof element.position.x !== 'number') {
      errors.push({ field: `${prefix}.position.x`, message: 'Position X must be a number' });
    }
    if (typeof element.position.y !== 'number') {
      errors.push({ field: `${prefix}.position.y`, message: 'Position Y must be a number' });
    }
  }

  // Validate size
  if (!element.size || typeof element.size !== 'object') {
    errors.push({ field: `${prefix}.size`, message: 'Size is required and must be an object' });
  } else {
    if (typeof element.size.width !== 'number' || element.size.width <= 0) {
      errors.push({ field: `${prefix}.size.width`, message: 'Size width must be a positive number' });
    }
    if (typeof element.size.height !== 'number' || element.size.height <= 0) {
      errors.push({ field: `${prefix}.size.height`, message: 'Size height must be a positive number' });
    }
  }

  // Validate style (optional but if present, must be valid)
  if (element.style && typeof element.style !== 'object') {
    errors.push({ field: `${prefix}.style`, message: 'Style must be an object' });
  }
}

function validateConnection(connection: any, index: number, elements: any[], errors: ValidationError[]): void {
  const prefix = `connections[${index}]`;

  if (!connection.id || typeof connection.id !== 'string') {
    errors.push({ field: `${prefix}.id`, message: 'Connection ID is required and must be a string' });
  }

  // Validate from connection point
  if (!connection.from || typeof connection.from !== 'object') {
    errors.push({ field: `${prefix}.from`, message: 'From connection point is required' });
  } else {
    validateConnectionPoint(connection.from, `${prefix}.from`, elements, errors);
  }

  // Validate to connection point
  if (!connection.to || typeof connection.to !== 'object') {
    errors.push({ field: `${prefix}.to`, message: 'To connection point is required' });
  } else {
    validateConnectionPoint(connection.to, `${prefix}.to`, elements, errors);
  }

  // Validate connection type
  const validTypes = ['straight', 'curved', 'stepped'];
  if (!validTypes.includes(connection.type)) {
    errors.push({ 
      field: `${prefix}.type`, 
      message: `Connection type must be one of: ${validTypes.join(', ')}`,
      value: connection.type 
    });
  }
}

function validateConnectionPoint(point: any, prefix: string, elements: any[], errors: ValidationError[]): void {
  if (!point.elementId || typeof point.elementId !== 'string') {
    errors.push({ field: `${prefix}.elementId`, message: 'Element ID is required and must be a string' });
  } else {
    // Check if referenced element exists
    const elementExists = elements.some(el => el.id === point.elementId);
    if (!elementExists) {
      errors.push({ 
        field: `${prefix}.elementId`, 
        message: 'Referenced element does not exist',
        value: point.elementId 
      });
    }
  }

  const validAnchors = ['top', 'bottom', 'left', 'right', 'center'];
  if (!validAnchors.includes(point.anchor)) {
    errors.push({ 
      field: `${prefix}.anchor`, 
      message: `Anchor must be one of: ${validAnchors.join(', ')}`,
      value: point.anchor 
    });
  }
}

function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime()) && dateString === date.toISOString();
}

/**
 * Checks if a diagram has duplicate element IDs
 */
export function checkForDuplicateIds(diagram: DiagramSchema): string[] {
  const elementIds = new Set<string>();
  const connectionIds = new Set<string>();
  const duplicates: string[] = [];

  // Check element IDs
  diagram.elements.forEach(element => {
    if (elementIds.has(element.id)) {
      duplicates.push(`Duplicate element ID: ${element.id}`);
    } else {
      elementIds.add(element.id);
    }
  });

  // Check connection IDs
  diagram.connections.forEach(connection => {
    if (connectionIds.has(connection.id)) {
      duplicates.push(`Duplicate connection ID: ${connection.id}`);
    } else {
      connectionIds.add(connection.id);
    }
  });

  return duplicates;
}

/**
 * Finds orphaned connections (connections referencing non-existent elements)
 */
export function findOrphanedConnections(diagram: DiagramSchema): string[] {
  const elementIds = new Set(diagram.elements.map(el => el.id));
  const orphaned: string[] = [];

  diagram.connections.forEach(connection => {
    if (!elementIds.has(connection.from.elementId)) {
      orphaned.push(`Connection ${connection.id} references non-existent element: ${connection.from.elementId}`);
    }
    if (!elementIds.has(connection.to.elementId)) {
      orphaned.push(`Connection ${connection.id} references non-existent element: ${connection.to.elementId}`);
    }
  });

  return orphaned;
}