import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type PollStatus = 'active' | 'closed' | 'settled';
export type PollChoice = 'yes' | 'no';

export interface IPoll extends Document {
  question: string;
  createdBy: Types.ObjectId;
  deadline: Date;
  status: PollStatus;
  result?: PollChoice;
  yesPool: string; // in nanoTON (stored as string for precision)
  noPool: string;
  createdAt: Date;
  updatedAt: Date;
}

const PollSchema = new Schema<IPoll>(
  {
    question: { type: String, required: true, maxlength: 280 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ['active', 'closed', 'settled'],
      default: 'active',
    },
    result: { type: String, enum: ['yes', 'no'] },
    yesPool: { type: String, default: '0' },
    noPool: { type: String, default: '0' },
  },
  {
    timestamps: true,
  }
);

// Index for querying active polls
PollSchema.index({ status: 1, deadline: 1 });

export const Poll: Model<IPoll> =
  mongoose.models.Poll || mongoose.model<IPoll>('Poll', PollSchema);
