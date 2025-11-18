import mongoose, { Schema, model, models } from 'mongoose';

// User Model
const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// File Model
const FileSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  content: { type: String, required: true }, // Extracted text
  size: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

// Conversation Model
const ConversationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Message Model
const MessageSchema = new Schema({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  role: { type: String, required: true, enum: ['user', 'assistant'] },
  content: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed }, // For questions, mode, etc.
  createdAt: { type: Date, default: Date.now },
});

export const User = models.User || model('User', UserSchema);
export const File = models.File || model('File', FileSchema);
export const Conversation = models.Conversation || model('Conversation', ConversationSchema);
export const Message = models.Message || model('Message', MessageSchema);
