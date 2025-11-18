import mongoose, { Schema, Document } from 'mongoose';

export interface IFile extends Document {
  userId: mongoose.Types.ObjectId;
  geminiFileId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uri: string;
  createdAt: Date;
  updatedAt: Date;
}

const FileSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    geminiFileId: {
      type: String,
      required: true,
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
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.File || mongoose.model<IFile>('File', FileSchema);
