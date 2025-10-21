// In frontend/src/main.jsx (for Vite) or index.js (for CRA)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // Your main css file (tailwind)
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx' // <-- IMPORT
import { Toaster } from 'react-hot-toast'; // <-- IMPORT [cite: 20]

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* <-- WRAP APP */}
        <App />
        <Toaster position="top-right" /> {/* <-- ADD TOASTER */}
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);