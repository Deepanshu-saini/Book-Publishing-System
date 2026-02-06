import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';

export interface RequestContext {
  requestId: string;
  userId?: string | undefined;
  userRole?: string | undefined;
}

export const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export const getRequestContext = (): RequestContext | undefined => {
  return asyncLocalStorage.getStore();
};

export const createRequestContext = (userId?: string | undefined, userRole?: string | undefined): RequestContext => {
  return {
    requestId: randomUUID(),
    userId,
    userRole,
  };
};

export const runWithContext = <T>(context: RequestContext, fn: () => T): T => {
  return asyncLocalStorage.run(context, fn);
};