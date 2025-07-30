import jwt from 'jsonwebtoken';
import { generateToken, verifyToken } from '../authService';
import { User } from '../../models/User';
import { createTestUser } from '../../test/setup';

// Mock environment variables
const originalEnv = process.env;
beforeEach(() => {
  process.env = { ...originalEnv };
  process.env.JWT_SECRET = 'test-secret-key';
});

afterEach(() => {
  process.env = originalEnv;
});

describe('AuthService', () => {
  describe('generateToken', () => {
    it('should generate a valid JWT token', async () => {
      const user = await createTestUser(User, {
        googleId: 'google123',
        email: 'test@example.com',
        name: 'Test User',
      });

      const token = generateToken(user);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      // Verify the token can be decoded
      const decoded = jwt.verify(token, 'test-secret-key') as any;
      expect(decoded.id).toBe(user._id.toString());
      expect(decoded.email).toBe(user.email);
      expect(decoded.name).toBe(user.name);
    });

    it('should include user information in token payload', async () => {
      const user = await createTestUser(User, {
        googleId: 'google456',
        email: 'user@example.com',
        name: 'John Doe',
      });

      const token = generateToken(user);
      const decoded = jwt.verify(token, 'test-secret-key') as any;

      expect(decoded).toMatchObject({
        id: user._id.toString(),
        email: 'user@example.com',
        name: 'John Doe',
      });
    });

    it('should set token expiration to 7 days', async () => {
      const user = await createTestUser(User);
      const token = generateToken(user);
      const decoded = jwt.verify(token, 'test-secret-key') as any;

      // Check that exp is set and is approximately 7 days from now
      expect(decoded.exp).toBeDefined();
      const now = Math.floor(Date.now() / 1000);
      const sevenDaysInSeconds = 7 * 24 * 60 * 60;
      expect(decoded.exp).toBeGreaterThan(now + sevenDaysInSeconds - 60); // Allow 1 minute tolerance
      expect(decoded.exp).toBeLessThan(now + sevenDaysInSeconds + 60);
    });

    it('should use JWT_SECRET from environment', async () => {
      process.env.JWT_SECRET = 'custom-secret-key';
      const user = await createTestUser(User);
      
      const token = generateToken(user);
      
      // Should work with custom secret
      expect(() => jwt.verify(token, 'custom-secret-key')).not.toThrow();
      
      // Should fail with wrong secret
      expect(() => jwt.verify(token, 'wrong-secret')).toThrow();
    });

    it('should fallback to default secret if JWT_SECRET not set', async () => {
      delete process.env.JWT_SECRET;
      const user = await createTestUser(User);
      
      const token = generateToken(user);
      
      // Should work with default secret
      expect(() => jwt.verify(token, 'your-secret-key')).not.toThrow();
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      const user = await createTestUser(User);
      const token = generateToken(user);

      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect((decoded as any).id).toBe(user._id.toString());
      expect((decoded as any).email).toBe(user.email);
      expect((decoded as any).name).toBe(user.name);
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const result = verifyToken(invalidToken);

      expect(result).toBeNull();
    });

    it('should return null for expired token', async () => {
      const user = await createTestUser(User);
      
      // Create a token that expires immediately
      const expiredToken = jwt.sign(
        {
          id: user._id,
          email: user.email,
          name: user.name,
        },
        'test-secret-key',
        { expiresIn: '0s' }
      );

      // Wait a moment for token to expire
      await new Promise(resolve => setTimeout(resolve, 100));

      const result = verifyToken(expiredToken);

      expect(result).toBeNull();
    });

    it('should return null for token with wrong secret', async () => {
      const user = await createTestUser(User);
      
      // Create token with different secret
      const wrongSecretToken = jwt.sign(
        {
          id: user._id,
          email: user.email,
          name: user.name,
        },
        'wrong-secret-key',
        { expiresIn: '7d' }
      );

      const result = verifyToken(wrongSecretToken);

      expect(result).toBeNull();
    });

    it('should return null for malformed token', () => {
      const malformedToken = 'not.a.valid.jwt.token';
      const result = verifyToken(malformedToken);

      expect(result).toBeNull();
    });

    it('should return null for empty token', () => {
      const result = verifyToken('');

      expect(result).toBeNull();
    });

    it('should handle tokens with missing payload fields', async () => {
      const incompleteToken = jwt.sign(
        { id: 'some-id' }, // Missing email and name
        'test-secret-key',
        { expiresIn: '7d' }
      );

      const result = verifyToken(incompleteToken);

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect((result as any).id).toBe('some-id');
      expect((result as any).email).toBeUndefined();
      expect((result as any).name).toBeUndefined();
    });
  });

  describe('Token Security', () => {
    it('should not include sensitive user data in token', async () => {
      const user = await createTestUser(User, {
        googleId: 'sensitive-google-id',
        email: 'user@example.com',
        name: 'User Name',
        picture: 'https://example.com/avatar.jpg',
      });

      const token = generateToken(user);
      const decoded = jwt.verify(token, 'test-secret-key') as any;

      // Should only include id, email, and name
      expect(decoded).toHaveProperty('id');
      expect(decoded).toHaveProperty('email');
      expect(decoded).toHaveProperty('name');
      expect(decoded).toHaveProperty('exp');
      expect(decoded).toHaveProperty('iat');

      // Should not include sensitive fields
      expect(decoded).not.toHaveProperty('googleId');
      expect(decoded).not.toHaveProperty('picture');
      expect(decoded).not.toHaveProperty('createdAt');
      expect(decoded).not.toHaveProperty('updatedAt');
    });

    it('should use secure token structure', async () => {
      const user = await createTestUser(User);
      const token = generateToken(user);

      // Verify token has three parts (header.payload.signature)
      const parts = token.split('.');
      expect(parts).toHaveLength(3);

      // Verify header contains correct algorithm
      const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
      expect(header.alg).toBe('HS256');
      expect(header.typ).toBe('JWT');
    });
  });
}); 