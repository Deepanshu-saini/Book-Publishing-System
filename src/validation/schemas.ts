import { z } from 'zod';

// Book schemas
export const createBookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  authors: z.string().min(1, 'Authors is required').max(500, 'Authors too long'),
  publishedBy: z.string().min(1, 'Publisher is required').max(100, 'Publisher name too long'),
});

export const updateBookSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  authors: z.string().min(1).max(500).optional(),
  publishedBy: z.string().min(1).max(100).optional(),
});

// User schemas
export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  role: z.enum(['admin', 'reviewer'], { required_error: 'Role is required' }),
  credentials: z.string().min(6, 'Credentials must be at least 6 characters'),
});

export const loginSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  credentials: z.string().min(1, 'Credentials is required'),
});

// Query schemas
export const paginationSchema = z.object({
  limit: z.string().optional().transform(val => {
    if (!val) return 20;
    const num = parseInt(val, 10);
    return isNaN(num) ? 20 : Math.min(Math.max(num, 1), 100);
  }),
  cursor: z.string().optional(),
});

export const auditFiltersSchema = z.object({
  from: z.string().optional().transform(val => val ? new Date(val) : undefined),
  to: z.string().optional().transform(val => val ? new Date(val) : undefined),
  entity: z.string().optional(),
  entityId: z.string().optional(),
  actorId: z.string().optional(),
  action: z.enum(['create', 'update', 'delete', 'restore', 'login']).optional(),
  fieldsChanged: z.string().optional().transform(val => 
    val ? val.split(',').map(s => s.trim()).filter(Boolean) : undefined
  ),
  requestId: z.string().optional(),
  limit: z.string().optional().transform(val => {
    if (!val) return 20;
    const num = parseInt(val, 10);
    return isNaN(num) ? 20 : Math.min(Math.max(num, 1), 100);
  }),
  cursor: z.string().optional(),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PaginationQuery = z.infer<typeof paginationSchema>;
export type AuditFiltersQuery = z.infer<typeof auditFiltersSchema>;