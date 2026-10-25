import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import swaggerDocument from '../docs/swagger.js';
import authRoutes from './routes/authRoutes.js';
import healthProfileRoutes from './routes/healthProfileRoutes.js';
import missionRoutes from './routes/missionRoutes.js';
import rewardRoutes from './routes/rewardRoutes.js';
import userProfileRoutes from './routes/userRoutes.js';

const app = express();

// security and middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com'],
        imgSrc: [
          "'self'",
          'data:',
          'https://cdnjs.cloudflare.com',
          'https://validator.swagger.io',
        ],
      },
    },
  }),
);
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://healthy-up-frontend.vercel.app',
  'https://healthy-up-admin.vercel.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
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

const swaggerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HealthyUp API Documentation</title>
  <link rel="icon" type="image/png" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/favicon-32x32.png" sizes="32x32" />
  <link rel="icon" type="image/png" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/favicon-16x16.png" sizes="16x16" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui.min.css" />
  <style>
    html { box-sizing: border-box; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; background: #fafafa; }
    .swagger-ui .topbar .download-url-wrapper { display: none; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-bundle.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        spec: ${JSON.stringify(swaggerDocument)},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
        docExpansion: 'list',
        operationsSorter: 'alpha'
      });
    };
  </script>
</body>
</html>
`;

// Redirect static swagger assets to CDN if requested directly
app.get('/api-docs/swagger-ui-bundle.js', (req, res) => {
  res.redirect('https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-bundle.js');
});
app.get('/api-docs/swagger-ui-standalone-preset.js', (req, res) => {
  res.redirect('https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-standalone-preset.js');
});
app.get('/api-docs/swagger-ui.css', (req, res) => {
  res.redirect('https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui.min.css');
});

// JSON specification endpoint
app.get('/api-docs/swagger.json', (req, res) => {
  res.json(swaggerDocument);
});

// Documentation UI endpoint
app.get(['/api-docs', '/api-docs/'], (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(swaggerHtml);
});

app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

export default app;
