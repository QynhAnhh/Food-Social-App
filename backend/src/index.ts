import 'dotenv/config';
import { app } from './app';
import { prisma } from './config/prisma';

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Food Social API server is running on port ${PORT}`);
});

const shutdown = async (signal: string) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));