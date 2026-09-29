import mongoose from 'mongoose';
import Exam from '../models/Exam.js';
import Room from '../models/Room.js';
import User from '../models/User.js';

export class RoomAllocationError extends Error {
  constructor(message, status = 409) {
    super(message);
    this.status = status;
  }
}

export function timesOverlap(newStart, newEnd, existingStart, existingEnd) {
  return newStart < existingEnd && newEnd > existingStart;
}

export function bookingsOverlap(newDate, existingDate, newStart, newEnd, existingStart, existingEnd) {
  return newDate === existingDate && timesOverlap(newStart, newEnd, existingStart, existingEnd);
}

export function capacityAllows(studentCount, capacity) {
  return Number.isInteger(studentCount) && Number.isInteger(capacity) && studentCount <= capacity;
}

export async function validateRoomAllocation({ roomId, academicYear, section, examDate, startTime, endTime, excludeExamId }) {
  if (!mongoose.isValidObjectId(roomId)) throw new RoomAllocationError('A valid room must be selected', 400);

  const room = await Room.findById(roomId).lean();
  if (!room) throw new RoomAllocationError('Selected room was not found', 404);

  const studentCount = await User.countDocuments({ role: 'student', academicYear, section });
  if (!Number.isInteger(studentCount)) throw new RoomAllocationError('Student attendance could not be determined', 503);
  if (!capacityAllows(studentCount, room.capacity)) {
    throw new RoomAllocationError(`Room capacity exceeded: ${studentCount} students require a room for ${room.capacity} people`, 409);
  }

  const clashQuery = { room: room._id, examDate, startTime: { $lt: endTime }, endTime: { $gt: startTime } };
  if (excludeExamId) clashQuery._id = { $ne: excludeExamId };
  const clash = await Exam.findOne(clashQuery).select('subjectName startTime endTime').lean();
  if (clash) {
    throw new RoomAllocationError(`Room "${room.name}" is already booked from ${clash.startTime} to ${clash.endTime}`);
  }

  return { room, studentCount };
}