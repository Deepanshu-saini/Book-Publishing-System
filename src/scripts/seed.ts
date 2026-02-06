import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from '../database/connection';
import { User } from '../models/User';
import { Book } from '../models/Book';
import { logger } from '../utils/logger';

const seedData = async (): Promise<void> => {
  try {
    await connectDatabase();
    
    // Clear existing data
    await User.deleteMany({});
    await Book.deleteMany({});
    
    logger.info('Cleared existing data');
    
    // Create users
    const adminPassword = await bcrypt.hash('admin123', 10);
    const reviewerPassword = await bcrypt.hash('reviewer123', 10);
    
    const admin = await User.create({
      name: 'admin',
      role: 'admin',
      credentials: adminPassword,
    });
    
    const reviewer = await User.create({
      name: 'reviewer',
      role: 'reviewer',
      credentials: reviewerPassword,
    });
    
    logger.info('Created users', {
      admin: { id: admin._id, name: admin.name },
      reviewer: { id: reviewer._id, name: reviewer.name },
    });
    
    // Create sample books
    const books = await Book.create([
      {
        title: 'The Art of Clean Code',
        authors: 'Robert C. Martin',
        publishedBy: 'Prentice Hall',
        createdBy: admin._id,
      },
      {
        title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
        authors: 'Gang of Four',
        publishedBy: 'Addison-Wesley',
        createdBy: reviewer._id,
      },
      {
        title: 'Refactoring: Improving the Design of Existing Code',
        authors: 'Martin Fowler',
        publishedBy: 'Addison-Wesley',
        createdBy: admin._id,
      },
    ]);
    
    logger.info('Created sample books', {
      count: books.length,
      books: books.map(book => ({ id: book._id, title: book.title })),
    });
    
    console.log('\n=== SEED DATA CREATED ===');
    console.log('\nUsers:');
    console.log('Admin - name: admin, password: admin123');
    console.log('Reviewer - name: reviewer, password: reviewer123');
    console.log('\nSample books created:', books.length);
    console.log('\n=== READY TO USE ===\n');
    
  } catch (error) {
    logger.error('Seed failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
};

seedData();