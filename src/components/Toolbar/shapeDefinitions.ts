// Comprehensive Shape Definitions for OpenChart Shape Library
import {
  // Basic shapes
  MousePointer2, Square, Circle, Triangle, Diamond, Pentagon, Hexagon, Star, Minus, Plus, X, Type, Heart, MoreHorizontal, Smile,
  // Flowchart shapes
  RectangleHorizontal, Octagon, Cylinder, FileText, File, Settings, Database, Monitor, Clock, Zap as LogicGate,
  // Arrows and connectors
  ArrowRight, ArrowLeftRight, RotateCcw, MoveRight, ArrowUpDown, Zap, CornerDownLeft, MessageSquareQuote,
  // UML shapes
  Box, Users, User, Package, FileCode, MessageSquare, GitBranch, Component,
  // Entity Relation shapes
  Database as DbEntity, Link, Key, Layers,
  // General shapes
  Cloud, Shield, MessageCircle, Flag, Bookmark, AlertTriangle, MessageSquareText
} from 'lucide-react';

import type { ShapeDefinition, ShapeCategory } from '../../types/shapes';

// Basic Shapes Category
const basicShapes: ShapeDefinition[] = [
  {
    id: 'rectangle',
    name: 'Rectangle',
    description: 'Basic rectangular shape',
    icon: Square,
    category: 'basic',
    tags: ['rectangle', 'square', 'box', 'basic'],
    defaultSize: { width: 120, height: 80 }
  },
  {
    id: 'circle',
    name: 'Circle',
    description: 'Perfect circle shape',
    icon: Circle,
    category: 'basic',
    tags: ['circle', 'round', 'oval', 'basic'],
    defaultSize: { width: 80, height: 80 }
  },
  {
    id: 'ellipse',
    name: 'Ellipse',
    description: 'Oval or elliptical shape',
    icon: Circle,
    category: 'basic',
    tags: ['ellipse', 'oval', 'circle', 'basic'],
    defaultSize: { width: 120, height: 60 }
  },
  {
    id: 'triangle',
    name: 'Triangle',
    description: 'Three-sided polygon',
    icon: Triangle,
    category: 'basic',
    tags: ['triangle', 'three', 'polygon', 'basic'],
    defaultSize: { width: 80, height: 80 }
  },
  {
    id: 'diamond',
    name: 'Diamond',
    description: 'Diamond or rhombus shape',
    icon: Diamond,
    category: 'basic',
    tags: ['diamond', 'rhombus', 'decision', 'basic'],
    defaultSize: { width: 80, height: 80 }
  },
  {
    id: 'pentagon',
    name: 'Pentagon',
    description: 'Five-sided polygon',
    icon: Pentagon,
    category: 'basic',
    tags: ['pentagon', 'five', 'polygon', 'basic'],
    defaultSize: { width: 80, height: 80 }
  },
  {
    id: 'hexagon',
    name: 'Hexagon',
    description: 'Six-sided polygon',
    icon: Hexagon,
    category: 'basic',
    tags: ['hexagon', 'six', 'polygon', 'basic'],
    defaultSize: { width: 80, height: 80 }
  },
  {
    id: 'star',
    name: 'Star',
    description: 'Star or asterisk shape',
    icon: Star,
    category: 'basic',
    tags: ['star', 'asterisk', 'point', 'basic'],
    defaultSize: { width: 80, height: 80 }
  },
  {
    id: 'line',
    name: 'Line',
    description: 'Straight line segment',
    icon: Minus,
    category: 'basic',
    tags: ['line', 'straight', 'segment', 'basic'],
    defaultSize: { width: 100, height: 2 }
  },
  {
    id: 'cross',
    name: 'Cross',
    description: 'Plus or cross shape',
    icon: Plus,
    category: 'basic',
    tags: ['cross', 'plus', 'add', 'basic'],
    defaultSize: { width: 60, height: 60 }
  },
  {
    id: 'parallelogram',
    name: 'Parallelogram',
    description: 'Four-sided parallelogram shape',
    icon: MoreHorizontal,
    category: 'basic',
    tags: ['parallelogram', 'four', 'polygon', 'slanted', 'basic'],
    defaultSize: { width: 120, height: 60 }
  },
  {
    id: 'trapezoid',
    name: 'Trapezoid',
    description: 'Four-sided trapezoid shape',
    icon: MoreHorizontal,
    category: 'basic',
    tags: ['trapezoid', 'four', 'polygon', 'slope', 'basic'],
    defaultSize: { width: 120, height: 60 }
  },
  {
    id: 'octagon',
    name: 'Octagon',
    description: 'Eight-sided polygon',
    icon: Octagon,
    category: 'basic',
    tags: ['octagon', 'eight', 'polygon', 'stop', 'basic'],
    defaultSize: { width: 80, height: 80 }
  },
  {
    id: 'heart',
    name: 'Heart',
    description: 'Heart shape for love and favorites',
    icon: Heart,
    category: 'basic',
    tags: ['heart', 'love', 'favorite', 'emotion', 'basic'],
    defaultSize: { width: 80, height: 80 }
  },
  {
    id: 'icon',
    name: 'Icon',
    description: 'Lucide icon shape',
    icon: Smile,
    category: 'basic',
    tags: ['icon', 'lucide', 'symbol', 'emoji', 'basic'],
    defaultSize: { width: 48, height: 48 }
  }
];

// Flowchart Shapes Category
const flowchartShapes: ShapeDefinition[] = [
  {
    id: 'process',
    name: 'Process',
    description: 'Process or operation step',
    icon: RectangleHorizontal,
    category: 'flowchart',
    tags: ['process', 'operation', 'step', 'flowchart'],
    defaultSize: { width: 120, height: 60 }
  },
  {
    id: 'decision',
    name: 'Decision',
    description: 'Decision point or conditional',
    icon: Diamond,
    category: 'flowchart',
    tags: ['decision', 'conditional', 'if', 'flowchart'],
    defaultSize: { width: 100, height: 60 }
  },
  {
    id: 'start-end',
    name: 'Start/End',
    description: 'Start or end terminal',
    icon: Octagon,
    category: 'flowchart',
    tags: ['start', 'end', 'terminal', 'begin', 'flowchart'],
    defaultSize: { width: 100, height: 50 }
  },
  {
    id: 'data',
    name: 'Data',
    description: 'Data input or output',
    icon: FileText,
    category: 'flowchart',
    tags: ['data', 'input', 'output', 'io', 'flowchart'],
    defaultSize: { width: 120, height: 60 }
  },
  {
    id: 'document',
    name: 'Document',
    description: 'Document or report',
    icon: File,
    category: 'flowchart',
    tags: ['document', 'report', 'file', 'flowchart'],
    defaultSize: { width: 100, height: 80 }
  },
  {
    id: 'manual-operation',
    name: 'Manual Operation',
    description: 'Manual operation or process',
    icon: Settings,
    category: 'flowchart',
    tags: ['manual', 'operation', 'process', 'flowchart'],
    defaultSize: { width: 120, height: 60 }
  },
  {
    id: 'preparation',
    name: 'Preparation',
    description: 'Preparation or setup step',
    icon: Hexagon,
    category: 'flowchart',
    tags: ['preparation', 'setup', 'init', 'flowchart'],
    defaultSize: { width: 120, height: 60 }
  },
  {
    id: 'internal-storage',
    name: 'Internal Storage',
    description: 'Internal storage or memory',
    icon: Database,
    category: 'flowchart',
    tags: ['storage', 'memory', 'internal', 'flowchart'],
    defaultSize: { width: 100, height: 60 }
  },
  {
    id: 'display',
    name: 'Display',
    description: 'Display or output device',
    icon: Monitor,
    category: 'flowchart',
    tags: ['display', 'output', 'screen', 'flowchart'],
    defaultSize: { width: 100, height: 80 }
  },
  {
    id: 'delay',
    name: 'Delay',
    description: 'Delay or wait step',
    icon: Clock,
    category: 'flowchart',
    tags: ['delay', 'wait', 'pause', 'time', 'flowchart'],
    defaultSize: { width: 100, height: 60 }
  },
  {
    id: 'or-gate',
    name: 'OR Gate',
    description: 'Logical OR operation',
    icon: LogicGate,
    category: 'flowchart',
    tags: ['or', 'gate', 'logic', 'boolean', 'flowchart'],
    defaultSize: { width: 80, height: 60 }
  },
  {
    id: 'storage-cylinder',
    name: 'Storage Cylinder',
    description: 'Database storage cylinder',
    icon: Cylinder,
    category: 'flowchart',
    tags: ['storage', 'cylinder', 'database', 'disk', 'flowchart'],
    defaultSize: { width: 60, height: 100 }
  }
];

// UML Shapes Category
const umlShapes: ShapeDefinition[] = [
  {
    id: 'class',
    name: 'Class',
    description: 'UML class diagram element',
    icon: Box,
    category: 'uml',
    tags: ['class', 'object', 'uml', 'oop'],
    defaultSize: { width: 120, height: 100 }
  },
  {
    id: 'interface',
    name: 'Interface',
    description: 'UML interface element',
    icon: FileCode,
    category: 'uml',
    tags: ['interface', 'contract', 'uml', 'oop'],
    defaultSize: { width: 120, height: 80 }
  },
  {
    id: 'actor',
    name: 'Actor',
    description: 'UML actor (user or system)',
    icon: User,
    category: 'uml',
    tags: ['actor', 'user', 'system', 'uml'],
    defaultSize: { width: 60, height: 80 }
  },
  {
    id: 'use-case',
    name: 'Use Case',
    description: 'UML use case element',
    icon: Circle,
    category: 'uml',
    tags: ['use case', 'scenario', 'uml'],
    defaultSize: { width: 120, height: 60 }
  },
  {
    id: 'component',
    name: 'Component',
    description: 'UML component element',
    icon: Component,
    category: 'uml',
    tags: ['component', 'module', 'uml'],
    defaultSize: { width: 120, height: 80 }
  },
  {
    id: 'package',
    name: 'Package',
    description: 'UML package or namespace',
    icon: Package,
    category: 'uml',
    tags: ['package', 'namespace', 'folder', 'uml'],
    defaultSize: { width: 140, height: 100 }
  },
  {
    id: 'note',
    name: 'Note',
    description: 'UML note or comment',
    icon: MessageSquare,
    category: 'uml',
    tags: ['note', 'comment', 'annotation', 'uml'],
    defaultSize: { width: 100, height: 60 }
  },
  {
    id: 'lifeline',
    name: 'Lifeline',
    description: 'UML sequence diagram lifeline',
    icon: GitBranch,
    category: 'uml',
    tags: ['lifeline', 'sequence', 'timeline', 'uml'],
    defaultSize: { width: 20, height: 200 }
  }
];

// Arrows & Connectors Category
const arrowShapes: ShapeDefinition[] = [
  {
    id: 'arrow',
    name: 'Arrow',
    description: 'Simple directional arrow',
    icon: ArrowRight,
    category: 'arrows',
    tags: ['arrow', 'direction', 'pointer', 'flow'],
    defaultSize: { width: 80, height: 20 }
  },
  {
    id: 'double-arrow',
    name: 'Double Arrow',
    description: 'Bidirectional arrow',
    icon: ArrowLeftRight,
    category: 'arrows',
    tags: ['double', 'bidirectional', 'both', 'arrow'],
    defaultSize: { width: 80, height: 20 }
  },
  {
    id: 'curved-arrow',
    name: 'Curved Arrow',
    description: 'Curved or bent arrow',
    icon: RotateCcw,
    category: 'arrows',
    tags: ['curved', 'bent', 'turn', 'arrow'],
    defaultSize: { width: 80, height: 60 }
  },
  {
    id: 'block-arrow',
    name: 'Block Arrow',
    description: 'Thick block arrow',
    icon: MoveRight,
    category: 'arrows',
    tags: ['block', 'thick', 'bold', 'arrow'],
    defaultSize: { width: 100, height: 40 }
  },
  {
    id: 'circular-arrow',
    name: 'Circular Arrow',
    description: 'Circular or rotation arrow',
    icon: RotateCcw,
    category: 'arrows',
    tags: ['circular', 'rotation', 'cycle', 'arrow'],
    defaultSize: { width: 60, height: 60 }
  },
  {
    id: 'connector',
    name: 'Connector',
    description: 'Simple line connector',
    icon: Minus,
    category: 'arrows',
    tags: ['connector', 'line', 'connection', 'link'],
    defaultSize: { width: 100, height: 2 }
  },
  {
    id: 'dashed-line',
    name: 'Dashed Line',
    description: 'Dashed or dotted line',
    icon: Minus,
    category: 'arrows',
    tags: ['dashed', 'dotted', 'line', 'connection'],
    defaultSize: { width: 100, height: 2 }
  },
  {
    id: 'callout-arrow',
    name: 'Callout Arrow',
    description: 'Arrow with speech bubble callout',
    icon: MessageSquareQuote,
    category: 'arrows',
    tags: ['callout', 'speech', 'bubble', 'arrow', 'comment'],
    defaultSize: { width: 120, height: 80 }
  },
  {
    id: 'u-turn-arrow',
    name: 'U-Turn Arrow',
    description: 'U-shaped return arrow',
    icon: CornerDownLeft,
    category: 'arrows',
    tags: ['u-turn', 'return', 'loop', 'back', 'arrow'],
    defaultSize: { width: 80, height: 60 }
  },
  {
    id: 'stepped-arrow',
    name: 'Stepped Arrow',
    description: 'Right-angle stepped arrow',
    icon: CornerDownLeft,
    category: 'arrows',
    tags: ['stepped', 'right-angle', 'corner', 'arrow'],
    defaultSize: { width: 100, height: 60 }
  }
];

// Entity Relation Shapes Category
const erShapes: ShapeDefinition[] = [
  {
    id: 'er-entity',
    name: 'Entity',
    description: 'ER diagram entity',
    icon: Square,
    category: 'entity-relation',
    tags: ['entity', 'table', 'database', 'er'],
    defaultSize: { width: 120, height: 80 }
  },
  {
    id: 'weak-entity',
    name: 'Weak Entity',
    description: 'ER diagram weak entity',
    icon: Square,
    category: 'entity-relation',
    tags: ['weak', 'entity', 'dependent', 'er'],
    defaultSize: { width: 120, height: 80 }
  },
  {
    id: 'relationship',
    name: 'Relationship',
    description: 'ER diagram relationship',
    icon: Diamond,
    category: 'entity-relation',
    tags: ['relationship', 'association', 'er'],
    defaultSize: { width: 100, height: 60 }
  },
  {
    id: 'weak-relationship',
    name: 'Weak Relationship',
    description: 'ER diagram weak relationship',
    icon: Diamond,
    category: 'entity-relation',
    tags: ['weak', 'relationship', 'dependent', 'er'],
    defaultSize: { width: 100, height: 60 }
  },
  {
    id: 'attribute',
    name: 'Attribute',
    description: 'ER diagram attribute',
    icon: Circle,
    category: 'entity-relation',
    tags: ['attribute', 'property', 'field', 'er'],
    defaultSize: { width: 80, height: 40 }
  },
  {
    id: 'key-attribute',
    name: 'Key Attribute',
    description: 'ER diagram key attribute',
    icon: Key,
    category: 'entity-relation',
    tags: ['key', 'attribute', 'primary', 'er'],
    defaultSize: { width: 80, height: 40 }
  },
  {
    id: 'multi-valued-attribute',
    name: 'Multi-valued Attribute',
    description: 'ER diagram multi-valued attribute',
    icon: Layers,
    category: 'entity-relation',
    tags: ['multi', 'valued', 'attribute', 'er'],
    defaultSize: { width: 80, height: 40 }
  },
  {
    id: 'identifying-relationship',
    name: 'Identifying Relationship',
    description: 'ER diagram identifying relationship',
    icon: Diamond,
    category: 'entity-relation',
    tags: ['identifying', 'relationship', 'double', 'er'],
    defaultSize: { width: 100, height: 60 }
  },
  {
    id: 'crows-foot',
    name: 'Crow\'s Foot',
    description: 'Crow\'s foot cardinality notation',
    icon: GitBranch,
    category: 'entity-relation',
    tags: ['crows', 'foot', 'cardinality', 'notation', 'er'],
    defaultSize: { width: 40, height: 20 }
  }
];

// Additional general shapes
const generalShapes: ShapeDefinition[] = [
  {
    id: 'text',
    name: 'Text',
    description: 'Text label or annotation',
    icon: Type,
    category: 'general',
    tags: ['text', 'label', 'annotation', 'caption'],
    defaultSize: { width: 100, height: 30 }
  },
  {
    id: 'cloud',
    name: 'Cloud',
    description: 'Cloud shape for networks',
    icon: Cloud,
    category: 'general',
    tags: ['cloud', 'network', 'internet', 'service'],
    defaultSize: { width: 120, height: 80 }
  },
  {
    id: 'cylinder',
    name: 'Cylinder',
    description: 'Database or storage cylinder',
    icon: Cylinder,
    category: 'general',
    tags: ['cylinder', 'database', 'storage', 'disk'],
    defaultSize: { width: 60, height: 100 }
  },
  {
    id: 'shield',
    name: 'Shield',
    description: 'Security or protection shield',
    icon: Shield,
    category: 'general',
    tags: ['shield', 'security', 'protection', 'safe'],
    defaultSize: { width: 60, height: 80 }
  },
  {
    id: 'callout',
    name: 'Callout',
    description: 'Speech bubble or callout',
    icon: MessageCircle,
    category: 'general',
    tags: ['callout', 'speech', 'bubble', 'comment'],
    defaultSize: { width: 120, height: 80 }
  },
  {
    id: 'banner',
    name: 'Banner',
    description: 'Banner or ribbon shape',
    icon: Flag,
    category: 'general',
    tags: ['banner', 'ribbon', 'flag', 'label'],
    defaultSize: { width: 140, height: 40 }
  },
  {
    id: 'warning-triangle',
    name: 'Warning Triangle',
    description: 'Warning or alert triangle',
    icon: AlertTriangle,
    category: 'general',
    tags: ['warning', 'alert', 'caution', 'triangle', 'danger'],
    defaultSize: { width: 80, height: 80 }
  },
  {
    id: 'speech-bubble',
    name: 'Speech Bubble',
    description: 'Speech bubble for conversations',
    icon: MessageSquareText,
    category: 'general',
    tags: ['speech', 'bubble', 'talk', 'conversation', 'chat'],
    defaultSize: { width: 120, height: 80 }
  }
];

// Shape Categories Configuration
export const shapeCategories: ShapeCategory[] = [
  {
    id: 'basic',
    name: 'Basic Shapes',
    description: 'Fundamental geometric shapes',
    icon: Square,
    shapes: basicShapes,
    defaultExpanded: true,
    order: 1
  },
  {
    id: 'flowchart',
    name: 'Flowchart',
    description: 'Process flow diagram elements',
    icon: GitBranch,
    shapes: flowchartShapes,
    defaultExpanded: false,
    order: 2
  },
  {
    id: 'uml',
    name: 'UML',
    description: 'Unified Modeling Language elements',
    icon: Box,
    shapes: umlShapes,
    defaultExpanded: false,
    order: 3
  },
  {
    id: 'arrows',
    name: 'Arrows & Connectors',
    description: 'Directional and connection elements',
    icon: ArrowRight,
    shapes: arrowShapes,
    defaultExpanded: false,
    order: 4
  },
  {
    id: 'entity-relation',
    name: 'Entity Relation',
    description: 'Database modeling elements',
    icon: Database,
    shapes: erShapes,
    defaultExpanded: false,
    order: 5
  },
  {
    id: 'general',
    name: 'General',
    description: 'Additional useful shapes',
    icon: Star,
    shapes: generalShapes,
    defaultExpanded: false,
    order: 6
  }
];

// Export all shapes as a flat array for search functionality
export const allShapes: ShapeDefinition[] = [
  { id: 'select', name: 'Select', description: 'Selection tool', icon: MousePointer2, category: 'tools', tags: ['select', 'pointer', 'cursor'] },
  ...basicShapes,
  ...flowchartShapes,
  ...umlShapes,
  ...arrowShapes,
  ...erShapes,
  ...generalShapes
];

// Helper function to get shape by ID
export const getShapeById = (id: string): ShapeDefinition | undefined => {
  return allShapes.find(shape => shape.id === id);
};

// Helper function to get shapes by category
export const getShapesByCategory = (categoryId: string): ShapeDefinition[] => {
  const category = shapeCategories.find(cat => cat.id === categoryId);
  return category ? category.shapes : [];
};

// Helper function for search functionality
export const searchShapes = (searchTerm: string): ShapeDefinition[] => {
  if (!searchTerm.trim()) return allShapes;

  const term = searchTerm.toLowerCase();
  return allShapes.filter(shape =>
    shape.name.toLowerCase().includes(term) ||
    shape.description?.toLowerCase().includes(term) ||
    shape.tags.some(tag => tag.toLowerCase().includes(term)) ||
    shape.category.toLowerCase().includes(term)
  );
};