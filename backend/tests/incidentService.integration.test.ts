import { listIncidentsService, summarizeIncidentService, exportIncidentsService } from '../src/services/incidentService';
import Incident from '../src/models/incident';

describe('Incident Service Integration', () => {
  const userId = 'test-user-id';

  beforeEach(async () => {
    await Incident.destroy({ where: {} });
  });

  it('should list incidents with pagination and sorting', async () => {
    await Incident.create({ userId, type: 'fall', description: 'desc1', status: 'open' });
    await Incident.create({ userId, type: 'fall', description: 'desc2', status: 'open' });
    const result = await listIncidentsService(userId, { page: 1, pageSize: 1, sortBy: 'createdAt', sortOrder: 'desc' });
    expect(result.pagination.totalItems).toBeGreaterThanOrEqual(1);
    expect(result.incidents.length).toBe(1);
  });

  it('should handle OpenAI failure in summarizeIncidentService', async () => {
    const incident = await Incident.create({ userId, type: 'fall', description: 'desc', status: 'open' });
    const openaiService = require('../src/services/openai');
    const spy = jest.spyOn(openaiService, 'summarizeIncident').mockRejectedValue(new Error('OpenAI error'));
    await expect(summarizeIncidentService(userId, incident.id)).rejects.toThrow('OpenAI error');
    spy.mockRestore();
  });

  it('should export incidents as CSV with empty results', async () => {
    const result = await exportIncidentsService(userId, 'csv');
    expect(result.csv).toContain('ID,Type,Description,Status,Summary,Created At,Updated At');
  });
});
