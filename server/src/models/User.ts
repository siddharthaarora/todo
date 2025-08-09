import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  googleId: string;
  email: string;
  name: string;
  displayName?: string;
  picture?: string;
  bio?: string;
  timezone?: string;
  language?: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      email: boolean;
      push: boolean;
      taskReminders: boolean;
    };
    defaultCategories: string[];
    reminderFrequency: 'daily' | 'weekly' | 'monthly';
  };
  isNewUser: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
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
    displayName: {
      type: String,
    },
    picture: {
      type: String,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    language: {
      type: String,
      default: 'en',
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'auto',
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        push: {
          type: Boolean,
          default: true,
        },
        taskReminders: {
          type: Boolean,
          default: true,
        },
      },
      defaultCategories: [{
        type: String,
        default: ['Work', 'Personal', 'Shopping', 'Health'],
      }],
      reminderFrequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'daily',
      },
    },
    isNewUser: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', UserSchema); 