const express = require('express');
const { faker } = require('@faker-js/faker');
const { addAssignment } = require('../data/store');
const { broadcast } = require('../realtime/socketHub');

const router = express.Router();
const loops = new Map();

function createFakeAssignment(userId) {
  const title = faker.lorem.sentence({ min: 3, max: 6 }).replace(/\.$/, '');
  const course = faker.helpers.arrayElement(['MATH', 'CS', 'BIO', 'HIST', 'PHYS', 'CHEM']);
  const courseNum = faker.number.int({ min: 100, max: 499 });
  const priority = faker.helpers.arrayElement(['High', 'Medium', 'Low']);
  const status = faker.helpers.arrayElement(['Not Started', 'In Progress', 'Completed']);
  const dueDate = faker.date.soon({ days: 60 });

  return addAssignment(userId, {
    title,
    course_name: `${course} ${courseNum}`,
    due_date: dueDate.toISOString().split('T')[0],
    priority,
    status,
    description: faker.lorem.sentence({ min: 6, max: 12 })
  });
}

router.post('/start', (req, res) => {
  const userId = Number(req.body?.userId);
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ message: 'userId is required.' });
  }

  if (loops.has(userId)) {
    return res.status(409).json({ message: 'Generator already running.' });
  }

  const batchSize = Math.max(1, Number(req.body?.batchSize) || 3);
  const intervalMs = Math.max(1000, Number(req.body?.intervalMs) || 5000);

  const timer = setInterval(() => {
    const items = [];
    for (let i = 0; i < batchSize; i += 1) {
      items.push(createFakeAssignment(userId));
    }
    broadcast({ type: 'assignments:created', userId, items });
  }, intervalMs);

  loops.set(userId, timer);
  return res.json({ ok: true, batchSize, intervalMs });
});

router.post('/stop', (req, res) => {
  const userId = Number(req.body?.userId);
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ message: 'userId is required.' });
  }

  const timer = loops.get(userId);
  if (!timer) {
    return res.status(404).json({ message: 'Generator not running.' });
  }

  clearInterval(timer);
  loops.delete(userId);
  return res.json({ ok: true });
});

module.exports = router;
