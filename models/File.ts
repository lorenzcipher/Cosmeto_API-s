import mongoose, { Document, Schema } from 'mongoose';

export interface IFile extends Document {
  _id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  uploadedBy: mongoose.Types.ObjectId;
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const FileSchema = new Schema<IFile>({
  filename: {
    type: String,
    required: true,
    unique: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  mimetype: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  tags: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
});

export default mongoose.models.File || mongoose.model<IFile>('File', FileSchema);