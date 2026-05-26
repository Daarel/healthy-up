import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';

// routes
import authRoutes from './routes/authRoutes.js';

config();
const app = express();
const PORT = process.env.PORT || 5001;

// body parsing middleware
app.use(helmet());
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/healthyProfiles'); // need a change

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
