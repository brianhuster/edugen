import mongoose, { Schema, Document } from 'mongoose';
import { FSRSState } from './File';

export type Rating = 1 | 2 | 3 | 4; // Again, Hard, Good, Easy

export interface IReviewHistory extends Document {
  userId: mongoose.Types.ObjectId;
  fileId: mongoose.Types.ObjectId;
  reviewedAt: Date;
  rating: Rating;
  oldFsrsState: FSRSState;
  newFsrsState: FSRSState;
  createdAt: Date;
  updatedAt: Date;
}

const FSRSStateSchema = new Schema({
  stability: { type: Number, required: true },
  difficulty: { type: Number, required: true },
  due: { type: Date, required: true },
  state: { 
    type: String, 
    enum: ['new', 'learning', 'review', 'relearning'],
    required: true 
  },
  elapsed_days: { type: Number, required: true },
  scheduled_days: { type: Number, required: true },
  reps: { type: Number, required: true },
  lapses: { type: Number, required: true },
}, { _id: false });

const ReviewHistorySchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileId: {
      type: Schema.Types.ObjectId,
      ref: 'File',
      required: true,
      index: true,
    },
    reviewedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },
    oldFsrsState: {
      type: FSRSStateSchema,
      required: true,
    },
    newFsrsState: {
      type: FSRSStateSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
ReviewHistorySchema.index({ userId: 1, fileId: 1, reviewedAt: -1 });

export { ReviewHistorySchema };

// Create or retrieve ReviewHistory model (with proper mongoose.models check)
const ReviewHistoryModel = mongoose.models?.ReviewHistory as mongoose.Model<IReviewHistory> || mongoose.model<IReviewHistory>('ReviewHistory', ReviewHistorySchema);

export default ReviewHistoryModel;
