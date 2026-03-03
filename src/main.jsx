import React from 'react';
import { createRoot } from 'react-dom/client';  // For React 18
import App from './App.jsx';  // Ensure the path to your App component is correct
import { AppProvider } from './appcontext.jsx';  // Ensure the path to appcontext is correct
import './index.css';  // If you are using a global CSS file

// Ensure the 'root' element exists in your HTML (index.html) as it does
const root = document.getElementById('root');

// For React 18, use `createRoot` to hydrate the root element.
createRoot(root).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
