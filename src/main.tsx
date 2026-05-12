import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App'; // Correction du chemin d'importation pour App.tsx
import './index.css';
import { AuthProvider } from './AuthContext'; // Importez AuthProvider

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider> {/* Enveloppez App avec AuthProvider */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);