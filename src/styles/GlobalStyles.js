import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    font-family: 'Segoe UI', Tahoma, sans-serif;
    line-height: 1.5;
    font-weight: 400;
    color: #111827;
    background: #f8fafc;
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    min-width: 0;
    min-height: 100%;
    margin: 0;
  }

  body {
    min-height: 100vh;
    background: #f8fafc;
  }

  button,
  input,
  textarea,
  select {
    font: inherit;
  }
`;

export default GlobalStyles;
