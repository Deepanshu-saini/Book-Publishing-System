import { AuditLog, IAuditLog } from '../models/AuditLog';
import { auditConfig, AuditableEntity } from '../config';
import { getRequestContext } from '../utils/asyncContext';
import { logger } from '../utils/logger';

export interface AuditEntry {
  entity: AuditableEntity;
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'restore' | 'login';
  before?: Record<string, any>;
  after?: Record<string, any>;
  metadata?: Record<string, any>;
}

export class AuditService {
  static async createAuditLog(entry: AuditEntry): Promise<void> {
    const context = getRequestContext();
    
    if (!context) {
      logger.warn('No request context found for audit log');
      return;
    }

    const config = auditConfig[entry.entity];
    if (!config?.track) {
      return;
    }

    try {
      const diff = this.calculateDiff(entry.before, entry.after, config);
      
      const auditLog: Partial<IAuditLog> = {
        timestamp: new Date(),
        entity: entry.entity,
        entityId: entry.entityId,
        action: entry.action,
        actorId: context.userId || 'system',
        requestId: context.requestId,
        diff: diff ? {
          before: diff.before,
          after: diff.after,
          fieldsChanged: diff.fieldsChanged,
        } : undefined,
        metadata: entry.metadata,
      };

      await AuditLog.create(auditLog);
      
      logger.info('Audit log created', {
        entity: entry.entity,
        entityId: entry.entityId,
        action: entry.action,
        actorId: context.userId,
        requestId: context.requestId,
      });
    } catch (error) {
      logger.error('Failed to create audit log', {
        error: error instanceof Error ? error.message : 'Unknown error',
        entry,
      });
    }
  }

  private static calculateDiff(
    before: Record<string, any> | undefined,
    after: Record<string, any> | undefined,
    config: typeof auditConfig[AuditableEntity]
  ) {
    if (!before && !after) return undefined;

    const cleanBefore = before ? this.cleanObject(before, config) : undefined;
    const cleanAfter = after ? this.cleanObject(after, config) : undefined;

    const fieldsChanged: string[] = [];
    
    if (cleanBefore && cleanAfter) {
      const allKeys = new Set([...Object.keys(cleanBefore), ...Object.keys(cleanAfter)]);
      
      for (const key of allKeys) {
        if (JSON.stringify(cleanBefore[key]) !== JSON.stringify(cleanAfter[key])) {
          fieldsChanged.push(key);
        }
      }
    }

    return {
      before: cleanBefore,
      after: cleanAfter,
      fieldsChanged: fieldsChanged.length > 0 ? fieldsChanged : undefined,
    };
  }

  private static cleanObject(
    obj: Record<string, any>,
    config: typeof auditConfig[AuditableEntity]
  ): Record<string, any> {
    const cleaned = { ...obj };
    config.exclude.forEach(field => {
      delete cleaned[field];
    });
    config.redact.forEach(field => {
      if (cleaned[field] !== undefined) {
        cleaned[field] = '[REDACTED]';
      }
    });
    delete cleaned._id;
    delete cleaned.__v;
    
    return cleaned;
  }

  static async getAuditLogs(filters: {
    from?: Date | undefined;
    to?: Date | undefined;
    entity?: string | undefined;
    entityId?: string | undefined;
    actorId?: string | undefined;
    action?: string | undefined;
    fieldsChanged?: string[] | undefined;
    requestId?: string | undefined;
    limit?: number | undefined;
    cursor?: string | undefined;
  }): Promise<{
    items: any[];
    nextCursor?: string | undefined;
  }> {
    const query: any = {};
    if (filters.from || filters.to) {
      query.timestamp = {};
      if (filters.from) query.timestamp.$gte = filters.from;
      if (filters.to) query.timestamp.$lte = filters.to;
    }
    if (filters.entity) query.entity = filters.entity;
    if (filters.entityId) query.entityId = filters.entityId;
    if (filters.actorId) query.actorId = filters.actorId;
    if (filters.action) query.action = filters.action;
    if (filters.requestId) query.requestId = filters.requestId;
    if (filters.fieldsChanged && filters.fieldsChanged.length > 0) {
      query['diff.fieldsChanged'] = { $in: filters.fieldsChanged };
    }
    
    if (filters.cursor) {
      try {
        const cursorData = JSON.parse(Buffer.from(filters.cursor, 'base64').toString());
        query.timestamp = { ...query.timestamp, $lt: new Date(cursorData.timestamp) };
      } catch (error) {
        throw new Error('Invalid cursor format');
      }
    }
    
    const limit = Math.min(filters.limit || 20, 100); // Max 100 items per page
    
    const items = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit + 1)
      .lean();
    
    const hasNext = items.length > limit;
    if (hasNext) items.pop();
    
    let nextCursor: string | undefined;
    if (hasNext && items.length > 0) {
      const lastItem = items[items.length - 1];
      if (lastItem) {
        nextCursor = Buffer.from(JSON.stringify({ timestamp: lastItem.timestamp })).toString('base64');
      }
    }
    
    return {
      items: items.map(item => ({
        ...item,
        id: item._id,
        _id: undefined,
        __v: undefined,
      })),
      nextCursor,
    };
  }
}