import express from 'express';
import dotenv from 'dotenv';
dotenv.config({ path: './config/config.env' });
import cors from 'cors';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/auth_route.js';
import path from 'path';

dotenv.config();

const app = express();

// Connect to DB
connectDB();

// Middleware
app.use(express.json());
app.use(cors({
    origin: '*', // Change to specific origins in production
    credentials: true,
}));

app.use('/uploads/profile_pictures', express.static(path.join(process.cwd(), 'public/profile_pictures')));

// Routes
app.use('/api/v1', authRoutes);

// Simple test route
app.get('/', (req, res) => {
    res.json({ message: 'Petals by You API is running' });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    );
});