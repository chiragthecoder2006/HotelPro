import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

// Production environment verification
if (process.env.NODE_ENV === 'production') {
  const weakSecrets = [
    'super_secret_jwt_key_change_in_production',
    'hotelpro_dev_secret_key_987654321',
    'default',
    'secret'
  ];
  if (!process.env.JWT_SECRET || weakSecrets.includes(process.env.JWT_SECRET)) {
    console.warn('⚠️ [SECURITY WARNING] Default or weak JWT_SECRET detected in production mode! Set a strong unique JWT_SECRET in production.');
  }
}

// Connect to MongoDB
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🏨 HotelPro Backend API Server running on port ${PORT}`);
    console.log(`🌐 Local API URL: http://localhost:${PORT}/api`);
    console.log(`🩺 Health check:  http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection Error: ${err.message}`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('Shutdown signal received. Shutting down gracefully...');
    server.close(() => {
      console.log('Process terminated.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
});

