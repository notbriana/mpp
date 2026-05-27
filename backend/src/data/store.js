const { Op } = require('sequelize');
const { sequelize, User, Assignment, FocusToday, FocusAllTime } = require('../models');

const assignmentsSeed = [
  { title: 'Linear Algebra Problem Set 4', course_name: 'MATH 201', due_date: '2026-03-21', priority: 'High', status: 'In Progress', description: 'Eigenvalues, eigenvectors, and matrix decomposition.', created_at: '2026-01-01' },
  { title: 'Research Paper: Climate Policy', course_name: 'POLS 340', due_date: '2025-01-15', priority: 'High', status: 'Not Started', description: 'Comparative analysis of EU and US climate frameworks.', created_at: '2026-01-02' },
  { title: 'Lab Report Titration', course_name: 'CHEM 110', due_date: '2025-12-30', priority: 'Medium', status: 'Completed', description: 'Acid-base titration and pH curve analysis.', created_at: '2026-01-03' },
  { title: 'Essay: Modernism in Literature', course_name: 'ENGL 250', due_date: '2025-01-12', priority: 'Medium', status: 'In Progress', description: 'Explore key themes in Joyce and Woolf.', created_at: '2026-01-04' },
  { title: 'Data Structures Assignment 2', course_name: 'CS 301', due_date: '2025-01-08', priority: 'High', status: 'Not Started', description: 'Implement a balanced BST and benchmarks.', created_at: '2026-01-05' },
  { title: 'Philosophy Reading Response', course_name: 'PHIL 101', due_date: '2025-01-20', priority: 'Low', status: 'Not Started', description: 'Response to Kants Critique of Pure Reason Ch.3.', created_at: '2026-01-06' },
  { title: 'Statistics Project Milestone 2', course_name: 'STAT 220', due_date: '2025-01-18', priority: 'Medium', status: 'In Progress', description: 'Regression analysis and hypothesis testing.', created_at: '2026-01-07' },
  { title: 'Microeconomics Problem Set', course_name: 'ECON 202', due_date: '2026-01-22', priority: 'Low', status: 'Not Started', description: 'Supply-demand equilibrium and elasticity problems.', created_at: '2026-01-08' },
  { title: 'UI/UX Design Mockup', course_name: 'DES 315', due_date: '2025-12-28', priority: 'High', status: 'Completed', description: 'High-fidelity prototype for mobile banking app.', created_at: '2026-01-09' },
  { title: 'History Essay Industrial Rev.', course_name: 'HIST 110', due_date: '2026-01-25', priority: 'Medium', status: 'Not Started', description: 'Economic and social consequences 1760 to 1840.', created_at: '2026-01-10' },
  { title: 'Operating Systems Lab', course_name: 'CS 401', due_date: '2026-01-28', priority: 'High', status: 'Not Started', description: 'Shell implementation with piping and redirection.', created_at: '2026-01-11' },
  { title: 'Spanish Oral Presentation', course_name: 'SPAN 202', due_date: '2026-02-01', priority: 'Low', status: 'Not Started', description: 'Cultural presentation on Garcia Marquez.', created_at: '2026-01-12' }
];

async function resetStore() {
  await sequelize.sync({ force: true });
}

async function resetStorePreserveUsers() {
  const users = await User.findAll({ raw: true }).catch(() => []);
  await sequelize.sync({ force: true });

  for (const u of users || []) {
    const created = await User.create({ name: u.name, email: u.email, password: u.password });
    await seedAssignmentsForUser(created.id).catch(() => {});
    await ensureFocusStats(created.id).catch(() => {});
  }
}

async function seedAssignmentsForUser(userId) {
  const items = assignmentsSeed.map((s) => ({ ...s, userId }));
  await Assignment.bulkCreate(items);
}

async function ensureFocusStats(userId) {
  const today = await FocusToday.findByPk(userId);
  const alltime = await FocusAllTime.findByPk(userId);
  if (today && alltime) return { today, allTime: alltime };
  const nowDay = new Date().toISOString().split('T')[0];
  if (!today) await FocusToday.create({ userId, date: nowDay, sessions: 0, focusSecs: 0 });
  if (!alltime) await FocusAllTime.create({ userId, totalSecs: 0, streak: 0, lastActiveDate: null });
  const t = await FocusToday.findByPk(userId);
  const a = await FocusAllTime.findByPk(userId);
  return { today: t, allTime: a };
}

function normalizeSort(sortField) {
  const allowed = new Set(['priority', 'title', 'due_date']);
  return allowed.has(sortField) ? sortField : 'due_date';
}

async function listAssignments({ userId, search, status, priority, sortField, page, pageSize, all }) {
  const where = {};
  if (userId) where.userId = userId;
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (search) {
    where[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { course_name: { [Op.like]: `%${search}%` } }
    ];
  }

  const order = [];
  const field = normalizeSort(sortField);
  if (field === 'priority') {
  } else if (field === 'title') {
    order.push(['title', 'ASC']);
  } else {
    order.push(['due_date', 'ASC']);
  }

  if (all) {
    const items = await Assignment.findAll({ where, order });
    if (field === 'priority') {
      const orderMap = { High: 0, Medium: 1, Low: 2 };
      items.sort((a, b) => (orderMap[a.priority] ?? 9) - (orderMap[b.priority] ?? 9));
    }
    return { items, total: items.length, totalPages: 1, page: 1 };
  }

  const safePage = Number.isFinite(page) ? page : 1;
  const safePageSize = Number.isFinite(pageSize) ? pageSize : 10;
  const { count, rows } = await Assignment.findAndCountAll({ where, order, limit: safePageSize, offset: (safePage - 1) * safePageSize });
  let items = rows;
  if (field === 'priority') {
    const orderMap = { High: 0, Medium: 1, Low: 2 };
    items = items.sort((a, b) => (orderMap[a.priority] ?? 9) - (orderMap[b.priority] ?? 9));
  }
  const totalPages = Math.max(1, Math.ceil(count / safePageSize));
  return { items, total: count, totalPages, page: safePage };
}

async function getAssignmentById(id, userId) {
  const where = { id: Number(id) };
  if (userId) where.userId = userId;
  return await Assignment.findOne({ where }) || null;
}

async function addAssignment(userId, fields) {
  const payload = { ...fields, userId, created_at: (fields.created_at || new Date().toISOString().split('T')[0]) };
  const created = await Assignment.create(payload);
  return created;
}

async function updateAssignment(userId, id, fields) {
  const where = { id: Number(id) };
  if (userId) where.userId = userId;
  const item = await Assignment.findOne({ where });
  if (!item) return null;
  await item.update(fields);
  return item;
}

async function deleteAssignment(userId, id) {
  const where = { id: Number(id) };
  if (userId) where.userId = userId;
  const destroyed = await Assignment.destroy({ where });
  return destroyed > 0;
}

async function getSummary(userId) {
  const whereBase = {};
  if (userId) whereBase.userId = userId;
  const total = await Assignment.count({ where: whereBase });
  const not_started = await Assignment.count({ where: { ...whereBase, status: 'Not Started' } });
  const in_progress = await Assignment.count({ where: { ...whereBase, status: 'In Progress' } });
  const completed = await Assignment.count({ where: { ...whereBase, status: 'Completed' } });
  const today = new Date();
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const overdue = await Assignment.count({ where: { ...whereBase, status: { [Op.ne]: 'Completed' }, due_date: { [Op.lt]: todayDay } } });
  return { total, not_started, in_progress, completed, overdue };
}

async function findUserByEmail(email) {
  return await User.findOne({ where: { email } });
}

const bcrypt = require('bcrypt');
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

async function addUser({ name, email, password }) {
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, password: hash });
  await seedAssignmentsForUser(user.id);
  await ensureFocusStats(user.id);
  return user;
}

async function updateUserPassword(email, newPassword) {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await user.update({ password: hash });
  return user;
}

async function getFocusStats(userId) {
  const today = await FocusToday.findByPk(userId);
  const alltime = await FocusAllTime.findByPk(userId);
  if (today && alltime) return { today, allTime: alltime };
  return ensureFocusStats(userId);
}

async function setFocusStats(userId, stats) {
  const { today, allTime } = stats;
  const t = await FocusToday.findByPk(userId);
  if (t) await t.update({ date: today.date, sessions: today.sessions, focusSecs: today.focusSecs });
  else await FocusToday.create({ userId, date: today.date, sessions: today.sessions, focusSecs: today.focusSecs });

  const a = await FocusAllTime.findByPk(userId);
  if (a) await a.update({ totalSecs: allTime.totalSecs, streak: allTime.streak, lastActiveDate: allTime.lastActiveDate });
  else await FocusAllTime.create({ userId, totalSecs: allTime.totalSecs, streak: allTime.streak, lastActiveDate: allTime.lastActiveDate });

  return getFocusStats(userId);
}

module.exports = {
  listAssignments,
  getAssignmentById,
  addAssignment,
  updateAssignment,
  deleteAssignment,
  getSummary,
  findUserByEmail,
  addUser,
  updateUserPassword,
  getFocusStats,
  setFocusStats,
  seedAssignmentsForUser,
  resetStore,
  resetStorePreserveUsers
};
