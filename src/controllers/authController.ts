import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { loginSchema } from '../validation/schemas';
import { config } from '../config';
import { createError } from '../middleware/errorHandler';
import { AuditService } from '../services/auditService';
import { logger } from '../utils/logger';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, credentials } = loginSchema.parse(req.body);
      
      const user = await User.findOne({ name }).select('+credentials');
      if (!user) {
        throw createError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
      }
      
      const isValid = await bcrypt.compare(credentials, user.credentials);
      if (!isValid) {
        throw createError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
      }
      
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        config.jwtSecret,
        { expiresIn: '24h' }
      );
      
      await AuditService.createAuditLog({
        entity: 'User',
        entityId: user._id.toString(),
        action: 'login',
        metadata: {
          userAgent: req.get('User-Agent'),
          ip: req.ip,
        },
      });
      
      logger.info('User logged in', {
        userId: user._id,
        userName: user.name,
        role: user.role,
      });
      
      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}