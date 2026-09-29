import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 80 },
    capacity: { type: Number, required: true, min: 1, validate: Number.isInteger }
  },
  { timestamps: true }
);

export default mongoose.model('Room', roomSchema);