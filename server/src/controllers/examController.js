import Exam from '../models/Exam.js';

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function isValidTime(value) {
  if (!/^\d{2}:\d{2}$/.test(value)) return false;
  const [hours, minutes] = value.split(':').map(Number);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

export function validateExam(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Exam data must be an object';
  const requiredFields = ['subjectName', 'subjectCode', 'academicYear', 'section', 'examDate', 'startTime', 'endTime', 'venue'];
  if (requiredFields.some((field) => !body[field]?.toString().trim())) return 'All exam fields are required';
  if (!isValidDate(body.examDate)) return 'Exam date must be a real calendar date';
  if (!isValidTime(body.startTime) || !isValidTime(body.endTime)) return 'Times must use HH:mm format';
  if (body.endTime <= body.startTime) return 'End time must be after start time';
  return null;
}

export async function listExams(request, response, next) {
  try {
    const filter = request.user.role === 'student'
      ? { academicYear: request.user.academicYear, section: request.user.section }
      : {};
    response.json({ exams: await Exam.find(filter).sort({ examDate: 1, startTime: 1 }) });
  } catch (error) { next(error); }
}

export async function createExam(request, response, next) {
  try {
    const validationError = validateExam(request.body);
    if (validationError) return response.status(400).json({ message: validationError });
    response.status(201).json({ exam: await Exam.create(request.body) });
  } catch (error) { next(error); }
}

export async function updateExam(request, response, next) {
  try {
    const validationError = validateExam(request.body);
    if (validationError) return response.status(400).json({ message: validationError });
    const exam = await Exam.findByIdAndUpdate(request.params.id, request.body, { new: true, runValidators: true });
    if (!exam) return response.status(404).json({ message: 'Exam not found' });
    response.json({ exam });
  } catch (error) { next(error); }
}

export async function deleteExam(request, response, next) {
  try {
    const exam = await Exam.findByIdAndDelete(request.params.id);
    if (!exam) return response.status(404).json({ message: 'Exam not found' });
    response.json({ message: 'Exam deleted successfully' });
  } catch (error) { next(error); }
}
