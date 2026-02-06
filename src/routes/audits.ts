import { Router } from 'express';
import { AuditController } from '../controllers/auditController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// All audit routes require authentication and admin role
router.use(authenticate);
router.use(requireRole(['admin']));

router.get('/', AuditController.list);
router.get('/:id', AuditController.getById);

export { router as auditsRouter };