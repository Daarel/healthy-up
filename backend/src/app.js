import cors from 'cors';
import express from 'express';
import fs from 'fs';
import helmet from 'helmet';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';
import yaml from 'yamljs';

import authRoutes from './routes/authRoutes.js';
import healthProfileRoutes from './routes/healthProfileRoutes.js';
import missionRoutes from './routes/missionRoutes.js';
import rewardRoutes from './routes/rewardRoutes.js';
import userProfileRoutes from './routes/userRoutes.js';

const app = express();

// security and middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'https://healthy-up-frontend.vercel.app',
      'https://healthy-up-admin.vercel.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// api routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/health-profiles', healthProfileRoutes);
app.use('/api/v1/users', userProfileRoutes);
app.use('/api/v1/rewards', rewardRoutes);
app.use('/api/v1/missions', missionRoutes);

// documentation
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerOptions = {
  swaggerOptions: {
    supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
    docExpansion: 'list',
    operationsSorter: 'alpha',
  },
  customSiteTitle: 'HealthyUp API Documentation',
};

const swaggerCandidates = [
  path.resolve(__dirname, '../docs/swagger.yaml'),
  path.resolve(process.cwd(), 'backend/docs/swagger.yaml'),
  path.resolve(process.cwd(), 'docs/swagger.yaml'),
];

let swaggerDocument = {};
for (const candidatePath of swaggerCandidates) {
  try {
    if (fs.existsSync(candidatePath)) {
      const fileContent = fs.readFileSync(candidatePath, 'utf8');
      swaggerDocument = yaml.parse(fileContent);
      break;
    }
  } catch {
    // continue to next candidate
  }
}

app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, swaggerOptions),
);

export default app;
