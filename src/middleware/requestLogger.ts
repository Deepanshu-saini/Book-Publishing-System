import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { getRequestContext } from '../utils/asyncContext';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  // Log incoming request
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });

  // Override res.end to log response
  const originalEnd = res.end.bind(res);
  res.end = function(chunk?: any, encoding?: any, cb?: () => void) {
    const duration = Date.now() - startTime;
    const context = getRequestContext();
    
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      durationMs: duration,
      userId: context?.userId,
      requestId: context?.requestId,
    });
    
    return originalEnd(chunk, encoding, cb);
  };

  next();
};