import React from 'react'
import { darkTheme } from './styles'

interface StatusIconProps {
  status: string | null
  size?: string
}

export const StatusIcon: React.FC<StatusIconProps> = ({ status, size = '1.45em' }) => {
  if (status === 'PASS') {
    return (
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 20 20" 
        style={{ display: 'inline', verticalAlign: 'middle' }}
      >
        <path 
          d="M6 10.8l3 3.2 5-6.2" 
          stroke={darkTheme.pass} 
          strokeWidth="2.8" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </svg>
    )
  }
  
  if (status === 'FAIL') {
    return (
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 20 20" 
        style={{ display: 'inline', verticalAlign: 'middle' }}
      >
        <line x1="6" y1="6" x2="14" y2="14" stroke={darkTheme.fail} strokeWidth="2.8" strokeLinecap="round" />
        <line x1="14" y1="6" x2="6" y2="14" stroke={darkTheme.fail} strokeWidth="2.8" strokeLinecap="round" />
      </svg>
    )
  }
  
  // Default for N/A or null status
  return <span>⬤</span>
} 