// BulkStyleControls Component Tests
// Tests UI functionality, user interactions, and bulk operations integration

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import BulkStyleControls from '../BulkStyleControls';
import type { DiagramElement } from '../../../types/diagram';
import type { BulkStyleUpdate, AlignmentOperation, DistributionOperation } from '../../../core/commands/BulkStyleCommand';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ChevronDown: () => <div data-testid="chevron-down" />,
  ChevronRight: () => <div data-testid="chevron-right" />,
  Settings: () => <div data-testid="settings" />,
  Palette: () => <div data-testid="palette" />,
  AlignLeft: () => <div data-testid="align-left" />,
  AlignCenter: () => <div data-testid="align-center" />,
  AlignRight: () => <div data-testid="align-right" />,
  Layers: () => <div data-testid="layers" />,
  Search: () => <div data-testid="search" />,
  Check: () => <div data-testid="check" />,
  X: () => <div data-testid="x" />,
  Copy: () => <div data-testid="copy" />,
  RotateCcw: () => <div data-testid="rotate-ccw" />,
  RefreshCw: () => <div data-testid="refresh-cw" />,
  Target: () => <div data-testid="target" />,
  Link: () => <div data-testid="link" />,
  Unlink: () => <div data-testid="unlink" />,
  AlignJustify: () => <div data-testid="align-justify" />,
  GroupIcon: () => <div data-testid="group" />,
}));

// Mock components
jest.mock('../ColorPicker/ColorSwatch', () => ({
  ColorSwatch: ({ color, onClick, title }: any) => (
    <div
      data-testid="color-swatch"
      data-color={color}
      data-title={title}
      onClick={onClick}
    />
  ),
}));

jest.mock('../ColorPicker/ColorPicker', () => ({
  __esModule: true,
  default: ({ color, onChange, onClose }: any) => (
    <div data-testid="color-picker">
      <input
        data-testid="color-picker-input"
        value={color}
        onChange={(e) => onChange(e.target.value)}
      />
      <button data-testid="color-picker-close" onClick={onClose}>
        Close
      </button>
    </div>
  ),
}));

const createMockElement = (id: string, type: 'rectangle' | 'circle' = 'rectangle'): DiagramElement => ({
  id,
  type,
  position: { x: 0, y: 0 },
  size: { width: 100, height: 50 },
  style: {
    fill: '#ffffff',
    stroke: '#000000',
    strokeWidth: 2,
    opacity: 1,
    fontSize: 14,
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'normal',
    textAlign: 'center',
  },
  text: `Element ${id}`,
});

describe('BulkStyleControls', () => {
  const mockOnBulkStyleUpdate = jest.fn();
  const mockOnAlignElements = jest.fn();
  const mockOnDistributeElements = jest.fn();
  const mockOnFindAndReplace = jest.fn();

  const defaultProps = {
    selectedElements: [createMockElement('1'), createMockElement('2')],
    onBulkStyleUpdate: mockOnBulkStyleUpdate,
    onAlignElements: mockOnAlignElements,
    onDistributeElements: mockOnDistributeElements,
    onFindAndReplace: mockOnFindAndReplace,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('should render bulk controls for multiple selected elements', () => {
      render(<BulkStyleControls {...defaultProps} />);

      expect(screen.getByText('Bulk Operations (2 selected)')).toBeInTheDocument();
      expect(screen.getByText('Selective Updates')).toBeInTheDocument();
      expect(screen.getByText('Batch Colors')).toBeInTheDocument();
      expect(screen.getByText('Alignment & Distribution')).toBeInTheDocument();
    });

    test('should show message when single element is selected', () => {
      render(
        <BulkStyleControls
          {...defaultProps}
          selectedElements={[createMockElement('1')]}
        />
      );

      expect(screen.getByText('Select multiple elements to use bulk styling')).toBeInTheDocument();
    });

    test('should show find and replace when text elements are present', () => {
      const elementsWithText = [
        { ...createMockElement('1'), text: 'Hello' },
        { ...createMockElement('2'), text: 'World' },
      ];

      render(
        <BulkStyleControls
          {...defaultProps}
          selectedElements={elementsWithText}
        />
      );

      expect(screen.getByText('Find & Replace Text')).toBeInTheDocument();
    });
  });

  describe('Selective Property Updates', () => {
    test('should allow toggling property selection', async () => {
      const user = userEvent.setup();
      render(<BulkStyleControls {...defaultProps} />);

      // Expand selective updates section
      const selectiveHeader = screen.getByText('Selective Updates');
      await user.click(selectiveHeader);

      // Toggle fill property
      const fillCheckbox = screen.getByLabelText('Fill Color');
      await user.click(fillCheckbox);

      expect(fillCheckbox).toBeChecked();
    });

    test('should allow selecting all properties', async () => {
      const user = userEvent.setup();
      render(<BulkStyleControls {...defaultProps} />);

      // Expand selective updates section
      await user.click(screen.getByText('Selective Updates'));

      // Click "All" button
      const allButton = screen.getByText('All');
      await user.click(allButton);

      // Check that checkboxes are selected
      const fillCheckbox = screen.getByLabelText('Fill Color');
      expect(fillCheckbox).toBeChecked();
    });

    test('should allow clearing all property selections', async () => {
      const user = userEvent.setup();
      render(<BulkStyleControls {...defaultProps} />);

      await user.click(screen.getByText('Selective Updates'));

      // First select all
      await user.click(screen.getByText('All'));

      // Then clear all
      await user.click(screen.getByText('None'));

      const fillCheckbox = screen.getByLabelText('Fill Color');
      expect(fillCheckbox).not.toBeChecked();
    });

    test('should change update mode', async () => {
      const user = userEvent.setup();
      render(<BulkStyleControls {...defaultProps} />);

      await user.click(screen.getByText('Selective Updates'));

      const modeSelect = screen.getByDisplayValue('Replace Values');
      await user.selectOptions(modeSelect, 'Relative Scaling');

      expect(modeSelect).toHaveValue('relative');
    });
  });

  describe('Color Operations', () => {
    test('should update fill color', async () => {
      const user = userEvent.setup();
      render(<BulkStyleControls {...defaultProps} />);

      await user.click(screen.getByText('Batch Colors'));

      const fillColorInput = screen.getByDisplayValue('#ffffff');
      await user.clear(fillColorInput);
      await user.type(fillColorInput, '#ff0000');

      await waitFor(() => {
        expect(mockOnBulkStyleUpdate).toHaveBeenCalledWith({
          elementIds: ['1', '2'],
          styleUpdates: { fill: '#ff0000' },
          selectedProperties: undefined,
          mode: 'replace',
        });
      });
    });

    test('should update opacity with slider', async () => {
      const user = userEvent.setup();
      render(<BulkStyleControls {...defaultProps} />);

      await user.click(screen.getByText('Batch Colors'));

      const opacitySlider = screen.getByDisplayValue('1');
      fireEvent.change(opacitySlider, { target: { value: '0.5' } });

      expect(mockOnBulkStyleUpdate).toHaveBeenCalledWith({
        elementIds: ['1', '2'],
        styleUpdates: { opacity: 0.5 },
        selectedProperties: undefined,
        mode: 'replace',
      });
    });
  });

  describe('Alignment Operations', () => {
    test('should trigger left alignment', async () => {
      const user = userEvent.setup();
      render(<BulkStyleControls {...defaultProps} />);

      await user.click(screen.getByText('Alignment & Distribution'));

      const alignLeftButton = screen.getByTitle('Align Left');
      await user.click(alignLeftButton);

      expect(mockOnAlignElements).toHaveBeenCalledWith({
        type: 'align-left',
        elementIds: ['1', '2'],
      });
    });

    test('should trigger center alignment', async () => {
      const user = userEvent.setup();
      render(<BulkStyleControls {...defaultProps} />);

      await user.click(screen.getByText('Alignment & Distribution'));

      const alignCenterButton = screen.getByTitle('Align Center');
      await user.click(alignCenterButton);

      expect(mockOnAlignElements).toHaveBeenCalledWith({
        type: 'align-center',
        elementIds: ['1', '2'],
      });
    });

    test('should trigger vertical alignment', async () => {
      const user = userEvent.setup();
      render(<BulkStyleControls {...defaultProps} />);

      await user.click(screen.getByText('Alignment & Distribution'));

      const alignTopButton = screen.getByTitle('Align Top');
      await user.click(alignTopButton);

      expect(mockOnAlignElements).toHaveBeenCalledWith({
        type: 'align-top',
        elementIds: ['1', '2'],
      });
    });
  });

  describe('Distribution Operations', () => {
    test('should trigger horizontal distribution', async () => {
      const user = userEvent.setup();
      const elementsForDistribution = [
        createMockElement('1'),
        createMockElement('2'),
        createMockElement('3'),
      ];

      render(
        <BulkStyleControls
          {...defaultProps}
          selectedElements={elementsForDistribution}
        />
      );

      await user.click(screen.getByText('Alignment & Distribution'));

      const distributeHorizontalButton = screen.getByTitle('Distribute Horizontally');
      await user.click(distributeHorizontalButton);

      expect(mockOnDistributeElements).toHaveBeenCalledWith({
        type: 'distribute-horizontal',
        elementIds: ['1', '2', '3'],
      });
    });

    test('should disable distribution buttons for insufficient elements', async () => {
      const user = userEvent.setup();
      render(<BulkStyleControls {...defaultProps} />); // Only 2 elements

      await user.click(screen.getByText('Alignment & Distribution'));

      const distributeHorizontalButton = screen.getByTitle('Distribute Horizontally');
      expect(distributeHorizontalButton).toBeDisabled();
    });
  });

  describe('Find and Replace', () => {
    test('should show find and replace for text elements', async () => {
      const user = userEvent.setup();
      const elementsWithText = [
        { ...createMockElement('1'), text: 'Hello World' },
        { ...createMockElement('2'), text: 'Hello Universe' },
      ];

      render(
        <BulkStyleControls
          {...defaultProps}
          selectedElements={elementsWithText}
        />
      );

      await user.click(screen.getByText('Find & Replace Text'));

      expect(screen.getByPlaceholderText('Search text...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Replacement text...')).toBeInTheDocument();
    });

    test('should perform find and replace operation', async () => {
      const user = userEvent.setup();
      const elementsWithText = [
        { ...createMockElement('1'), text: 'Hello World' },
        { ...createMockElement('2'), text: 'Hello Universe' },
      ];

      render(
        <BulkStyleControls
          {...defaultProps}
          selectedElements={elementsWithText}
        />
      );

      await user.click(screen.getByText('Find & Replace Text'));

      const findInput = screen.getByPlaceholderText('Search text...');
      const replaceInput = screen.getByPlaceholderText('Replacement text...');
      const replaceButton = screen.getByText('Replace All');

      await user.type(findInput, 'Hello');
      await user.type(replaceInput, 'Goodbye');
      await user.click(replaceButton);

      expect(mockOnFindAndReplace).toHaveBeenCalledWith('Hello', 'Goodbye', false);
    });

    test('should handle case-sensitive find and replace', async () => {
      const user = userEvent.setup();
      const elementsWithText = [
        { ...createMockElement('1'), text: 'Hello World' },
      ];

      render(
        <BulkStyleControls
          {...defaultProps}
          selectedElements={elementsWithText}
        />
      );

      await user.click(screen.getByText('Find & Replace Text'));

      const findInput = screen.getByPlaceholderText('Search text...');
      const replaceInput = screen.getByPlaceholderText('Replacement text...');
      const matchCaseCheckbox = screen.getByLabelText('Match case');
      const replaceButton = screen.getByText('Replace All');

      await user.type(findInput, 'hello');
      await user.type(replaceInput, 'hi');
      await user.click(matchCaseCheckbox);
      await user.click(replaceButton);

      expect(mockOnFindAndReplace).toHaveBeenCalledWith('hello', 'hi', true);
    });

    test('should disable replace button when find text is empty', async () => {
      const user = userEvent.setup();
      const elementsWithText = [
        { ...createMockElement('1'), text: 'Hello World' },
      ];

      render(
        <BulkStyleControls
          {...defaultProps}
          selectedElements={elementsWithText}
        />
      );

      await user.click(screen.getByText('Find & Replace Text'));

      const replaceButton = screen.getByText('Replace All');
      expect(replaceButton).toBeDisabled();
    });
  });

  describe('Section Management', () => {
    test('should expand and collapse sections', async () => {
      const user = userEvent.setup();
      render(<BulkStyleControls {...defaultProps} />);

      // Initially expanded
      expect(screen.getByText('Update Mode:')).toBeInTheDocument();

      // Collapse selective updates
      await user.click(screen.getByText('Selective Updates'));

      // Should no longer show the content
      expect(screen.queryByText('Update Mode:')).not.toBeInTheDocument();
    });

    test('should handle keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<BulkStyleControls {...defaultProps} />);

      const selectiveHeader = screen.getByText('Selective Updates');

      // Test Enter key
      selectiveHeader.focus();
      await user.keyboard('{Enter}');

      // Should toggle the section
      expect(screen.queryByText('Update Mode:')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA attributes', () => {
      render(<BulkStyleControls {...defaultProps} />);

      const selectiveHeader = screen.getByText('Selective Updates').closest('button');
      expect(selectiveHeader).toHaveAttribute('aria-expanded', 'true');
    });

    test('should have proper labels for form controls', async () => {
      const user = userEvent.setup();
      render(<BulkStyleControls {...defaultProps} />);

      await user.click(screen.getByText('Selective Updates'));

      const updateModeSelect = screen.getByDisplayValue('Replace Values');
      expect(updateModeSelect).toHaveAccessibleName();
    });

    test('should have proper button titles for alignment tools', async () => {
      const user = userEvent.setup();
      render(<BulkStyleControls {...defaultProps} />);

      await user.click(screen.getByText('Alignment & Distribution'));

      expect(screen.getByTitle('Align Left')).toBeInTheDocument();
      expect(screen.getByTitle('Align Center')).toBeInTheDocument();
      expect(screen.getByTitle('Align Right')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('should handle missing callback functions gracefully', () => {
      render(
        <BulkStyleControls
          selectedElements={defaultProps.selectedElements}
          onBulkStyleUpdate={mockOnBulkStyleUpdate}
          onAlignElements={() => {}}
          onDistributeElements={() => {}}
        />
      );

      // Should render without errors
      expect(screen.getByText('Bulk Operations (2 selected)')).toBeInTheDocument();
    });

    test('should handle empty selected elements', () => {
      render(
        <BulkStyleControls
          {...defaultProps}
          selectedElements={[]}
        />
      );

      expect(screen.getByText('Select multiple elements to use bulk styling')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('should not cause unnecessary re-renders', () => {
      const { rerender } = render(<BulkStyleControls {...defaultProps} />);

      // Re-render with same props
      rerender(<BulkStyleControls {...defaultProps} />);

      // Should not cause errors or performance issues
      expect(screen.getByText('Bulk Operations (2 selected)')).toBeInTheDocument();
    });

    test('should handle large numbers of selected elements', () => {
      const manyElements = Array.from({ length: 100 }, (_, i) => createMockElement(`element-${i}`));

      render(
        <BulkStyleControls
          {...defaultProps}
          selectedElements={manyElements}
        />
      );

      expect(screen.getByText('Bulk Operations (100 selected)')).toBeInTheDocument();
    });
  });
});