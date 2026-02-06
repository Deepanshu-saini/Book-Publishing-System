import { Response, NextFunction } from 'express';
import { Book } from '../models/Book';
import { AuthenticatedRequest } from '../middleware/auth';
import { createBookSchema, updateBookSchema, paginationSchema } from '../validation/schemas';
import { AuditService } from '../services/auditService';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class BookController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { limit, cursor } = paginationSchema.parse(req.query);
      
      const query: any = {};
      if (cursor) {
        try {
          const cursorData = JSON.parse(Buffer.from(cursor, 'base64').toString());
          query._id = { $lt: cursorData.id };
        } catch (error) {
          throw createError('Invalid cursor format', 400, 'INVALID_CURSOR');
        }
      }
      
      const books = await Book.find(query)
        .sort({ _id: -1 })
        .limit(limit + 1)
        .lean();
      
      const hasNext = books.length > limit;
      if (hasNext) books.pop();
      
      let nextCursor: string | undefined;
      if (hasNext && books.length > 0) {
        const lastBook = books[books.length - 1];
        if (lastBook) {
          nextCursor = Buffer.from(JSON.stringify({ id: lastBook._id })).toString('base64');
        }
      }
      
      res.json({
        items: books.map(book => ({
          ...book,
          id: book._id,
          _id: undefined,
          __v: undefined,
        })),
        nextCursor,
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookData = createBookSchema.parse(req.body);
      
      const book = new Book({
        ...bookData,
        createdBy: req.user!.id,
      });
      
      await book.save();
      
      await AuditService.createAuditLog({
        entity: 'Book',
        entityId: book._id.toString(),
        action: 'create',
        after: book.toObject(),
      });
      
      logger.info('Book created', {
        bookId: book._id,
        title: book.title,
        createdBy: req.user!.id,
      });
      
      res.status(201).json({ id: book._id });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const book = await Book.findById(id);
      if (!book) {
        throw createError('Book not found', 404, 'BOOK_NOT_FOUND');
      }
      
      res.json(book);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = updateBookSchema.parse(req.body);
      
      const book = await Book.findById(id);
      if (!book) {
        throw createError('Book not found', 404, 'BOOK_NOT_FOUND');
      }
      
      const beforeUpdate = book.toObject();
      
      Object.assign(book, updateData, { updatedBy: req.user!.id });
      await book.save();
      await AuditService.createAuditLog({
        entity: 'Book',
        entityId: book._id.toString(),
        action: 'update',
        before: beforeUpdate,
        after: book.toObject(),
      });
      
      logger.info('Book updated', {
        bookId: book._id,
        updatedBy: req.user!.id,
      });
      
      res.json(book);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw createError('Book ID is required', 400, 'MISSING_ID');
      }
      
      const book = await Book.findById(id);
      if (!book) {
        throw createError('Book not found', 404, 'BOOK_NOT_FOUND');
      }
      
      const beforeDelete = book.toObject();
      await Book.findByIdAndDelete(id);
      await AuditService.createAuditLog({
        entity: 'Book',
        entityId: id,
        action: 'delete',
        before: beforeDelete,
      });
      
      logger.info('Book deleted', {
        bookId: id,
        deletedBy: req.user!.id,
      });
      
      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  }
}