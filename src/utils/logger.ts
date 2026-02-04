import pino from 'pino';
import { config } from '../config';

// Create transport based on configuration
const createTransport = () => {
  switch (config.log.transport) {
    case 'file':
      return pino.transport({
        target: 'pino/file',
        options: {
          destination: config.log.filePath,
          mkdir: true,
        },
      });
    
    case 'elastic':
      if (!config.log.elasticUrl) {
        throw new Error('ELASTIC_URL is required when LOG_TRANSPORT=elastic');
      }
      return pino.transport({
        target: '@elastic/ecs-pino-format',
        options: {
          elasticsearchUrl: config.log.elasticUrl,
        },
      });
    
    case 'logtail':
      if (!config.log.logtailToken) {
        throw new Error('LOGTAIL_TOKEN is required when LOG_TRANSPORT=logtail');
      }
      return pino.transport({
        target: '@logtail/pino',
        options: {
          sourceToken: config.log.logtailToken,
        },
      });
    
    default:
      return pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
        },
      });
  }
};

export const logger = pino(
  {
    level: config.log.level,
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => ({ level: label }),
    },
    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
        headers: {
          'user-agent': req.headers['user-agent'],
          'content-type': req.headers['content-type'],
        },
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      }),
    },
  },
  config.nodeEnv === 'development' 
    ? pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
        },
      })
    : createTransport()
);

export const createChildLogger = (context: Record<string, any>) => {
  return logger.child(context);
};