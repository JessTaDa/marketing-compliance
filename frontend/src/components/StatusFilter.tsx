import React, { useState } from 'react'
import { Node } from '../types'
import { countNodesByStatus } from '../utils/treeUtils'

interface StatusFilterProps {
  trees: Node[]
  statusFilter: string[]
  setStatusFilter: React.Dispatch<React.SetStateAction<string[]>>
}

export function StatusFilter({ trees, statusFilter, setStatusFilter }: StatusFilterProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Count nodes for filter labels
  const allNodeCount = trees.reduce((sum, t) => sum + countNodesByStatus(t, ['PASS', 'FAIL', 'N/A']), 0)
  const passCount = trees.reduce((sum, t) => sum + countNodesByStatus(t, ['PASS']), 0)
  const failCount = trees.reduce((sum, t) => sum + countNodesByStatus(t, ['FAIL']), 0)
  const naCount = trees.reduce((sum, t) => sum + countNodesByStatus(t, ['N/A']), 0)

  return (
    <div style={{ display: 'inline-block', position: 'relative', marginLeft: 8 }}>
      <button onClick={() => setDropdownOpen(v => !v)}>
        Filter Status
      </button>
      {dropdownOpen && (
        <div style={{ position: 'absolute', zIndex: 10, background: '#fff', border: '1px solid #ccc', padding: 8, borderRadius: 4, minWidth: 160 }}>
          <label style={{ display: 'block', marginBottom: 4 }}>
            <input
              type="checkbox"
              checked={statusFilter.length === 3}
              onChange={e => setStatusFilter(e.target.checked ? ['PASS', 'FAIL', 'N/A'] : [])}
            />{' '}
            All ({allNodeCount})
          </label>
          <label style={{ display: 'block', marginBottom: 4 }}>
            <input
              type="checkbox"
              checked={statusFilter.includes('PASS')}
              onChange={e => {
                setStatusFilter(f => e.target.checked ? Array.from(new Set([...f, 'PASS'])) : f.filter(s => s !== 'PASS'))
              }}
            />{' '}
            PASS ({passCount})
          </label>
          <label style={{ display: 'block', marginBottom: 4 }}>
            <input
              type="checkbox"
              checked={statusFilter.includes('FAIL')}
              onChange={e => {
                setStatusFilter(f => e.target.checked ? Array.from(new Set([...f, 'FAIL'])) : f.filter(s => s !== 'FAIL'))
              }}
            />{' '}
            FAIL ({failCount})
          </label>
          <label style={{ display: 'block', marginBottom: 4 }}>
            <input
              type="checkbox"
              checked={statusFilter.includes('N/A')}
              onChange={e => {
                setStatusFilter(f => e.target.checked ? Array.from(new Set([...f, 'N/A'])) : f.filter(s => s !== 'N/A'))
              }}
            />{' '}
            N/A ({naCount})
          </label>
          <button onClick={() => setDropdownOpen(false)} style={{ marginTop: 4, width: '100%' }}>Close</button>
        </div>
      )}
    </div>
  )
} 