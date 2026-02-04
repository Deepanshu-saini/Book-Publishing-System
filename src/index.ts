import { app } from './app';
import { connectDatabase } from './database/connection';

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    app.listen(3000, () => {
      console.log("server start")
    });
  } catch (error) {
    console.log('Failed to start server');
    process.exit(1);
  }
};

startServer();