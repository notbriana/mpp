afterAll(async () => {
  try {
    const { sequelize } = require('../src/models');
    if (sequelize && typeof sequelize.close === 'function') {
      await sequelize.close();
    }
  } catch (e) {
  }
});
