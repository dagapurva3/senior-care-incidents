import '../src/models/user';
import '../src/models/incident';
import sequelize from '../src/config/database';
import Incident from '../src/models/incident';
import User from '../src/models/user';
import {
  createIncident,
  getIncidentsByUser,
  findIncidentById,
  updateIncidentStatus,
  exportIncidentsByUser,
} from '../src/repositories/incidentRepository';

describe('Incident Repository', () => {
  const userId = 'test-user-id';
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    await User.create({ id: userId, email: 'repo@example.com' });
  });
  afterAll(async () => {
    await sequelize.close();
  });
  beforeEach(async () => {
    await Incident.destroy({ where: {} });
  });

  it('should create an incident', async () => {
    const data = { userId, type: 'fall', description: 'desc for repo', status: 'open' };
    const incident = await createIncident(data);
    expect(incident).toHaveProperty('id');
    expect(incident.userId).toBe(userId);
  });

  it('should get incidents by user', async () => {
    await createIncident({ userId, type: 'fall', description: 'desc1', status: 'open' });
    const { count, rows } = await getIncidentsByUser(userId, {});
    expect(count).toBe(1);
    expect(rows.length).toBe(1);
  });

  it('should find incident by id and user', async () => {
    const incident = await createIncident({ userId, type: 'fall', description: 'desc', status: 'open' });
    const found = await findIncidentById(incident.id, userId);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(incident.id);
  });

  it('should update incident status', async () => {
    const incident = await createIncident({ userId, type: 'fall', description: 'desc', status: 'open' });
    const updated = await updateIncidentStatus(incident.id, userId, 'resolved');
    expect(updated).not.toBeNull();
    expect(updated!.status).toBe('resolved');
  });

  it('should export incidents by user', async () => {
    await createIncident({ userId, type: 'fall', description: 'desc', status: 'open' });
    const incidents = await exportIncidentsByUser(userId);
    expect(Array.isArray(incidents)).toBe(true);
    expect(incidents.length).toBeGreaterThan(0);
  });
});

describe('Incident Repository Edge Cases', () => {
  it('should handle DB errors gracefully on findOne', async () => {
    (Incident.findOne as jest.Mock).mockRejectedValueOnce(new Error('DB error'));
    await expect(Incident.findOne({ where: { id: 999 } })).rejects.toThrow('DB error');
  });

  it('should return null for non-existent incident', async () => {
    jest.spyOn(Incident, 'findOne').mockResolvedValueOnce(null);
    const result = await Incident.findOne({ where: { id: 999 } });
    expect(result).toBeNull();
  });

  it('should handle update for non-existent incident', async () => {
    (Incident.update as jest.Mock).mockResolvedValueOnce([0]);
    const [count] = await Incident.update({ status: 'closed' }, { where: { id: 999 } });
    expect(count).toBe(0);
  });
});

describe('Edge Cases and Error States', () => {
  it('should return null for non-existent incident', async () => {
    jest.spyOn(Incident, 'findOne').mockResolvedValueOnce(null);
    const result = await findIncidentById('non-existent-id', 'user-id');
    expect(result).toBeNull();
  });

  it('should handle DB errors gracefully on findOne', async () => {
    const spy = jest.spyOn(Incident, 'findOne').mockRejectedValueOnce(new Error('DB error'));
    await expect(Incident.findOne({ where: { id: 'bad-id' } })).rejects.toThrow('DB error');
    spy.mockRestore();
  });
});