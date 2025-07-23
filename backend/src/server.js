// const express = require('express');
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './config/db.js';
import rateLimiter from './middleware/rateLimiter.js';
import transactionRoutes from './routes/transactionRoutes.js';
import job from './config/cron.js';

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: true, // Allow all origins for development/mobile apps
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

if(process.env.NODE_ENV === 'production') {
  job.start();
}
app.use(rateLimiter);
app.use(express.json());

app.use('/api/transactions', transactionRoutes);

initDB().then(() => {
  console.log('Database setup complete');
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
}).catch(err => {
  console.error('Error setting up database:', err);
  process.exit(1);
});
