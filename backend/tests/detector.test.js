jest.resetModules();

const mockCreate = jest.fn();
const mockFindOne = jest.fn().mockResolvedValue(null);

jest.mock('../src/models', () => ({
  Log: {},
  Observation: { findOne: mockFindOne, create: mockCreate },
  sequelize: { query: jest.fn().mockResolvedValue([{ userId: 1, cnt: 5 }]), QueryTypes: { SELECT: 'SELECT' } }
}));

const { scanAndFlag } = require('../src/data/detector');

describe('detector (unit)', () => {
  test('creates observation when threshold exceeded', async () => {
    process.env.DETECTOR_THRESHOLD = '3';
    await scanAndFlag();
    expect(mockCreate).toHaveBeenCalled();
  });
});
