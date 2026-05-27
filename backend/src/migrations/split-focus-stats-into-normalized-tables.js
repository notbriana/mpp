module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('focus_today', {
      userId: { type: Sequelize.INTEGER, primaryKey: true, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      date: { type: Sequelize.DATEONLY, allowNull: false },
      sessions: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      focusSecs: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 }
    });

    await queryInterface.createTable('focus_alltime', {
      userId: { type: Sequelize.INTEGER, primaryKey: true, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      totalSecs: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      streak: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      lastActiveDate: { type: Sequelize.DATEONLY, allowNull: true }
    });

    const rows = await queryInterface.sequelize.query('SELECT userId, today, allTime FROM focus_stats;', { type: queryInterface.sequelize.QueryTypes.SELECT }).catch(() => []);
    for (const r of rows || []) {
      let today = r.today || {};
      let allTime = r.allTime || {};
      await queryInterface.bulkInsert('focus_today', [{ userId: r.userId, date: today.date || new Date().toISOString().split('T')[0], sessions: today.sessions || 0, focusSecs: today.focusSecs || 0 }]);
      await queryInterface.bulkInsert('focus_alltime', [{ userId: r.userId, totalSecs: allTime.totalSecs || 0, streak: allTime.streak || 0, lastActiveDate: allTime.lastActiveDate || null }]);
    }

    await queryInterface.dropTable('focus_stats').catch(() => {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.createTable('focus_stats', {
      userId: { type: Sequelize.INTEGER, primaryKey: true },
      today: { type: Sequelize.JSON, allowNull: false },
      allTime: { type: Sequelize.JSON, allowNull: false }
    }).catch(() => {});

    const todays = await queryInterface.sequelize.query('SELECT userId, date, sessions, focusSecs FROM focus_today;', { type: queryInterface.sequelize.QueryTypes.SELECT }).catch(() => []);
    const alltimes = await queryInterface.sequelize.query('SELECT userId, totalSecs, streak, lastActiveDate FROM focus_alltime;', { type: queryInterface.sequelize.QueryTypes.SELECT }).catch(() => []);

    const mapAll = new Map();
    for (const a of alltimes) mapAll.set(a.userId, a);

    for (const t of todays) {
      const a = mapAll.get(t.userId) || {};
      await queryInterface.bulkInsert('focus_stats', [{ userId: t.userId, today: { date: t.date, sessions: t.sessions, focusSecs: t.focusSecs }, allTime: { totalSecs: a.totalSecs || 0, streak: a.streak || 0, lastActiveDate: a.lastActiveDate || null } }]);
    }

    await queryInterface.dropTable('focus_today').catch(() => {});
    await queryInterface.dropTable('focus_alltime').catch(() => {});
  }
};
