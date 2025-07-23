// const express = require('express');
import express from 'express';
import dotenv from 'dotenv';
import { sql } from './config/db.js';
import rateLimiter from './middleware/rateLimiter.js';

dotenv.config();

const app = express();
app.use(rateLimiter);
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

app.get('/api/transactions/:user_id', async (req, res) => {
    const { user_id } = req.params;

    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const transactions = await sql`SELECT * FROM transactions WHERE user_id = ${user_id} ORDER BY created_at DESC`;
        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/transactions',async (req, res) => {
    const { user_id, title, amount, category } = req.body;

    if(!user_id || !title || amount === undefined || !category) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    try {
        const result = await sql`INSERT INTO transactions (user_id, title, amount, category) VALUES (${user_id}, ${title}, ${amount}, ${category}) RETURNING *`;
        res.status(201).json(result[0]);
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/api/transactions/:id', async (req, res) => {
    const { id } = req.params;

    if (isNaN(parseInt(id))) {
        return res.status(400).json({ error: 'Transaction ID must be a number' });
    }
    try {
        const result = await sql`DELETE FROM transactions WHERE id = ${id} RETURNING *`;
        if (result.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.status(200).json({ message: 'Transaction deleted successfully', transaction: result[0] });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get("/api/transactions/summary/:user_id", async (req, res) => {
    const { user_id } = req.params;

    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const balanceResult = await sql`
            SELECT COALESCE(SUM(amount), 0) AS balance FROM transactions WHERE user_id = ${user_id}
        `;

        const incomeResult = await sql`
            SELECT COALESCE(SUM(amount), 0) AS income FROM transactions WHERE user_id = ${user_id} AND amount > 0
        `;
        const expensesResult = await sql`
            SELECT COALESCE(SUM(amount), 0) AS expenses FROM transactions WHERE user_id = ${user_id} AND amount < 0
        `;
        res.status(200).json({ balance: balanceResult[0].balance, income: incomeResult[0].income, expenses: expensesResult[0].expenses });
    } catch (error) {
        console.error('Error fetching transaction summary:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

initDB().then(() => {
  console.log('Database setup complete');
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
}).catch(err => {
  console.error('Error setting up database:', err);
  process.exit(1);
});
