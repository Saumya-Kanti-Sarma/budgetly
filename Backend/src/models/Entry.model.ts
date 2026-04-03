import mongoose, { Document, Schema } from 'mongoose';

export type Category =
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Health'
  | 'Entertainment'
  | 'Utilities'
  | 'Other';

export interface IEntry extends Document {
  userId: mongoose.Types.ObjectId;
  monthKey: string;
  day: number;
  description: string;
  category: Category;
  amount: number;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EntrySchema = new Schema<IEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    monthKey: { type: String, required: true, index: true },
    day: { type: Number, required: true, min: 1, max: 31 },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Utilities', 'Other'],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

EntrySchema.index({ userId: 1, monthKey: 1, day: 1 });

export const Entry = mongoose.model<IEntry>('Entry', EntrySchema);
