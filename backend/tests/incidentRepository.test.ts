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
  const userId = 'repo-user-id';
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
    await createIncident({ userId, type: 'fall', description: 'desc2', status: 'open' });
    const { count, rows } = await getIncidentsByUser(userId, {});
    expect(count).toBe(2);
    expect(rows.length).toBe(2);
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