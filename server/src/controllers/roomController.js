import mongoose from 'mongoose';
import Exam from '../models/Exam.js';
import Room from '../models/Room.js';
import User from '../models/User.js';

function validateRoom(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Room data must be an object';
  if (typeof body.name !== 'string' || !body.name.trim()) return 'Room name is required';
  if (!Number.isInteger(body.capacity) || body.capacity < 1) return 'Capacity must be a positive integer';
  return null;
}

export async function listRooms(_request, response, next) {
  try { response.json({ rooms: await Room.find().sort({ name: 1 }) }); } catch (error) { next(error); }
}

export async function createRoom(request, response, next) {
  try {
    const validationError = validateRoom(request.body);
    if (validationError) return response.status(400).json({ message: validationError });
    const room = await Room.create({ name: request.body.name.trim(), capacity: request.body.capacity });
    response.status(201).json({ room });
  } catch (error) { next(error); }
}

export async function updateRoom(request, response, next) {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) return response.status(400).json({ message: 'Invalid room ID' });
    const validationError = validateRoom(request.body);
    if (validationError) return response.status(400).json({ message: validationError });
    const assignedExams = await Exam.find({ room: request.params.id }).select('academicYear section').lean();
    for (const exam of assignedExams) {
      const studentCount = await User.countDocuments({ role: 'student', academicYear: exam.academicYear, section: exam.section });
      if (studentCount > request.body.capacity) return response.status(409).json({ message: `Room capacity cannot be reduced below ${studentCount} students for an assigned exam` });
    }
    const room = await Room.findByIdAndUpdate(request.params.id, { name: request.body.name.trim(), capacity: request.body.capacity }, { new: true, runValidators: true });
    if (!room) return response.status(404).json({ message: 'Room not found' });
    response.json({ room });
  } catch (error) { next(error); }
}

export async function deleteRoom(request, response, next) {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) return response.status(400).json({ message: 'Invalid room ID' });
    const room = await Room.findById(request.params.id);
    if (!room) return response.status(404).json({ message: 'Room not found' });
    if (await Exam.exists({ room: room._id })) return response.status(409).json({ message: 'Room cannot be deleted while assigned to an exam' });
    await room.deleteOne();
    response.json({ message: 'Room deleted successfully' });
  } catch (error) { next(error); }
}