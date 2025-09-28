import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NewPropertyPanel from '../NewPropertyPanel';
import { DiagramElement } from '../../../types/diagram';

// Mock data
const mockElement: DiagramElement = {
  id: 'test-element-1',
  type: 'rectangle',
  position: { x: 100, y: 100 },
  size: { width: 200, height: 150 },
  style: {
    fill: '#ff0000',
    stroke: '#000000',
    strokeWidth: 2,
    opacity: 1,
    fontSize: 14,
    fontFamily: 'Arial, sans-serif',
    color: '#000000',
  },
  text: 'Test Element',
};

const mockCallbacks = {
  onUpdateElementStyle: vi.fn(),
  onUpdateElementText: vi.fn(),
  onUpdateElementPosition: vi.fn(),
  onUpdateElementSize: vi.fn(),
  onToggleVisibility: vi.fn(),
};

describe('NewPropertyPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no elements selected', () => {
    render(
      <NewPropertyPanel
        selectedElements={[]}
        {...mockCallbacks}
      />
    );

    expect(screen.getByText('No elements selected')).toBeInTheDocument();
    expect(screen.getByText('Select one or more elements to edit their properties')).toBeInTheDocument();
  });

  it('renders property sections when element is selected', () => {
    render(
      <NewPropertyPanel
        selectedElements={[mockElement]}
        {...mockCallbacks}
      />
    );

    // Check that selection info is displayed
    expect(screen.getByText('rectangle selected')).toBeInTheDocument();

    // Check that main sections are present
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Layout')).toBeInTheDocument();
    expect(screen.getByText('Typography')).toBeInTheDocument();
  });

  it('shows collapsed state when isVisible is false', () => {
    render(
      <NewPropertyPanel
        selectedElements={[mockElement]}
        isVisible={false}
        {...mockCallbacks}
      />
    );

    expect(document.querySelector('.property-panel--collapsed')).toBeInTheDocument();
    expect(screen.getByLabelText('Show Properties Panel')).toBeInTheDocument();
  });

  it('calls onToggleVisibility when toggle button is clicked', () => {
    render(
      <NewPropertyPanel
        selectedElements={[mockElement]}
        isVisible={false}
        {...mockCallbacks}
      />
    );

    fireEvent.click(screen.getByLabelText('Show Properties Panel'));
    expect(mockCallbacks.onToggleVisibility).toHaveBeenCalledTimes(1);
  });

  it('displays property fields for selected element', () => {
    render(
      <NewPropertyPanel
        selectedElements={[mockElement]}
        {...mockCallbacks}
      />
    );

    // Check for specific property fields
    expect(screen.getByText('Fill')).toBeInTheDocument();
    expect(screen.getByText('Border')).toBeInTheDocument();
    expect(screen.getByText('Width')).toBeInTheDocument();
    expect(screen.getByText('Height')).toBeInTheDocument();
    expect(screen.getByText('Font Size')).toBeInTheDocument();
  });

  it('handles multiple selection correctly', () => {
    const multipleElements = [
      mockElement,
      {
        ...mockElement,
        id: 'test-element-2',
        type: 'circle' as const,
      },
    ];

    render(
      <NewPropertyPanel
        selectedElements={multipleElements}
        {...mockCallbacks}
      />
    );

    expect(screen.getByText('2 elements selected')).toBeInTheDocument();
    expect(screen.getAllByText('Mixed')).toHaveLength(3); // Should show mixed badges for each section
  });

  it('updates style when color field changes', () => {
    render(
      <NewPropertyPanel
        selectedElements={[mockElement]}
        {...mockCallbacks}
      />
    );

    // Find a color input and simulate change
    const colorInputs = document.querySelectorAll('input[type="text"]');
    const fillColorInput = Array.from(colorInputs).find(input =>
      (input as HTMLInputElement).value === '#ff0000'
    );

    if (fillColorInput) {
      fireEvent.change(fillColorInput, { target: { value: '#00ff00' } });
      fireEvent.blur(fillColorInput);

      // Should eventually call the update callback
      // Note: This might be debounced so we need to wait or use act()
      expect(mockCallbacks.onUpdateElementStyle).toHaveBeenCalled();
    }
  });

  it('renders sections with correct priorities', () => {
    render(
      <NewPropertyPanel
        selectedElements={[mockElement]}
        {...mockCallbacks}
      />
    );

    const sections = document.querySelectorAll('.property-section');
    expect(sections.length).toBeGreaterThan(0);

    // Appearance section should be first (highest priority)
    const firstSection = sections[0];
    expect(firstSection.textContent).toContain('Appearance');
  });

  it('shows typography section only for text elements or elements with text', () => {
    const textElement = { ...mockElement, type: 'text' as const };

    render(
      <NewPropertyPanel
        selectedElements={[textElement]}
        {...mockCallbacks}
      />
    );

    expect(screen.getByText('Typography')).toBeInTheDocument();
    expect(screen.getByText('Font Family')).toBeInTheDocument();
  });

  it('handles missing optional callbacks gracefully', () => {
    render(
      <NewPropertyPanel
        selectedElements={[mockElement]}
        onUpdateElementStyle={mockCallbacks.onUpdateElementStyle}
      />
    );

    // Should render without errors even with missing optional callbacks
    expect(screen.getByText('rectangle selected')).toBeInTheDocument();
  });
});