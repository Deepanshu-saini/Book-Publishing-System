import mongoose from 'mongoose';
import { config } from '../config';
import { logger } from '../utils/logger';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongodbUri);
    logger.info('Connected to MongoDB', { uri: config.mongodbUri.replace(/\/\/.*@/, '//***:***@') });
  } catch (error) {
    logger.error('Failed to connect to MongoDB', {
      error: error instanceof Error ? error.message : 'Unknown error',
      uri: config.mongodbUri.replace(/\/\/.*@/, '//***:***@'),
    });
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};