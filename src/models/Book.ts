import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBook extends Document {
  _id: Types.ObjectId;
  title: string;
  authors: string;
  createdBy: string;
  publishedBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    authors: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    createdBy: {
      type: String,
      required: true,
      ref: 'User',
    },
    publishedBy: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    updatedBy: {
      type: String,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete (ret as any)._id;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

bookSchema.index({ title: 1 });
bookSchema.index({ authors: 1 });
bookSchema.index({ createdBy: 1 });
bookSchema.index({ createdAt: -1 });

export const Book = mongoose.model<IBook>('Book', bookSchema);