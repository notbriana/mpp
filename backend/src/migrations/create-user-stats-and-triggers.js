module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_stats', {
      userId: { type: Sequelize.INTEGER, primaryKey: true, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      total: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      not_started: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      in_progress: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      completed: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      overdue: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 }
    });

    await queryInterface.sequelize.query(`
      CREATE TRIGGER IF NOT EXISTS trg_assignments_after_insert
      AFTER INSERT ON assignments
      BEGIN
        INSERT INTO user_stats(userId, total, not_started, in_progress, completed, overdue)
        VALUES (
          NEW.userId,
          1,
          CASE WHEN NEW.status = 'Not Started' THEN 1 ELSE 0 END,
          CASE WHEN NEW.status = 'In Progress' THEN 1 ELSE 0 END,
          CASE WHEN NEW.status = 'Completed' THEN 1 ELSE 0 END,
          CASE WHEN (NEW.status != 'Completed' AND NEW.due_date < date('now')) THEN 1 ELSE 0 END
        )
        ON CONFLICT(userId) DO UPDATE SET
          total = user_stats.total + 1,
          not_started = user_stats.not_started + (CASE WHEN NEW.status = 'Not Started' THEN 1 ELSE 0 END),
          in_progress = user_stats.in_progress + (CASE WHEN NEW.status = 'In Progress' THEN 1 ELSE 0 END),
          completed = user_stats.completed + (CASE WHEN NEW.status = 'Completed' THEN 1 ELSE 0 END),
          overdue = user_stats.overdue + (CASE WHEN (NEW.status != 'Completed' AND NEW.due_date < date('now')) THEN 1 ELSE 0 END);
      END;
    `);

    await queryInterface.sequelize.query(`
      CREATE TRIGGER IF NOT EXISTS trg_assignments_after_delete
      AFTER DELETE ON assignments
      BEGIN
        UPDATE user_stats SET
          total = CASE WHEN total > 0 THEN total - 1 ELSE 0 END,
          not_started = CASE WHEN OLD.status = 'Not Started' AND not_started > 0 THEN not_started - 1 ELSE not_started END,
          in_progress = CASE WHEN OLD.status = 'In Progress' AND in_progress > 0 THEN in_progress - 1 ELSE in_progress END,
          completed = CASE WHEN OLD.status = 'Completed' AND completed > 0 THEN completed - 1 ELSE completed END,
          overdue = CASE WHEN (OLD.status != 'Completed' AND OLD.due_date < date('now') AND overdue > 0) THEN overdue - 1 ELSE overdue END
        WHERE userId = OLD.userId;
      END;
    `);

    await queryInterface.sequelize.query(`
      CREATE TRIGGER IF NOT EXISTS trg_assignments_after_update
      AFTER UPDATE ON assignments
      BEGIN
        -- decrement old status counts
        UPDATE user_stats SET
          not_started = CASE WHEN OLD.status = 'Not Started' AND not_started > 0 THEN not_started - 1 ELSE not_started END,
          in_progress = CASE WHEN OLD.status = 'In Progress' AND in_progress > 0 THEN in_progress - 1 ELSE in_progress END,
          completed = CASE WHEN OLD.status = 'Completed' AND completed > 0 THEN completed - 1 ELSE completed END,
          overdue = CASE WHEN (OLD.status != 'Completed' AND OLD.due_date < date('now') AND overdue > 0) THEN overdue - 1 ELSE overdue END
        WHERE userId = OLD.userId;

        -- increment new status counts
        INSERT INTO user_stats(userId, total, not_started, in_progress, completed, overdue)
        VALUES (
          NEW.userId,
          0,
          CASE WHEN NEW.status = 'Not Started' THEN 1 ELSE 0 END,
          CASE WHEN NEW.status = 'In Progress' THEN 1 ELSE 0 END,
          CASE WHEN NEW.status = 'Completed' THEN 1 ELSE 0 END,
          CASE WHEN (NEW.status != 'Completed' AND NEW.due_date < date('now')) THEN 1 ELSE 0 END
        )
        ON CONFLICT(userId) DO UPDATE SET
          not_started = user_stats.not_started + (CASE WHEN NEW.status = 'Not Started' THEN 1 ELSE 0 END),
          in_progress = user_stats.in_progress + (CASE WHEN NEW.status = 'In Progress' THEN 1 ELSE 0 END),
          completed = user_stats.completed + (CASE WHEN NEW.status = 'Completed' THEN 1 ELSE 0 END),
          overdue = user_stats.overdue + (CASE WHEN (NEW.status != 'Completed' AND NEW.due_date < date('now')) THEN 1 ELSE 0 END);
      END;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS trg_assignments_after_insert;');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS trg_assignments_after_delete;');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS trg_assignments_after_update;');
    await queryInterface.dropTable('user_stats');
  }
};
