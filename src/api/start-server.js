
// This file is used to start the API server
import { register } from 'ts-node';
import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';

// Register ts-node to handle TypeScript files
register();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the server
import('./server.ts')
  .then(() => {
    console.log('Starting FinTrack API Server...');
    console.log('Press Ctrl+C to stop the server');
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
  });
