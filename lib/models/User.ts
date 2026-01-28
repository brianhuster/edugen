import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  emailNotifications: boolean;
  notificationTime: string;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    notificationTime: {
      type: String,
      default: '09:00',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export { UserSchema };

// Create or retrieve User model (with proper mongoose.models check)
const UserModel = mongoose.models?.User as mongoose.Model<IUser> || mongoose.model<IUser>('User', UserSchema);

export default UserModel;
