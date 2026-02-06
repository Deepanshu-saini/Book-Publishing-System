import { Router } from 'express';
import { BookController } from '../controllers/bookController';

const router = Router();

// Both admin and reviewer can access books
router.get('/', BookController.list);
router.post('/', BookController.create);
router.get('/:id', BookController.getById);
router.patch('/:id', BookController.update);
router.delete('/:id', BookController.delete);

export { router as booksRouter };