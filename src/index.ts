import { app } from './app';
import { connectDatabase } from './database/connection';
import { config } from './config';
import { logger } from './utils/logger';

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    app.listen(config.port, () => {
      logger.info('Server started', {
        port: config.port,
        nodeEnv: config.nodeEnv,
        logLevel: config.log.level,
        logTransport: config.log.transport,
      });
    });
  } catch (error) {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit(1);
  }
};

startServer();