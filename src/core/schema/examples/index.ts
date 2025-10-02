/**
 * Example Diagram Factory
 * Central registry for all example diagrams (Event Storm and Diagram mode)
 */

// Event Storm Examples
import { createEventStormEcommerceExample } from './eventStormEcommerce';
import { createEventStormRegistrationExample } from './eventStormRegistration';

// Diagram Mode Examples
import { createSimpleFlowchartExample } from './flowchart';
import { createOrgChartExample } from './orgchart';
import { createNetworkDiagramExample } from './network';

/**
 * Gets an example diagram by name
 * @param exampleName - The unique identifier for the example
 * @returns The example diagram data, or null if not found
 */
export function getExampleByName(exampleName: string) {
  switch (exampleName) {
    // Event Storm Examples
    case 'event-storm-ecommerce':
      return createEventStormEcommerceExample();
    case 'event-storm-registration':
      return createEventStormRegistrationExample();
    case 'event-storm-payment':
    case 'event-storm-shipping':
    case 'event-storm-inventory':
      // TODO: Create dedicated examples for these
      // For now, return ecommerce as a fallback
      return createEventStormEcommerceExample();

    // Diagram Mode Examples
    case 'flowchart':
      return createSimpleFlowchartExample();
    case 'orgchart':
      return createOrgChartExample();
    case 'network':
      return createNetworkDiagramExample();
    case 'process':
    case 'mindmap':
      // TODO: Create examples for these
      console.warn(`Example "${exampleName}" not yet implemented`);
      return null;

    default:
      console.warn(`Unknown example: "${exampleName}"`);
      return null;
  }
}

/**
 * Gets all Event Storm examples
 */
export function getAllEventStormExamples() {
  return [
    { name: 'event-storm-ecommerce', label: 'E-Commerce Order Flow', create: createEventStormEcommerceExample },
    { name: 'event-storm-registration', label: 'User Registration', create: createEventStormRegistrationExample },
  ];
}

/**
 * Gets all Diagram mode examples
 */
export function getAllDiagramExamples() {
  return [
    { name: 'flowchart', label: 'Basic Flowchart' },
    { name: 'orgchart', label: 'Org Chart' },
    { name: 'process', label: 'Process Flow' },
    { name: 'mindmap', label: 'Mind Map' },
    { name: 'network', label: 'Network Diagram' },
  ];
}
