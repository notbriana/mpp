const express = require('express');
const {
  listAssignments,
  getAssignmentById,
  addAssignment,
  updateAssignment,
  deleteAssignment,
  getSummary
} = require('../data/store');
const { validateAssignment } = require('../validators/assignmentValidator');
const { logAction } = require('../data/logging');

const router = express.Router();

router.get('/', (req, res) => {
  const userId = Number(req.query.userId);
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ message: 'userId is required.' });
  }
  const {
    search = '',
    status = '',
    priority = '',
    sortField = 'due_date',
    page = '1',
    pageSize = '10',
    all = 'false'
  } = req.query;

  const allFlag = String(all).toLowerCase() === 'true';
  const result = listAssignments({
    userId,
    search,
    status,
    priority,
    sortField,
    page: Number(page),
    pageSize: Number(pageSize),
    all: allFlag
  });

  res.json(result);
});

router.get('/summary', (req, res) => {
  const userId = Number(req.query.userId);
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ message: 'userId is required.' });
  }
  res.json(getSummary(userId));
});

router.get('/:id', (req, res) => {
  const userId = Number(req.query.userId);
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ message: 'userId is required.' });
  }
  const assignment = getAssignmentById(req.params.id, userId);
  if (!assignment) {
    return res.status(404).json({ message: 'Assignment not found.' });
  }
  return res.json(assignment);
});

router.post('/', async (req, res) => {
  const userId = Number(req.body?.userId);
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ message: 'userId is required.' });
  }
  const errors = validateAssignment(req.body || {});
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }
  const record = await addAssignment(userId, {
    title: req.body.title?.trim(),
    course_name: (req.body.course_name || '').trim(),
    due_date: req.body.due_date,
    priority: req.body.priority,
    status: req.body.status,
    description: (req.body.description || '').trim()
  });
  await logAction({
    userId,
    action: 'assignment:create',
    actionInfo: 'Assignment created (REST)',
    meta: { id: record.id, title: record.title, source: 'rest' }
  });
  return res.status(201).json(record);
});

router.put('/:id', async (req, res) => {
  const userId = Number(req.body?.userId);
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ message: 'userId is required.' });
  }
  const errors = validateAssignment(req.body || {});
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }
  const updated = await updateAssignment(userId, req.params.id, {
    title: req.body.title?.trim(),
    course_name: (req.body.course_name || '').trim(),
    due_date: req.body.due_date,
    priority: req.body.priority,
    status: req.body.status,
    description: (req.body.description || '').trim()
  });
  if (!updated) {
    return res.status(404).json({ message: 'Assignment not found.' });
  }
  await logAction({
    userId,
    action: 'assignment:update',
    actionInfo: 'Assignment updated (REST)',
    meta: { id: updated.id, source: 'rest' }
  });
  return res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const userId = Number(req.query.userId);
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ message: 'userId is required.' });
  }
  const ok = await deleteAssignment(userId, req.params.id);
  if (!ok) {
    return res.status(404).json({ message: 'Assignment not found.' });
  }
  await logAction({
    userId,
    action: 'assignment:delete',
    actionInfo: 'Assignment deleted (REST)',
    meta: { id: Number(req.params.id), source: 'rest' }
  });
  return res.json({ ok: true });
});

module.exports = router;
