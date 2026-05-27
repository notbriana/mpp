module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TRIGGER IF NOT EXISTS trg_assignments_log_insert
      AFTER INSERT ON assignments
      BEGIN
        INSERT INTO logs(userId, action, details, created_at)
        VALUES (NEW.userId, 'assignment:create', json_object('id', NEW.id, 'title', NEW.title), datetime('now'));
      END;
    `);

    await queryInterface.sequelize.query(`
      CREATE TRIGGER IF NOT EXISTS trg_assignments_log_update
      AFTER UPDATE ON assignments
      BEGIN
        INSERT INTO logs(userId, action, details, created_at)
        VALUES (NEW.userId, 'assignment:update', json_object('id', NEW.id, 'changes', 'updated'), datetime('now'));
      END;
    `);

    await queryInterface.sequelize.query(`
      CREATE TRIGGER IF NOT EXISTS trg_assignments_log_delete
      AFTER DELETE ON assignments
      BEGIN
        INSERT INTO logs(userId, action, details, created_at)
        VALUES (OLD.userId, 'assignment:delete', json_object('id', OLD.id, 'title', OLD.title), datetime('now'));
      END;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS trg_assignments_log_insert;');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS trg_assignments_log_update;');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS trg_assignments_log_delete;');
  }
};
