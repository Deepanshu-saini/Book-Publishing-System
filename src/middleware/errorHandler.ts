import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';
import { config } from '../config';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = req.headers['x-request-id'] as string;
  
  logger.error('Request error', {
    error: error.message,
    stack: config.nodeEnv === 'development' ? error.stack : undefined,
    requestId,
    method: req.method,
    url: req.url,
  });

  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
        requestId,
      },
    });
    return;
  }

  if (error.name === 'MongoServerError' && (error as any).code === 11000) {
    res.status(409).json({
      error: {
        code: 'DUPLICATE_ERROR',
        message: 'Resource already exists',
        requestId,
      },
    });
    return;
  }

  if (error.name === 'CastError') {
    res.status(400).json({
      error: {
        code: 'INVALID_ID',
        message: 'Invalid resource ID format',
        requestId,
      },
    });
    return;
  }

  const statusCode = error.statusCode || 500;
  const code = error.code || 'INTERNAL_ERROR';
  
  res.status(statusCode).json({
    error: {
      code,
      message: error.message || 'Internal server error',
      details: config.nodeEnv === 'development' ? error.details : undefined,
      requestId,
    },
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  const requestId = req.headers['x-request-id'] as string;
  
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
      requestId,
    },
  });
};

export const createError = (
  message: string,
  statusCode: number = 500,
  code?: string | undefined,
  details?: any
): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  if (code !== undefined) {
    error.code = code;
  }
  error.details = details;
  return error;
};