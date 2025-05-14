
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Display API server information in console
console.log('%c FinTrack API Server', 'color: #8257e6; font-size: 16px; font-weight: bold;');
console.log('%c Run the following command to start the API server:', 'color: #64748b;');
console.log('%c npm run start-api', 'background: #1e293b; color: #38bdf8; padding: 4px 8px; border-radius: 4px;');
console.log('%c API Docs: http://localhost:3001/api/docs', 'color: #64748b;');

// Mount the React application
createRoot(document.getElementById("root")!).render(<App />);
