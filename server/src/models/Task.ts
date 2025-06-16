import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    userId: {
      type: String,
      required: true,
      index: true, // Index for faster queries
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
      index: true, // Index for filtering completed tasks
    },
    dueDate: {
      type: Date,
      index: true, // Index for sorting by due date
    },
    category: {
      type: String,
      trim: true,
      index: true, // Index for category-based queries
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
  }
);

// Compound index for common query patterns
TaskSchema.index({ userId: 1, completed: 1 });
TaskSchema.index({ userId: 1, dueDate: 1 });
TaskSchema.index({ userId: 1, category: 1 });

// Add text index for search functionality
TaskSchema.index({ title: 'text', description: 'text' });

// Log when a task is saved
TaskSchema.pre('save', function(next) {
  console.log('Saving task:', this.toObject());
  next();
});

export const Task = mongoose.model<ITask>('Task', TaskSchema); 