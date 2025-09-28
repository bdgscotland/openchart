import React from 'react';
import { render } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { CustomDashedEdge, CustomCurvedEdge, CustomArrowEdge } from './';
import type { EdgeProps } from '@xyflow/react';

// Mock CSS imports
jest.mock('./CustomDashedEdge', () => {
  return {
    CustomDashedEdge: ({ id }: { id: string }) => <div data-testid={`dashed-edge-${id}`}>Dashed Edge</div>
  };
});

jest.mock('./CustomCurvedEdge', () => {
  return {
    CustomCurvedEdge: ({ id }: { id: string }) => <div data-testid={`curved-edge-${id}`}>Curved Edge</div>
  };
});

jest.mock('./CustomArrowEdge', () => {
  return {
    CustomArrowEdge: ({ id }: { id: string }) => <div data-testid={`arrow-edge-${id}`}>Arrow Edge</div>
  };
});

// Mock React Flow components
jest.mock('@xyflow/react', () => ({
  ...jest.requireActual('@xyflow/react'),
  BaseEdge: ({ id }: { id: string }) => <div data-testid={`base-edge-${id}`}>Base Edge</div>,
  getStraightPath: () => ['M 0 0 L 100 100', 50, 50],
  getSimpleBezierPath: () => ['M 0 0 Q 50 25 100 100', 50, 50],
  getSmoothStepPath: () => ['M 0 0 L 50 0 L 50 100 L 100 100', 50, 50],
  getBezierPath: () => ['M 0 0 C 25 0 75 100 100 100', 50, 50],
  ReactFlowProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

describe('Edge Components Integration', () => {
  const mockEdgeProps: EdgeProps = {
    id: 'test-edge',
    sourceX: 0,
    sourceY: 0,
    targetX: 100,
    targetY: 100,
    sourcePosition: 'right' as any,
    targetPosition: 'left' as any,
    source: 'node-1',
    target: 'node-2',
    animated: false,
    selected: false,
    data: {
      style: {
        strokeWidth: 2,
        strokeColor: '#000000',
        lineStyle: 'solid',
        curveStyle: 'straight',
        markerEnd: 'arrow',
        opacity: 1
      }
    }
  };

  it('renders CustomDashedEdge correctly', () => {
    const { getByTestId } = render(
      <ReactFlowProvider>
        <CustomDashedEdge {...mockEdgeProps} />
      </ReactFlowProvider>
    );

    expect(getByTestId('dashed-edge-test-edge')).toBeInTheDocument();
  });

  it('renders CustomCurvedEdge correctly', () => {
    const { getByTestId } = render(
      <ReactFlowProvider>
        <CustomCurvedEdge {...mockEdgeProps} />
      </ReactFlowProvider>
    );

    expect(getByTestId('curved-edge-test-edge')).toBeInTheDocument();
  });

  it('renders CustomArrowEdge correctly', () => {
    const { getByTestId } = render(
      <ReactFlowProvider>
        <CustomArrowEdge {...mockEdgeProps} />
      </ReactFlowProvider>
    );

    expect(getByTestId('arrow-edge-test-edge')).toBeInTheDocument();
  });

  it('handles edge style configurations', () => {
    const propsWithDashedStyle = {
      ...mockEdgeProps,
      data: {
        style: {
          strokeWidth: 3,
          strokeColor: '#ff0000',
          lineStyle: 'dashed',
          curveStyle: 'bezier',
          markerEnd: 'arrowclosed',
          opacity: 0.8
        }
      }
    };

    const { getByTestId } = render(
      <ReactFlowProvider>
        <CustomDashedEdge {...propsWithDashedStyle} />
      </ReactFlowProvider>
    );

    expect(getByTestId('dashed-edge-test-edge')).toBeInTheDocument();
  });
});