import { useState, useCallback, useRef, useEffect } from 'react';

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  nodeCount: number;
  fps: number;
  lastUpdate: number;
}

/**
 * Hook for monitoring React Flow performance metrics
 * Tracks render times, memory usage, and frame rates
 */
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    nodeCount: 0,
    fps: 60,
    lastUpdate: Date.now()
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(Date.now());
  const renderStartRef = useRef(0);

  // Measure render performance
  const measureRender = useCallback((callback: () => void) => {
    renderStartRef.current = performance.now();
    callback();
    const renderTime = performance.now() - renderStartRef.current;

    setMetrics(prev => ({
      ...prev,
      renderTime,
      lastUpdate: Date.now()
    }));
  }, []);

  // Measure frame rate
  const updateFPS = useCallback(() => {
    const now = Date.now();
    frameCountRef.current++;

    if (now - lastTimeRef.current >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));

      setMetrics(prev => ({
        ...prev,
        fps,
        lastUpdate: now
      }));

      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }
  }, []);

  // Measure memory usage (if available)
  const updateMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      const memoryUsage = Math.round(memInfo.usedJSHeapSize / 1024 / 1024); // MB

      setMetrics(prev => ({
        ...prev,
        memoryUsage,
        lastUpdate: Date.now()
      }));
    }
  }, []);

  // Update node count
  const updateNodeCount = useCallback((count: number) => {
    setMetrics(prev => ({
      ...prev,
      nodeCount: count,
      lastUpdate: Date.now()
    }));
  }, []);

  // Performance warning thresholds
  const getPerformanceWarnings = useCallback(() => {
    const warnings: string[] = [];

    if (metrics.renderTime > 100) {
      warnings.push(`High render time: ${metrics.renderTime.toFixed(1)}ms`);
    }

    if (metrics.fps < 30) {
      warnings.push(`Low FPS: ${metrics.fps}`);
    }

    if (metrics.nodeCount > 500 && metrics.renderTime > 50) {
      warnings.push('Consider implementing virtual scrolling for large diagrams');
    }

    return warnings;
  }, [metrics]);

  // Auto-update FPS
  useEffect(() => {
    const intervalId = setInterval(updateFPS, 100);
    return () => clearInterval(intervalId);
  }, [updateFPS]);

  // Auto-update memory usage
  useEffect(() => {
    const intervalId = setInterval(updateMemoryUsage, 5000);
    return () => clearInterval(intervalId);
  }, [updateMemoryUsage]);

  return {
    metrics,
    measureRender,
    updateNodeCount,
    getPerformanceWarnings,
    // Utility functions
    startRenderMeasurement: () => {
      renderStartRef.current = performance.now();
    },
    endRenderMeasurement: () => {
      const renderTime = performance.now() - renderStartRef.current;
      setMetrics(prev => ({ ...prev, renderTime, lastUpdate: Date.now() }));
      return renderTime;
    }
  };
};

export default usePerformanceMonitor;