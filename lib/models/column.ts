import mongoose, {Schema, Document} from "mongoose";
export interface IColumn extends Document {
  name: string;
  boardId: mongoose.Types.ObjectId;
  order: number;
  jobApplications: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
} 
const ColumnSchema = new Schema<IColumn>(
  {
    name: { type: String, required: true },
    boardId: {
      type: Schema.Types.ObjectId,
      ref: 'boards',
      required: true,
      index: true,
    },
    order: { type: Number, required: true, default: 0 },
    jobApplications: [{ type: Schema.Types.ObjectId, ref: 'JobApplication' }],
  },
  { timestamps: true, versionKey: false },
);  
export default mongoose.models.columns || mongoose.model<IColumn>('columns', ColumnSchema);