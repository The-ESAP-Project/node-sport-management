require('dotenv').config();

const os = require('os');
const fs = require('fs');
const express = require('express');
const cluster = require('cluster');

const API_BASE_ROUTE = process.env.API_BASE_ROUTE || '/api/v1';

const numCPUs = process.env.NODE_ENV === 'development' ? 1 : os.cpus().length;

if (cluster.isMaster) {

  console.log(`Master process ${process.pid} is running`);
  fs.writeFileSync(process.env.HOME + '/spm_backend.pid', process.pid.toString());
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  process.on('SIGINT', () => {
    console.log('Received SIGINT signal, shutting down server...');
    for (const id in cluster.workers) {
      cluster.workers[id].kill('SIGINT');
    }
    fs.unlinkSync(process.env.HOME + '/spm_backend.pid');
    console.log('Removed PID file');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('Received SIGTERM signal, shutting down server...');
    for (const id in cluster.workers) {
      cluster.workers[id].kill('SIGTERM');
    }
    fs.unlinkSync(process.env.HOME + '/spm_backend.pid');
    console.log('Removed PID file');
    process.exit(0);
  });

  process.on('uncaughtException', (err) => {
    console.error(`Process ${process.pid} uncaught exception:`, err);
  });
} else {

  console.log(`Worker process ${process.pid} is running`);
  const app = express();

  const PORT = process.env.PORT || 8012;
  const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS.split(',') || ['http://localhost:3000'];

  function corsMiddleware(req, res, next) {
    const origin = req.headers.origin;
    if (ALLOWED_ORIGINS.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    }
    next();
  }

  const server = require('http').createServer(app);

  app.use(corsMiddleware);
  app.use(require('body-parser').json());

  app.use(`${API_BASE_ROUTE}/`, require('./routes'));

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}