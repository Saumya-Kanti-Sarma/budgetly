import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  currency: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"]
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    avatar: { type: String },
    currency: {
      type: String,
      default: 'INR'
    },
    refreshToken: {
      type: String,
      select: false
    },
  },
  { timestamps: true }
);
UserSchema.index({ createdAt: -1 })
const User = mongoose.model<IUser>('User', UserSchema);

export default User
