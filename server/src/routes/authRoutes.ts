import express from 'express';
import passport from 'passport';
import { generateToken } from '../services/authService';
import { User } from '../models/User';
import { OAuth2Client } from 'google-auth-library';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  }
);

// Handle Google OAuth token
router.post('/google', async (req, res) => {
  try {
    const { credential, isSignUp = false } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'No credential provided' });
    }

    // Verify the token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Find existing user
    let user = await User.findOne({ googleId: payload.sub });
    const isNewUser = !user;
    
    // Handle sign-in vs sign-up logic
    if (isSignUp) {
      // Sign-up flow: Create new user if doesn't exist
      if (!user) {
        user = await User.create({
          googleId: payload.sub,
          email: payload.email,
          name: payload.name,
          displayName: payload.name,
          picture: payload.picture,
          isNewUser: true,
        });
      } else {
        // User already exists during sign-up
        return res.status(409).json({ 
          message: 'Account already exists. Please sign in instead.',
          isExistingUser: true 
        });
      }
    } else {
      // Sign-in flow: Only allow existing users
      if (!user) {
        return res.status(404).json({ 
          message: 'Account not found. Please sign up first.',
          isNewUser: true 
        });
      }
    }

    const token = generateToken(user);
    res.json({ 
      token, 
      isNewUser,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        displayName: user.displayName,
        picture: user.picture,
        isNewUser: user.isNewUser,
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
});

// Complete user profile setup (for new users)
router.post('/setup-profile', authenticateToken, async (req, res) => {
  try {
    const { displayName, bio, timezone, language, preferences } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        displayName,
        bio,
        timezone,
        language,
        preferences,
        isNewUser: false,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        displayName: user.displayName,
        picture: user.picture,
        bio: user.bio,
        timezone: user.timezone,
        language: user.language,
        preferences: user.preferences,
        isNewUser: user.isNewUser,
      }
    });
  } catch (error) {
    console.error('Profile setup error:', error);
    res.status(500).json({ message: 'Profile setup failed' });
  }
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  res.json(req.user);
});

export default router; 