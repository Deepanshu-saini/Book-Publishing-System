import { app } from './app';

const startServer = async (): Promise<void> => {
  try {
    app.listen(3000, () => {
      console.log("server start")
    });
  } catch (error) {
    console.log('Failed to start server');
    process.exit(1);
  }
};

startServer();