
// This file is used to start the API server
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the server
import('./server.js')
  .then(() => {
    console.log('Starting FinTrack API Server...');
    console.log('Press Ctrl+C to stop the server');
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
  });
