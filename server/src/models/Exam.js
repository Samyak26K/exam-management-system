import mongoose from 'mongoose';

const examSchema = new mongoose.Schema(
  {
    subjectName: { type: String, required: true, trim: true, maxlength: 100 },
    subjectCode: { type: String, required: true, trim: true, maxlength: 30 },
    academicYear: { type: String, required: true, trim: true, maxlength: 40 },
    section: { type: String, required: true, trim: true, maxlength: 20 },
    examDate: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    venue: { type: String, required: true, trim: true, maxlength: 100 }
  },
  { timestamps: true }
);

export default mongoose.model('Exam', examSchema);
