import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect("mongodb://localhost:27017/book-publishing");
    } catch (error) {
    console.log("failed to connect to db");
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
  } catch (error) {
    console.log('Error disconnecting from MongoDB');
  }
};