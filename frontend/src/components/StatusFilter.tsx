import React, { useState, useMemo } from 'react'
import { Node } from '../types'
import { countNodesByStatus } from '../utils/treeUtils'

interface StatusFilterProps {
  trees: Node[]
  statusFilter: string[]
  setStatusFilter: React.Dispatch<React.SetStateAction<string[]>>
}

export const StatusFilter = React.memo(function StatusFilter({ trees, statusFilter, setStatusFilter }: StatusFilterProps) {
  const statuses = ['PASS', 'FAIL', 'N/A']
  
  // Memoize the expensive status counts calculation to prevent recalculation on every render
  const statusCounts = useMemo(() => {
    return Object.fromEntries(
      statuses.map(status => [
        status,
        trees.reduce((sum, tree) => sum + countNodesByStatus(tree, [status]), 0)
      ])
    )
  }, [trees, statuses])

  const getButtonStyle = (status: string) => {
    const selected = statusFilter.includes(status)
    if (status === 'PASS') {
      return selected
        ? { background: '#4ADE80', color: '#23272F', border: '2px solid #4ADE80', fontWeight: 700 }
        : { background: '#23272F', color: '#4ADE80', border: '1px solid #4ADE80', fontWeight: 600 }
    }
    if (status === 'FAIL') {
      return selected
        ? { background: '#F87171', color: '#23272F', border: '2px solid #F87171', fontWeight: 700 }
        : { background: '#23272F', color: '#F87171', border: '1px solid #F87171', fontWeight: 600 }
    }
    // N/A
    return selected
      ? { background: '#A0A4AE', color: '#23272F', border: '2px solid #A0A4AE', fontWeight: 700 }
      : { background: '#23272F', color: '#A0A4AE', border: '1px solid #A0A4AE', fontWeight: 600 }
  }
  
  const toggleStatus = (status: string) => {
    setStatusFilter(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status])
  }

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {statuses.map(status => (
        <button
          key={status}
          onClick={() => toggleStatus(status)}
          style={{
            padding: '6px 16px',
            borderRadius: 6,
            cursor: 'pointer',
            outline: 'none',
            transition: 'all 0.15s',
            ...getButtonStyle(status),
          }}
        >
          {status} <span style={{ fontWeight: 500, opacity: 0.85 }}>({statusCounts[status]})</span>
        </button>
      ))}
    </div>
  )
}) 