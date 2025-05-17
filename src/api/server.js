
import express from 'express';
import cors from 'cors';
import errorHandler from './utils/errorHandler.js';
import apiRoutes from './routes/index.js';

const app = express();
const port = 3001;

// Enhanced CORS configuration with additional origin
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'], // Added localhost:8080
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Mount API routes
app.use('/api', apiRoutes);

// Apply error handling middleware
app.use(errorHandler);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`API Documentation available at http://localhost:${port}/api/docs`);
});

export default app;
