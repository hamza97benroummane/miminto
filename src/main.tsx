// src/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { AppWalletProvider } from './components/AppWalletProvider';
import { BrowserRouter } from 'react-router-dom';

import { Buffer } from 'buffer';
window.Buffer = Buffer;

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppWalletProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppWalletProvider>
  </React.StrictMode>
);

