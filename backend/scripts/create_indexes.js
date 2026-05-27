const { sequelize } = require('../src/models');

(async function() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB, creating indexes...');
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_ac_assignment ON assignment_collaborators(assignmentId);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_ac_user ON assignment_collaborators(userId);`);
    console.log('Indexes created');
    process.exit(0);
  } catch (e) {
    console.error('Failed to create indexes', e);
    process.exit(1);
  }
})();
