import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import { config } from '../config';

const router = Router();

router.get('/seed', async (req: Request, res: Response) => {
  try {

    const results = {
      admin: { exists: false, created: false },
      reviewer: { exists: false, created: false },
    };
    const existingAdmin = await User.findOne({ name: 'admin' });
    if (existingAdmin) {
      results.admin.exists = true;
      logger.info('Admin user already exists');
    } else {
      const adminPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'admin',
        role: 'admin',
        credentials: adminPassword,
      });
      results.admin.created = true;
      logger.info('Admin user created');
    }

    const existingReviewer = await User.findOne({ name: 'reviewer' });
    if (existingReviewer) {
      results.reviewer.exists = true;
      logger.info('Reviewer user already exists');
    } else {
      const reviewerPassword = await bcrypt.hash('reviewer123', 10);
      await User.create({
        name: 'reviewer',
        role: 'reviewer',
        credentials: reviewerPassword,
      });
      results.reviewer.created = true;
      logger.info('Reviewer user created');
    }

    res.json({
      success: true,
      message: 'Seed completed',
      results
    });
  } catch (error) {
    logger.error('Seed failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      error: {
        code: 'SEED_FAILED',
        message: error instanceof Error ? error.message : 'Seed failed',
      },
    });
  }
});

export { router as seedRouter };