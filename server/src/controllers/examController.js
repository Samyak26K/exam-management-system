import mongoose from 'mongoose';
import Exam from '../models/Exam.js';
import { validateRoomAllocation } from '../services/roomAllocationService.js';

function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function isValidTime(value) {
  if (typeof value !== 'string' || !/^\d{2}:\d{2}$/.test(value)) return false;
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
  if (!mongoose.isValidObjectId(body.roomId || body.room)) return 'A valid room must be selected';
  return null;
}

function getExamData(body) {
  return { subjectName: body.subjectName, subjectCode: body.subjectCode, academicYear: body.academicYear, section: body.section, examDate: body.examDate, startTime: body.startTime, endTime: body.endTime, venue: body.venue, room: body.roomId || body.room };
}

export async function listExams(request, response, next) {
  try {
    const filter = request.user.role === 'student'
      ? { academicYear: request.user.academicYear, section: request.user.section }
      : {};
    response.json({ exams: await Exam.find(filter).populate('room', 'name capacity').sort({ examDate: 1, startTime: 1 }) });
  } catch (error) { next(error); }
}

export async function createExam(request, response, next) {
  try {
    const validationError = validateExam(request.body);
    if (validationError) return response.status(400).json({ message: validationError });
    const examData = getExamData(request.body);
    await validateRoomAllocation({ roomId: examData.room, academicYear: examData.academicYear, section: examData.section, examDate: examData.examDate, startTime: examData.startTime, endTime: examData.endTime });
    const exam = await Exam.create(examData);
    response.status(201).json({ exam: await Exam.findById(exam._id).populate('room', 'name capacity') });
  } catch (error) { next(error); }
}

export async function updateExam(request, response, next) {
  try {
    const validationError = validateExam(request.body);
    if (validationError) return response.status(400).json({ message: validationError });
    if (!mongoose.isValidObjectId(request.params.id)) return response.status(400).json({ message: 'Invalid exam ID' });
    const examData = getExamData(request.body);
    await validateRoomAllocation({ roomId: examData.room, academicYear: examData.academicYear, section: examData.section, examDate: examData.examDate, startTime: examData.startTime, endTime: examData.endTime, excludeExamId: request.params.id });
    const exam = await Exam.findByIdAndUpdate(request.params.id, examData, { new: true, runValidators: true }).populate('room', 'name capacity');
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
