import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ITip extends Document {
  from: Types.ObjectId;
  fromUsername?: string;
  fromFirstName?: string;
  amount: string; // in nanoTON (stored as string for precision)
  message?: string;
  txHash: string;
  createdAt: Date;
}

const TipSchema = new Schema<ITip>(
  {
    from: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fromUsername: { type: String },
    fromFirstName: { type: String },
    amount: { type: String, required: true },
    message: { type: String, maxlength: 280 },
    txHash: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

// Index for leaderboard aggregation
TipSchema.index({ from: 1, amount: 1 });

export const Tip: Model<ITip> =
  mongoose.models.Tip || mongoose.model<ITip>('Tip', TipSchema);
