import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './site.css';
import './site-2.css';
import './boot';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
