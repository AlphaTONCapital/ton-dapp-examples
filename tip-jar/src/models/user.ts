import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  languageCode?: string;
  walletAddress?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    telegramId: { type: Number, required: true, unique: true, index: true },
    username: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    photoUrl: { type: String },
    languageCode: { type: String },
    walletAddress: { type: String, index: true },
    lastLoginAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
