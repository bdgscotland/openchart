import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConnectionTools from './ConnectionTools';
import { DEFAULT_EDGE_STYLE } from '../../types/edgeTypes';

// Mock the CSS import
jest.mock('./ConnectionTools.css', () => ({}));

describe('ConnectionTools', () => {
  const mockProps = {
    selectedTool: 'straight-solid',
    onToolSelect: jest.fn(),
    onStyleChange: jest.fn(),
    currentStyle: DEFAULT_EDGE_STYLE,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders connection tools correctly', () => {
    render(<ConnectionTools {...mockProps} />);

    expect(screen.getByText('Connection Tools')).toBeInTheDocument();
    expect(screen.getByText('Straight Line')).toBeInTheDocument();
    expect(screen.getByText('Curved Connection')).toBeInTheDocument();
    expect(screen.getByText('Dashed Line')).toBeInTheDocument();
  });

  it('handles tool selection', () => {
    render(<ConnectionTools {...mockProps} />);

    const curvedTool = screen.getByText('Curved Connection');
    fireEvent.click(curvedTool);

    expect(mockProps.onToolSelect).toHaveBeenCalledWith('curved-smooth');
    expect(mockProps.onStyleChange).toHaveBeenCalled();
  });

  it('shows style panel when style button is clicked', () => {
    render(<ConnectionTools {...mockProps} />);

    const styleButton = screen.getByTitle('Style Options');
    fireEvent.click(styleButton);

    expect(screen.getByText('Thickness')).toBeInTheDocument();
    expect(screen.getByText('Line Style')).toBeInTheDocument();
  });

  it('shows color picker when color button is clicked', () => {
    render(<ConnectionTools {...mockProps} />);

    const colorButton = screen.getByTitle('Color Options');
    fireEvent.click(colorButton);

    expect(screen.getByText('Color Presets')).toBeInTheDocument();
    expect(screen.getByText('Custom Color')).toBeInTheDocument();
  });

  it('renders in collapsed mode', () => {
    render(<ConnectionTools {...mockProps} isCollapsed={true} />);

    // In collapsed mode, should show buttons but not full descriptions
    expect(screen.queryByText('Connection Tools')).not.toBeInTheDocument();
    expect(screen.queryByText('Simple straight connection')).not.toBeInTheDocument();

    // Should have tool buttons
    const toolButtons = screen.getAllByRole('button');
    expect(toolButtons.length).toBeGreaterThan(0);
  });

  it('updates style when slider changes', () => {
    render(<ConnectionTools {...mockProps} />);

    // Open style panel
    const styleButton = screen.getByTitle('Style Options');
    fireEvent.click(styleButton);

    // Find thickness slider and change value
    const thicknessSlider = screen.getByDisplayValue('2'); // Default stroke width
    fireEvent.change(thicknessSlider, { target: { value: '4' } });

    expect(mockProps.onStyleChange).toHaveBeenCalledWith({
      ...DEFAULT_EDGE_STYLE,
      strokeWidth: 4
    });
  });

  it('updates style when dropdown changes', () => {
    render(<ConnectionTools {...mockProps} />);

    // Open style panel
    const styleButton = screen.getByTitle('Style Options');
    fireEvent.click(styleButton);

    // Find line style dropdown and change value
    const lineStyleSelect = screen.getByDisplayValue('solid');
    fireEvent.change(lineStyleSelect, { target: { value: 'dashed' } });

    expect(mockProps.onStyleChange).toHaveBeenCalledWith({
      ...DEFAULT_EDGE_STYLE,
      lineStyle: 'dashed'
    });
  });
});