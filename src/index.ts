import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import apiRoutes from './routes/index.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API Routes
app.use('/api', apiRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('WhatsApp Sales AI Agent Backend is Running!');
});

// Start Server
const server = app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Server is running on port ${port} at 0.0.0.0`);
});

// Global Error Handling
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
