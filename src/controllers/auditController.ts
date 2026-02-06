import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { auditFiltersSchema } from '../validation/schemas';
import { AuditService } from '../services/auditService';
import { AuditLog } from '../models/AuditLog';
import { createError } from '../middleware/errorHandler';

export class AuditController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = auditFiltersSchema.parse(req.query);
      
      const result = await AuditService.getAuditLogs({
        from: filters.from,
        to: filters.to,
        entity: filters.entity,
        entityId: filters.entityId,
        actorId: filters.actorId,
        action: filters.action,
        fieldsChanged: filters.fieldsChanged,
        requestId: filters.requestId,
        limit: filters.limit,
        cursor: filters.cursor,
      });
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const auditLog = await AuditLog.findById(id);
      if (!auditLog) {
        throw createError('Audit log not found', 404, 'AUDIT_NOT_FOUND');
      }
      
      res.json(auditLog);
    } catch (error) {
      next(error);
    }
  }
}