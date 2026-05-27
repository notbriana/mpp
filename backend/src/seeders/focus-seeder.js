module.exports = {
  async up(queryInterface) {
    const users = await queryInterface.sequelize.query("SELECT id, email FROM users WHERE email IN ('usera@example.com','userb@example.com')", { type: queryInterface.sequelize.QueryTypes.SELECT });
    const map = {};
    users.forEach(u => { map[u.email] = u.id; });

    const itemsToday = [
      { userId: map['usera@example.com'], date: '2026-04-29', sessions: 1, focusSecs: 1500 },
      { userId: map['userb@example.com'], date: '2026-04-29', sessions: 0, focusSecs: 0 }
    ].filter(i => i.userId);

    const itemsAll = [
      { userId: map['usera@example.com'], totalSecs: 1500, streak: 1, lastActiveDate: '2026-04-29' },
      { userId: map['userb@example.com'], totalSecs: 0, streak: 0, lastActiveDate: null }
    ].filter(i => i.userId);

    for (const it of itemsToday) {
      const exists = await queryInterface.sequelize.query('SELECT userId FROM focus_today WHERE userId = ? LIMIT 1', { replacements: [it.userId], type: queryInterface.sequelize.QueryTypes.SELECT }).catch(() => []);
      if (!exists || exists.length === 0) {
        await queryInterface.bulkInsert('focus_today', [it]);
      }
    }

    for (const ia of itemsAll) {
      const exists = await queryInterface.sequelize.query('SELECT userId FROM focus_alltime WHERE userId = ? LIMIT 1', { replacements: [ia.userId], type: queryInterface.sequelize.QueryTypes.SELECT }).catch(() => []);
      if (!exists || exists.length === 0) {
        await queryInterface.bulkInsert('focus_alltime', [ia]);
      }
    }
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('focus_today', null, {});
    await queryInterface.bulkDelete('focus_alltime', null, {});
  }
};
