import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

const root = ReactDOM.createRoot(document.getElementById('root'));

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} catch (error) {
  console.error('Error rendering app:', error);
  document.getElementById('root').innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: system-ui, -apple-system, sans-serif;
      color: #e53e3e;
      text-align: center;
      padding: 20px;
    ">
      <h1>Application Error</h1>
      <p>Failed to load the application. Please refresh the page.</p>
      <button onclick="window.location.reload()" style="
        padding: 10px 20px;
        background: #e53e3e;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 10px;
      ">Refresh Page</button>
    </div>
  `;
}
