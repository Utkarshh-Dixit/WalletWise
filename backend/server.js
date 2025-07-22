// const express = require('express');
import express from 'express';
import dotenv from 'dotenv';
import { sql } from './config/db.js';

dotenv.config();

const app = express();
app.use(express.json());

async function initDB() {
    try{
        await sql`CREATE TABLE IF NOT EXISTS transactions(
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            title VARCHAR(255) NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            category VARCHAR(255) NOT NULL,
            created_at DATE NOT NULL DEFAULT CURRENT_DATE
        )`;
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1); // Exit the process if database initialization fails
    }
}

app.post('/api/transactions',async (req, res) => {
    const { user_id, title, amount, category } = req.body;

    try {
        const result = await sql`INSERT INTO transactions (user_id, title, amount, category) VALUES (${user_id}, ${title}, ${amount}, ${category}) RETURNING *`;
        res.status(201).json(result[0]);
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

initDB().then(() => {
  console.log('Database setup complete');
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
}).catch(err => {
  console.error('Error setting up database:', err);
  process.exit(1);
});
