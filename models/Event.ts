import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  _id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  organizer: mongoose.Types.ObjectId;
  attendees: mongoose.Types.ObjectId[];
  maxAttendees?: number;
  isPublic: boolean;
  category: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  organizer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  attendees: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  maxAttendees: {
    type: Number,
    default: null,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['conference', 'workshop', 'meetup', 'webinar', 'social', 'other'],
  },
  images: [{
    type: String,
  }],
}, {
  timestamps: true,
});

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);