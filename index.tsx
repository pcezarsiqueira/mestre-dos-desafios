
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { TenantProvider } from './contexts/TenantContext';

// The root element for the application.
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <TenantProvider>
      <App />
    </TenantProvider>
  </React.StrictMode>
);
