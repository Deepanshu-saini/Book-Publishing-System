import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { config } from '../config';
import { createRequestContext, runWithContext } from '../utils/asyncContext';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    role: 'admin' | 'reviewer';
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authorization token required',
          requestId: req.headers['x-request-id'],
        },
      });
      return;
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as {
        userId: string;
        role: string;
      };
      
      const user = await User.findById(decoded.userId);
      if (!user) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid token',
            requestId: req.headers['x-request-id'],
          },
        });
        return;
      }

      req.user = {
        id: user._id.toString(),
        name: user.name,
        role: user.role,
      };

      // Create and run with request context
      const context = createRequestContext(user._id.toString(), user.role);
      req.headers['x-request-id'] = context.requestId;
      
      runWithContext(context, () => {
        next();
      });
    } catch (jwtError) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token',
          requestId: req.headers['x-request-id'],
        },
      });
    }
  } catch (error) {
    logger.error('Authentication error', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Authentication failed',
        requestId: req.headers['x-request-id'],
      },
    });
  }
};

export const requireRole = (roles: ('admin' | 'reviewer')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          requestId: req.headers['x-request-id'],
        },
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Required role: ${roles.join(' or ')}`,
          requestId: req.headers['x-request-id'],
        },
      });
      return;
    }

    next();
  };
};