import mongoose, { Schema, Document } from 'mongoose';

export interface FSRSState {
  stability: number;
  difficulty: number;
  due: Date;
  state: 'new' | 'learning' | 'review' | 'relearning';
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
}

export interface IFile extends Document {
  userId: mongoose.Types.ObjectId;
  geminiFileId?: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uri?: string;
  content: string; // Extracted text content
  fsrsState: FSRSState;
  lastReviewedAt?: Date;
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

const FileSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    geminiFileId: {
      type: String,
      required: false,
    },
    fileName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    sizeBytes: {
      type: Number,
      required: true,
    },
    uri: {
      type: String,
      required: false,
    },
    content: {
      type: String,
      required: true,
    },
    fsrsState: {
      type: FSRSStateSchema,
      required: true,
    },
    lastReviewedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
FileSchema.index({ userId: 1, 'fsrsState.due': 1 });

export { FileSchema };

// Create or retrieve File model (with proper mongoose.models check)
const FileModel = mongoose.models?.File as mongoose.Model<IFile> || mongoose.model<IFile>('File', FileSchema);

export default FileModel;
