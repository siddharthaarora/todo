import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer;

// Setup MongoDB Memory Server
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

// Clean up after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.connection.close();
  await mongod.stop();
});

// Global test utilities
export const createTestUser = async (User: any, userData = {}) => {
  const defaultUser = {
    googleId: 'test-google-id',
    email: 'test@example.com',
    name: 'Test User',
    ...userData,
  };
  return await User.create(defaultUser);
};

export const createTestTask = async (Task: any, taskData = {}) => {
  const defaultTask = {
    title: 'Test Task',
    description: 'Test Description',
    category: 'work',
    dueDate: '2024-12-31',
    completed: false,
    userId: 'test-user-id',
    ...taskData,
  };
  return await Task.create(defaultTask);
}; 