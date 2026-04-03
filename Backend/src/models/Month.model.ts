import mongoose, { Document, Schema } from 'mongoose';

export interface ICategoryBreakdown {
  category: string;
  total: number;
}

export interface IMonth extends Document {
  userId: mongoose.Types.ObjectId;
  monthKey: string;
  label: string;
  totalSpending: number;
  topCategory: string;
  categoryBreakdown: ICategoryBreakdown[];
  entryCount: number;
  lastSummary?: string;
  summaryGeneratedAt?: Date;
}

const MonthSchema = new Schema<IMonth>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    monthKey: { type: String, required: true },
    label: { type: String, required: true },
    totalSpending: { type: Number, default: 0 },
    topCategory: { type: String, default: '' },
    categoryBreakdown: [{ category: String, total: Number }],
    entryCount: { type: Number, default: 0 },
    lastSummary: { type: String },
    summaryGeneratedAt: { type: Date },
  },
  { timestamps: true }
);

MonthSchema.index({ userId: 1, monthKey: 1 }, { unique: true });
const Month = mongoose.model<IMonth>('Month', MonthSchema);
export default Month
