import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAuditLog extends Document {
  _id: Types.ObjectId;
  timestamp: Date;
  entity: string;
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'restore' | 'login';
  actorId: string;
  requestId: string;
  diff?: {
    before?: Record<string, any> | undefined;
    after?: Record<string, any> | undefined;
    fieldsChanged?: string[] | undefined;
  } | undefined;
  metadata?: Record<string, any> | undefined;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    entity: {
      type: String,
      required: true,
      maxlength: 50,
    },
    entityId: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: ['create', 'update', 'delete', 'restore', 'login'],
      required: true,
    },
    actorId: {
      type: String,
      required: true,
    },
    requestId: {
      type: String,
      required: true,
    },
    diff: {
      before: Schema.Types.Mixed,
      after: Schema.Types.Mixed,
      fieldsChanged: [String],
    },
    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: false,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete (ret as any)._id;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ entity: 1, timestamp: -1 });
auditLogSchema.index({ entityId: 1, timestamp: -1 });
auditLogSchema.index({ actorId: 1, timestamp: -1 });
auditLogSchema.index({ requestId: 1 });
auditLogSchema.index({ action: 1, timestamp: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);