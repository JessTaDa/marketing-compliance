export const bgColors = ['#f9f9f9', '#e6f7ff', '#fffbe6', '#f6ffed']

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