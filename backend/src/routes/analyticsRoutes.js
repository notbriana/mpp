const express = require('express');
const router = express.Router();
const { sequelize, User, Assignment, AssignmentCollaborator } = require('../models');
const cache = require('../utils/cache');

// Naive implementation: for each user, run a separate count query (O(N) queries)
router.get('/naive/top-users', async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'name'] });
    const results = [];
    for (const u of users) {
      const cntRes = await AssignmentCollaborator.count({ where: { userId: u.id } });
      results.push({ id: u.id, name: u.name, count: cntRes });
    }
    results.sort((a, b) => b.count - a.count);
    return res.json({ items: results.slice(0, 100) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'internal' });
  }
});

// Optimized implementation: single GROUP BY query + cache
router.get('/optimized/top-users', async (req, res) => {
  try {
    const cacheKey = 'analytics:top-users';
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ cached: true, items: cached });

    const sql = `SELECT u.id, u.name, COUNT(ac.assignmentId) AS count
      FROM users u
      LEFT JOIN assignment_collaborators ac ON u.id = ac.userId
      GROUP BY u.id
      ORDER BY count DESC
      LIMIT 100`;
    const [rows] = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });
    cache.set(cacheKey, rows, 30_000);
    return res.json({ cached: false, items: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'internal' });
  }
});

module.exports = router;
