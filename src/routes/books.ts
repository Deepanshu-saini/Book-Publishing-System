import { Router } from 'express';
import { BookController } from '../controllers/bookController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', requireRole(['admin', 'reviewer']), BookController.list);
router.post('/', requireRole(['admin', 'reviewer']), BookController.create);
router.get('/:id', requireRole(['admin', 'reviewer']), BookController.getById);
router.patch('/:id', requireRole(['admin', 'reviewer']), BookController.update);
router.delete('/:id', requireRole(['admin', 'reviewer']), BookController.delete);

export { router as booksRouter };