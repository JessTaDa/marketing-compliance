import React from 'react'

interface OverrideButtonProps {
  status: 'PASS' | 'FAIL'
  onClick: () => void
  children: React.ReactNode
}

const baseButtonStyle: React.CSSProperties = {
  padding: '6px 16px',
  borderRadius: 6,
  border: 'none',
  fontWeight: 700,
  cursor: 'pointer',
  outline: 'none',
  transition: 'background 0.15s',
}

const passButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  background: '#17824c',
  color: '#fff',
}

const failButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  background: '#a13a3a',
  color: '#fff',
}

export const OverrideButton: React.FC<OverrideButtonProps> = ({ status, onClick, children }) => {
  const baseStyle = status === 'PASS' ? passButtonStyle : failButtonStyle
  const hoverColor = status === 'PASS' ? '#116639' : '#7a2929'
  const normalColor = status === 'PASS' ? '#17824c' : '#a13a3a'

  return (
    <button
      onClick={onClick}
      style={{
        ...baseStyle,
        marginLeft: 8,
      }}
      onMouseOver={(e) => (e.currentTarget.style.background = hoverColor)}
      onMouseOut={(e) => (e.currentTarget.style.background = normalColor)}
    >
      {children}
    </button>
  )
}

// Utility function to get button styles for different states
export const getButtonStyles = {
  pass: passButtonStyle,
  fail: failButtonStyle,
  base: baseButtonStyle,
} 