import { z } from 'zod';

const configSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/book-publishing'),
  JWT_SECRET: z.string().default('your-super-secret-jwt-key-change-in-production'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  LOG_TRANSPORT: z.enum(['file', 'elastic', 'logtail']).default('file'),
  LOG_FILE_PATH: z.string().default('./logs/app.log'),
  ELASTIC_URL: z.string().optional(),
  LOGTAIL_TOKEN: z.string().optional(),
});

const env = configSchema.parse(process.env);

export const config = {
  port: parseInt(env.PORT, 10),
  nodeEnv: env.NODE_ENV,
  mongodbUri: env.MONGODB_URI,
  jwtSecret: env.JWT_SECRET,
  log: {
    level: env.LOG_LEVEL,
    transport: env.LOG_TRANSPORT,
    filePath: env.LOG_FILE_PATH,
    elasticUrl: env.ELASTIC_URL,
    logtailToken: env.LOGTAIL_TOKEN,
  },
} as const;

// Audit configuration - easily extendable for new entities
export const auditConfig = {
  Book: {
    track: true,
    exclude: ['updatedAt'],
    redact: [] as string[],
  },
  User: {
    track: true,
    exclude: ['credentials', 'updatedAt'],
    redact: ['credentials'],
  },
} as const;

export type AuditableEntity = keyof typeof auditConfig;