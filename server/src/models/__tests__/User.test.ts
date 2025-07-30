import mongoose from 'mongoose';
import { User, IUser } from '../User';

describe('User Model', () => {
  describe('Schema Validation', () => {
    it('should create a valid user with required fields', async () => {
      const validUser = {
        googleId: 'google123',
        email: 'test@example.com',
        name: 'Test User',
      };

      const user = new User(validUser);
      const savedUser = await user.save();

      expect(savedUser.googleId).toBe(validUser.googleId);
      expect(savedUser.email).toBe(validUser.email);
      expect(savedUser.name).toBe(validUser.name);
      expect(savedUser._id).toBeDefined();
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    it('should create a user with optional picture field', async () => {
      const userWithPicture = {
        googleId: 'google456',
        email: 'test2@example.com',
        name: 'Test User 2',
        picture: 'https://example.com/avatar.jpg',
      };

      const user = new User(userWithPicture);
      const savedUser = await user.save();

      expect(savedUser.picture).toBe(userWithPicture.picture);
    });

    it('should require googleId field', async () => {
      const userWithoutGoogleId = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const user = new User(userWithoutGoogleId);
      let error: any;
      
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.googleId).toBeDefined();
    });

    it('should require email field', async () => {
      const userWithoutEmail = {
        googleId: 'google123',
        name: 'Test User',
      };

      const user = new User(userWithoutEmail);
      let error: any;
      
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
    });

    it('should require name field', async () => {
      const userWithoutName = {
        googleId: 'google123',
        email: 'test@example.com',
      };

      const user = new User(userWithoutName);
      let error: any;
      
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.name).toBeDefined();
    });

    it('should enforce unique googleId constraint', async () => {
      const user1 = new User({
        googleId: 'duplicate123',
        email: 'test1@example.com',
        name: 'Test User 1',
      });

      const user2 = new User({
        googleId: 'duplicate123',
        email: 'test2@example.com',
        name: 'Test User 2',
      });

      await user1.save();
      
      let error: any;
      try {
        await user2.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // MongoDB duplicate key error
    });

    it('should enforce unique email constraint', async () => {
      const user1 = new User({
        googleId: 'google1',
        email: 'duplicate@example.com',
        name: 'Test User 1',
      });

      const user2 = new User({
        googleId: 'google2',
        email: 'duplicate@example.com',
        name: 'Test User 2',
      });

      await user1.save();
      
      let error: any;
      try {
        await user2.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // MongoDB duplicate key error
    });
  });

  describe('Model Methods', () => {
    it('should find user by googleId', async () => {
      const userData = {
        googleId: 'findme123',
        email: 'findme@example.com',
        name: 'Find Me User',
      };

      await User.create(userData);
      const foundUser = await User.findOne({ googleId: 'findme123' });

      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toBe(userData.email);
      expect(foundUser?.name).toBe(userData.name);
    });

    it('should find user by email', async () => {
      const userData = {
        googleId: 'email123',
        email: 'findbyemail@example.com',
        name: 'Email User',
      };

      await User.create(userData);
      const foundUser = await User.findOne({ email: 'findbyemail@example.com' });

      expect(foundUser).toBeDefined();
      expect(foundUser?.googleId).toBe(userData.googleId);
      expect(foundUser?.name).toBe(userData.name);
    });

    it('should update user information', async () => {
      const user = await User.create({
        googleId: 'update123',
        email: 'update@example.com',
        name: 'Original Name',
      });

      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { name: 'Updated Name' },
        { new: true }
      );

      expect(updatedUser?.name).toBe('Updated Name');
      expect(updatedUser?.email).toBe('update@example.com'); // Should remain unchanged
    });

    it('should delete user', async () => {
      const user = await User.create({
        googleId: 'delete123',
        email: 'delete@example.com',
        name: 'Delete Me',
      });

      await User.findByIdAndDelete(user._id);
      const deletedUser = await User.findById(user._id);

      expect(deletedUser).toBeNull();
    });
  });
}); 