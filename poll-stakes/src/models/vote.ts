import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import type { PollChoice } from './poll';

export interface IVote extends Document {
  poll: Types.ObjectId;
  user: Types.ObjectId;
  userUsername?: string;
  userFirstName?: string;
  choice: PollChoice;
  amount: string; // staked amount in nanoTON
  txHash: string;
  payout?: string; // winnings in nanoTON (if won)
  payoutTxHash?: string;
  createdAt: Date;
}

const VoteSchema = new Schema<IVote>(
  {
    poll: { type: Schema.Types.ObjectId, ref: 'Poll', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userUsername: { type: String },
    userFirstName: { type: String },
    choice: { type: String, enum: ['yes', 'no'], required: true },
    amount: { type: String, required: true },
    txHash: { type: String, required: true, unique: true },
    payout: { type: String },
    payoutTxHash: { type: String },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent double voting
VoteSchema.index({ poll: 1, user: 1 }, { unique: true });

export const Vote: Model<IVote> =
  mongoose.models.Vote || mongoose.model<IVote>('Vote', VoteSchema);
