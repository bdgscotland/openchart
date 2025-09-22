import { useCallback, useRef, useMemo } from 'react'
import type { Edge, Connection } from '@xyflow/react'
import { MarkerType } from '@xyflow/react'

interface ConnectionPoolStats {
  poolSize: number
  connectionsProcessed: number
  duplicatesBlocked: number
}

/**
 * Hook for managing connection pooling and batch processing
 * Optimizes edge creation and prevents duplicate connections
 */
export function useConnectionPool(
  edges: Edge[],
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void,
  maxPoolSize: number = 100
) {
  const connectionPool = useRef<Connection[]>([])
  const processTimeoutRef = useRef<NodeJS.Timeout>()
  const statsRef = useRef<ConnectionPoolStats>({
    poolSize: 0,
    connectionsProcessed: 0,
    duplicatesBlocked: 0
  })

  // Create a set of existing connections for fast duplicate checking
  const existingConnections = useMemo(() => {
    const connectionSet = new Set<string>()
    edges.forEach(edge => {
      const key = `${edge.source}-${edge.target}`
      connectionSet.add(key)
    })
    return connectionSet
  }, [edges])

  const hasConnection = useCallback((source: string, target: string): boolean => {
    const key = `${source}-${target}`
    return existingConnections.has(key)
  }, [existingConnections])

  const processConnectionPool = useCallback(() => {
    if (connectionPool.current.length === 0) return

    const connectionsToProcess = [...connectionPool.current]
    connectionPool.current = []

    const newEdges = connectionsToProcess.map((connection, index) => ({
      id: `edge-${Date.now()}-${index}`,
      source: connection.source!,
      target: connection.target!,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      type: 'default',
      markerEnd: { type: MarkerType.Arrow }
    }))

    setEdges((currentEdges) => {
      const updatedEdges = [...currentEdges, ...newEdges]
      statsRef.current.connectionsProcessed += newEdges.length
      return updatedEdges
    })

    statsRef.current.poolSize = 0
  }, [setEdges])

  const addConnection = useCallback((connection: Connection) => {
    // Check for duplicates
    if (hasConnection(connection.source!, connection.target!)) {
      statsRef.current.duplicatesBlocked++
      return
    }

    // Add to pool
    connectionPool.current.push(connection)
    statsRef.current.poolSize = connectionPool.current.length

    // Clear existing timeout
    if (processTimeoutRef.current) {
      clearTimeout(processTimeoutRef.current)
    }

    // Process immediately if pool is full, or set timeout for batching
    if (connectionPool.current.length >= maxPoolSize) {
      processConnectionPool()
    } else {
      processTimeoutRef.current = setTimeout(processConnectionPool, 50)
    }
  }, [hasConnection, maxPoolSize, processConnectionPool])

  const removeConnection = useCallback((source: string, target: string) => {
    setEdges((currentEdges) =>
      currentEdges.filter(edge =>
        !(edge.source === source && edge.target === target)
      )
    )
  }, [setEdges])

  const getPoolStats = useCallback((): ConnectionPoolStats => ({
    ...statsRef.current
  }), [])

  const cleanup = useCallback(() => {
    if (processTimeoutRef.current) {
      clearTimeout(processTimeoutRef.current)
    }

    // Process any remaining connections
    if (connectionPool.current.length > 0) {
      processConnectionPool()
    }
  }, [processConnectionPool])

  return {
    addConnection,
    removeConnection,
    hasConnection,
    getPoolStats,
    cleanup
  }
}