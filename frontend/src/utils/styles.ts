export const bgColors = [
  '#23272F', // dark background for cards
  '#1A1D23', // slightly darker for nested
]

export const darkTheme = {
  background: '#181A20',
  card: '#23272F',
  text: '#E6EAF3',
  subtitle: '#A0A4AE',
  border: '#23272F',
  pass: '#4ADE80', // green
  fail: '#F87171', // red
  na: '#64748B', // gray
  shadow: '0 2px 8px #101014',
}

// Fade-out CSS (inject once)
const fadeStyleId = 'fade-style'
if (!document.getElementById(fadeStyleId)) {
  const style = document.createElement('style')
  style.id = fadeStyleId
  style.innerHTML = `
    .fade-out {
      opacity: 0 !important;
      transition: opacity 1.5s ease-out !important;
    }
    .fade-out * {
      opacity: 0 !important;
      transition: opacity 1.5s ease-out !important;
    }
    .tree-container > div {
      transition: transform 1s ease-out;
    }
  `;
  document.head.appendChild(style)
} 