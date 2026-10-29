import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Apply the saved theme before first paint so the login screen honours dark mode too.
try {
  if (localStorage.getItem('darkMode') === 'true') document.documentElement.classList.add('dark');
} catch {
  // storage blocked: default light theme
}

createRoot(document.getElementById('root')).render(
  <App />
);
// <StrictMode>
// </StrictMode>