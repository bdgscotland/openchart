import type { Node, Edge } from 'reactflow';

export interface BenchmarkResult {
  operation: string;
  nodeCount: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  iterations: number;
  memoryBefore: number;
  memoryAfter: number;
  timestamp: number;
}

export interface BenchmarkSuite {
  name: string;
  results: BenchmarkResult[];
  totalDuration: number;
  averagePerformance: number;
}

/**
 * Performance benchmark utility for OpenChart operations
 */
export class PerformanceBenchmark {
  private results: BenchmarkResult[] = [];

  /**
   * Measure the performance of a function
   */
  async measure<T>(
    operation: string,
    nodeCount: number,
    fn: () => T | Promise<T>,
    iterations: number = 10
  ): Promise<BenchmarkResult> {
    const times: number[] = [];
    const memoryBefore = this.getMemoryUsage();

    // Warm up
    if (typeof fn === 'function') {
      await fn();
    }

    // Run benchmark iterations
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      const end = performance.now();
      times.push(end - start);
    }

    const memoryAfter = this.getMemoryUsage();
    const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    const result: BenchmarkResult = {
      operation,
      nodeCount,
      averageTime,
      minTime,
      maxTime,
      iterations,
      memoryBefore,
      memoryAfter,
      timestamp: Date.now()
    };

    this.results.push(result);
    return result;
  }

  /**
   * Generate test nodes for benchmarking
   */
  generateTestNodes(count: number): Node[] {
    const nodes: Node[] = [];

    for (let i = 0; i < count; i++) {
      nodes.push({
        id: `node-${i}`,
        type: 'shape',
        position: {
          x: (i % 10) * 150,
          y: Math.floor(i / 10) * 100
        },
        data: {
          label: `Node ${i}`,
          shape: 'rectangle',
          backgroundColor: '#f0f9ff',
          borderColor: '#d1d5db'
        },
        style: { width: 120, height: 60 }
      });
    }

    return nodes;
  }

  /**
   * Generate test edges for benchmarking
   */
  generateTestEdges(nodeCount: number): Edge[] {
    const edges: Edge[] = [];

    for (let i = 0; i < nodeCount - 1; i++) {
      if (Math.random() > 0.5) { // 50% chance of connection
        edges.push({
          id: `edge-${i}`,
          source: `node-${i}`,
          target: `node-${i + 1}`,
          type: 'default'
        });
      }
    }

    return edges;
  }

  /**
   * Run a comprehensive benchmark suite
   */
  async runBenchmarkSuite(): Promise<BenchmarkSuite> {
    console.log('🚀 Starting Performance Benchmark Suite...');
    const suiteStart = performance.now();

    // Test different node counts
    const nodeCounts = [10, 50, 100, 250, 500];

    for (const nodeCount of nodeCounts) {
      const nodes = this.generateTestNodes(nodeCount);
      const edges = this.generateTestEdges(nodeCount);

      // Benchmark node creation
      await this.measure(
        'Node Creation',
        nodeCount,
        () => this.simulateNodeCreation(nodes),
        5
      );

      // Benchmark text editing
      await this.measure(
        'Text Editing',
        nodeCount,
        () => this.simulateTextEditing(nodes),
        10
      );

      // Benchmark node dragging
      await this.measure(
        'Node Dragging',
        nodeCount,
        () => this.simulateNodeDragging(nodes),
        5
      );

      // Benchmark edge creation
      await this.measure(
        'Edge Creation',
        nodeCount,
        () => this.simulateEdgeCreation(edges),
        5
      );

      console.log(`✅ Completed benchmarks for ${nodeCount} nodes`);
    }

    const suiteEnd = performance.now();
    const totalDuration = suiteEnd - suiteStart;

    const averagePerformance = this.results.reduce(
      (sum, result) => sum + result.averageTime, 0
    ) / this.results.length;

    const suite: BenchmarkSuite = {
      name: 'OpenChart Performance Suite',
      results: this.results,
      totalDuration,
      averagePerformance
    };

    console.log('📊 Benchmark Suite Complete:', suite);
    return suite;
  }

  /**
   * Simulate node creation performance
   */
  private simulateNodeCreation(nodes: Node[]): void {
    // Simulate React state update overhead
    const updatedNodes = nodes.map(node => ({
      ...node,
      data: { ...node.data, timestamp: Date.now() }
    }));

    // Simulate DOM manipulation time
    this.simulateDelay(0.1);
  }

  /**
   * Simulate text editing performance
   */
  private simulateTextEditing(nodes: Node[]): void {
    // Simulate rapid text changes
    for (let i = 0; i < 10; i++) {
      const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
      randomNode.data.label = `Updated ${Date.now()}`;
    }

    this.simulateDelay(0.2);
  }

  /**
   * Simulate node dragging performance
   */
  private simulateNodeDragging(nodes: Node[]): void {
    // Simulate 60fps drag updates
    for (let frame = 0; frame < 60; frame++) {
      nodes.forEach(node => {
        node.position.x += Math.random() * 2 - 1;
        node.position.y += Math.random() * 2 - 1;
      });
    }

    this.simulateDelay(1);
  }

  /**
   * Simulate edge creation performance
   */
  private simulateEdgeCreation(edges: Edge[]): void {
    // Simulate edge validation and creation
    edges.forEach(edge => {
      const newEdge = {
        ...edge,
        id: `${edge.id}-${Date.now()}`,
        animated: Math.random() > 0.5
      };
    });

    this.simulateDelay(0.5);
  }

  /**
   * Simulate processing delay
   */
  private simulateDelay(ms: number): void {
    const start = performance.now();
    while (performance.now() - start < ms) {
      // Busy wait to simulate processing
    }
  }

  /**
   * Get current memory usage (if available)
   */
  private getMemoryUsage(): number {
    if ('memory' in performance && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }

  /**
   * Export results as CSV
   */
  exportResultsCSV(): string {
    if (this.results.length === 0) {
      return 'No benchmark results available';
    }

    const headers = [
      'Operation',
      'Node Count',
      'Average Time (ms)',
      'Min Time (ms)',
      'Max Time (ms)',
      'Iterations',
      'Memory Before (MB)',
      'Memory After (MB)',
      'Timestamp'
    ];

    const rows = this.results.map(result => [
      result.operation,
      result.nodeCount,
      result.averageTime.toFixed(2),
      result.minTime.toFixed(2),
      result.maxTime.toFixed(2),
      result.iterations,
      result.memoryBefore.toFixed(2),
      result.memoryAfter.toFixed(2),
      new Date(result.timestamp).toISOString()
    ]);

    return [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
  }

  /**
   * Clear all results
   */
  clear(): void {
    this.results = [];
  }

  /**
   * Get all results
   */
  getResults(): BenchmarkResult[] {
    return [...this.results];
  }
}

// Export singleton instance
export const performanceBenchmark = new PerformanceBenchmark();

// Performance analysis utilities
export const PerformanceAnalyzer = {
  /**
   * Analyze benchmark results and provide recommendations
   */
  analyzeResults(results: BenchmarkResult[]): {
    bottlenecks: string[];
    recommendations: string[];
    performanceScore: number;
  } {
    const bottlenecks: string[] = [];
    const recommendations: string[] = [];

    // Check for render time bottlenecks
    const renderIssues = results.filter(r => r.averageTime > 100);
    if (renderIssues.length > 0) {
      bottlenecks.push('High render times detected');
      recommendations.push('Consider implementing React.memo and useMemo optimizations');
    }

    // Check for memory leaks
    const memoryIssues = results.filter(r => r.memoryAfter > r.memoryBefore * 1.2);
    if (memoryIssues.length > 0) {
      bottlenecks.push('Memory usage increasing significantly');
      recommendations.push('Review event listeners and cleanup effects');
    }

    // Check for scaling issues
    const scalingIssues = results.filter(r => r.nodeCount > 100 && r.averageTime > 50);
    if (scalingIssues.length > 0) {
      bottlenecks.push('Performance degrades with large node counts');
      recommendations.push('Implement virtual scrolling for large diagrams');
    }

    // Calculate performance score (0-10)
    const avgTime = results.reduce((sum, r) => sum + r.averageTime, 0) / results.length;
    const performanceScore = Math.max(0, 10 - Math.floor(avgTime / 10));

    return { bottlenecks, recommendations, performanceScore };
  },

  /**
   * Generate performance report
   */
  generateReport(suite: BenchmarkSuite): string {
    const analysis = this.analyzeResults(suite.results);

    return `
# Performance Analysis Report

## Suite: ${suite.name}
**Total Duration:** ${suite.totalDuration.toFixed(2)}ms
**Average Performance:** ${suite.averagePerformance.toFixed(2)}ms
**Performance Score:** ${analysis.performanceScore}/10

## Bottlenecks Identified
${analysis.bottlenecks.map(b => `- ${b}`).join('\n')}

## Recommendations
${analysis.recommendations.map(r => `- ${r}`).join('\n')}

## Detailed Results
${suite.results.map(r => `
### ${r.operation} (${r.nodeCount} nodes)
- Average: ${r.averageTime.toFixed(2)}ms
- Range: ${r.minTime.toFixed(2)}ms - ${r.maxTime.toFixed(2)}ms
- Memory: ${r.memoryBefore.toFixed(1)}MB → ${r.memoryAfter.toFixed(1)}MB
`).join('\n')}
`;
  }
};

export default PerformanceBenchmark;