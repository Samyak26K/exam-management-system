import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidProvisioningKey, validateCredentials } from '../src/controllers/authController.js';
import { validateExam } from '../src/controllers/examController.js';
import { bookingsOverlap, capacityAllows, timesOverlap } from '../src/services/roomAllocationService.js';

const validExam = {
  subjectName: 'Software Engineering', subjectCode: 'SE101', academicYear: 'Year 2', section: 'A',
  examDate: '2026-06-15', startTime: '09:00', endTime: '11:00', venue: 'Hall 1'
};

test('admin credentials do not require academic year or section', () => {
  assert.equal(validateCredentials({ name: 'Admin', email: 'admin@example.com', password: 'password123', role: 'admin' }), null);
});

test('student credentials require academic year and section', () => {
  assert.equal(validateCredentials({ name: 'Student', email: 'student@example.com', password: 'password123', role: 'student' }), 'Academic year and section are required');
});

test('provisioning key rejects a missing configured key', () => {
  assert.equal(isValidProvisioningKey(undefined, undefined), false);
  assert.equal(isValidProvisioningKey('key', ''), false);
});

test('exam validation rejects invalid dates and times', () => {
  assert.equal(validateExam({ ...validExam, examDate: '2026-02-30' }), 'Exam date must be a real calendar date');
  assert.equal(validateExam({ ...validExam, startTime: '9:00' }), 'Times must use HH:mm format');
  assert.equal(validateExam({ ...validExam, startTime: '11:00', endTime: '10:00' }), 'End time must be after start time');
});

test('room capacity allows an exact attendance match and rejects overflow', () => {
  assert.equal(capacityAllows(30, 30), true);
  assert.equal(capacityAllows(31, 30), false);
});

test('room clashes only overlap on the same date', () => {
  assert.equal(timesOverlap('09:00', '11:00', '10:00', '12:00'), true);
  assert.equal(timesOverlap('09:00', '11:00', '11:00', '12:00'), false);
  assert.equal(timesOverlap('09:00', '11:00', '12:00', '14:00'), false);
  assert.equal(bookingsOverlap('2026-06-01', '2026-06-02', '09:00', '11:00', '10:00', '12:00'), false);
});