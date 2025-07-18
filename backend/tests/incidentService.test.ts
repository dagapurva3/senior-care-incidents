import * as incidentRepo from '../src/repositories/incidentRepository';
import * as openaiService from '../src/services/openai';
import {
  createIncidentService,
  listIncidentsService,
  updateIncidentStatusService,
  exportIncidentsService,
  summarizeIncidentService,
} from '../src/services/incidentService';
import Incident from '../src/models/incident';

describe('Incident Service', () => {
  const userId = 'test-user-id';

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createIncidentService', () => {
    it('should create an incident with valid data', async () => {
      const data = { type: 'fall', description: 'A valid description', status: 'open' };
      jest.spyOn(incidentRepo, 'createIncident').mockResolvedValue({ ...data, userId } as any);
      const result = await createIncidentService(userId, data);
      expect(result).toMatchObject({ ...data, userId });
    });
    it('should throw if type or description is missing', async () => {
      await expect(createIncidentService(userId, { type: 'fall' })).rejects.toThrow('Description must be at least 10 characters long');
      await expect(createIncidentService(userId, { description: 'desc' })).rejects.toThrow('Type must be one of: fall, behaviour, medication, other');
    });
    it('should throw if type or description is not a string', async () => {
      await expect(createIncidentService(userId, { type: 123, description: 456 })).rejects.toThrow('Type must be one of: fall, behaviour, medication, other');
    });
    it('should throw if description is too short', async () => {
      await expect(createIncidentService(userId, { type: 'fall', description: 'short' })).rejects.toThrow('Description must be at least 10 characters long');
    });
    it('should throw if type is invalid', async () => {
      await expect(createIncidentService(userId, { type: 'invalid', description: 'A valid description' })).rejects.toThrow('Type must be one of: fall, behaviour, medication, other');
    });
    it('should throw if status is invalid', async () => {
      await expect(createIncidentService(userId, { type: 'fall', description: 'A valid description', status: 'bad' })).rejects.toThrow('Status must be one of: open, in_progress, resolved, closed');
    });
  });

  describe('listIncidentsService', () => {
    it('should return paginated incidents', async () => {
      const incidentInstance = new Incident();
      incidentInstance.id = '1';
      incidentInstance.userId = 'test-user-id';
      incidentInstance.type = 'fall';
      incidentInstance.description = 'desc';
      incidentInstance.status = 'open';
      incidentInstance.summary = undefined;
      incidentInstance.createdAt = new Date();
      incidentInstance.updatedAt = new Date();
      jest.spyOn(incidentRepo, 'getIncidentsByUser').mockResolvedValue({ count: 1, rows: [incidentInstance] });
      const result = await listIncidentsService(userId, {});
      expect(result.incidents.length).toBe(1);
    });
  });

  describe('updateIncidentStatusService', () => {
    it('should update status if valid', async () => {
      jest.spyOn(incidentRepo, 'updateIncidentStatus').mockResolvedValue({ id: 1, status: 'resolved' } as any);
      const result = await updateIncidentStatusService(userId, '1', 'resolved');
      expect(result.status).toBe('resolved');
    });
    it('should throw if id or status is missing', async () => {
      await expect(updateIncidentStatusService(userId, '', 'open')).rejects.toThrow('Incident ID is required');
      await expect(updateIncidentStatusService(userId, '1', '')).rejects.toThrow('Status is required');
    });
    it('should throw if status is invalid', async () => {
      await expect(updateIncidentStatusService(userId, '1', 'bad')).rejects.toThrow('Status must be one of: open, in_progress, resolved, closed');
    });
    it('should throw if incident not found', async () => {
      jest.spyOn(incidentRepo, 'updateIncidentStatus').mockResolvedValue(null);
      await expect(updateIncidentStatusService(userId, '1', 'open')).rejects.toThrow('Incident not found');
    });
    it('should not allow updating an incident not owned by the user', async () => {
      jest.spyOn(incidentRepo, 'updateIncidentStatus').mockResolvedValue(null);
      await expect(
        updateIncidentStatusService('wrong-user', 'incident-id', 'resolved')
      ).rejects.toThrow('Incident not found');
    });
  });

  describe('exportIncidentsService', () => {
    it('should return incidents as JSON by default', async () => {
      jest.spyOn(incidentRepo, 'exportIncidentsByUser').mockResolvedValue([{ id: 1 }] as any);
      const result = await exportIncidentsService(userId);
      expect(result.incidents).toHaveLength(1);
    });
    it('should return CSV if format is csv', async () => {
      jest.spyOn(incidentRepo, 'exportIncidentsByUser').mockResolvedValue([{ id: 1, type: 'fall', description: 'desc', status: 'open', summary: '', createdAt: new Date(), updatedAt: new Date() }] as any);
      const result = await exportIncidentsService(userId, 'csv');
      expect(result.csv).toContain('ID,Type,Description,Status,Summary,Created At,Updated At');
    });
  });

  describe('summarizeIncidentService', () => {
    it('should summarize an incident', async () => {
      jest.spyOn(incidentRepo, 'findIncidentById').mockResolvedValue({ id: 1, description: 'desc', save: jest.fn(), summary: undefined } as any);
      jest.spyOn(openaiService, 'summarizeIncident').mockResolvedValue('summary');
      const result = await summarizeIncidentService(userId, '1');
      expect(result.summary).toBe('summary');
    });
    it('should throw if incident not found', async () => {
      jest.spyOn(incidentRepo, 'findIncidentById').mockResolvedValue(null);
      await expect(summarizeIncidentService(userId, '1')).rejects.toThrow('Incident not found');
    });
    it('should handle OpenAI summary generation failure', async () => {
      jest.spyOn(incidentRepo, 'findIncidentById').mockResolvedValue({ id: 1, description: 'desc', type: 'fall', save: jest.fn() } as any);
      jest.spyOn(openaiService, 'summarizeIncident').mockRejectedValue(new Error('OpenAI error'));
      await expect(summarizeIncidentService('user', '1')).rejects.toThrow('OpenAI error');
    });
  });

  describe('Edge Cases and Error States', () => {
    it('should throw error for invalid type', async () => {
      await expect(createIncidentService('user-id', { type: 'invalid', description: 'Valid description' }))
        .rejects.toThrow(/Type must be one of/);
    });

    it('should throw error for short description', async () => {
      await expect(createIncidentService('user-id', { type: 'fall', description: 'short' }))
        .rejects.toThrow(/at least 10 characters/);
    });

    it('should throw error for invalid status on update', async () => {
      await expect(updateIncidentStatusService('user-id', 'incident-id', 'not_a_status'))
        .rejects.toThrow(/Status must be one of/);
    });

    it('should throw error if incident not found on update', async () => {
      jest.spyOn(incidentRepo, 'updateIncidentStatus').mockResolvedValue(null);
      await expect(updateIncidentStatusService('user-id', 'incident-id', 'open'))
        .rejects.toThrow(/Incident not found/);
    });
  });
});