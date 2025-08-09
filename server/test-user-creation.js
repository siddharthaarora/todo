const mongoose = require('mongoose');
require('dotenv').config();

// User Schema (same as in the main app)
const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', UserSchema);

async function testUserCreation() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/todo');
    console.log('Connected to MongoDB');

    // Test creating a user
    const testUser = new User({
      googleId: 'test-google-id-123',
      email: 'test@example.com',
      name: 'Test User',
      picture: 'https://example.com/avatar.jpg',
    });

    await testUser.save();
    console.log('Test user created successfully:', testUser);

    // Test finding the user
    const foundUser = await User.findOne({ googleId: 'test-google-id-123' });
    console.log('Found user:', foundUser);

    // Test finding by email
    const userByEmail = await User.findOne({ email: 'test@example.com' });
    console.log('User found by email:', userByEmail);

    // List all users
    const allUsers = await User.find({});
    console.log('All users in database:', allUsers);

    console.log('✅ All tests passed! User creation and retrieval working correctly.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testUserCreation(); 