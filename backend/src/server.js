import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';

// routes
import authRoutes from './routes/authRoutes.js';
import healthProfileRoutes from './routes/healthProfileRoutes.js';
import userProfileRoutes from './routes/userRoutes.js';

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
app.use('/api/v1/health-profiles', healthProfileRoutes);
app.use('/api/v1/users', userProfileRoutes);

// API documentation
const swaggerDocument = yaml.load(
  path.join(process.cwd(), 'docs', 'swagger.yaml'),
);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
