import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Ensure your Firebase app initializes when importing firebase config/utilities.
import './lib/firebase.js'; // side-effect import to initialize Firebase app

// Context providers
import { UserProvider } from './context/UserContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { VendorProvider } from './context/VendorContext.jsx';

const rootEl = document.getElementById('root');

createRoot(rootEl).render(
  <StrictMode>
    <UserProvider>
      <CartProvider>
        <VendorProvider>
          <App />
        </VendorProvider>
      </CartProvider>
    </UserProvider>
  </StrictMode>
);
