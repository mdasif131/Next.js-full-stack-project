import mongoose, {Schema, Document} from "mongoose";
export interface IBoard extends Document {
  name: string;
  userId: string;
  columns: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
} 
const BoardSchema = new Schema<IBoard>({
  name: { type: String, required: true },
  userId: { type: String, required: true, index: true }, 
  columns: [{type: Schema.Types.ObjectId, ref:"columns"}]
}, { timestamps: true, versionKey: false }); 

export default mongoose.models.boards || mongoose.model<IBoard>('boards', BoardSchema);