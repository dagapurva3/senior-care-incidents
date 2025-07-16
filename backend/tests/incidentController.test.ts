import { createIncidentController, listIncidentsController, updateIncidentStatusController, exportIncidentsController } from '../src/controllers/incidentController';
import Incident from '../src/models/incident';
import * as incidentService from '../src/services/incidentService';

const mockReq: any = { body: {}, params: {}, query: {}, user: { uid: 'test-user-id' } };
const mockRes: any = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), send: jest.fn() };

beforeEach(() => {
    jest.clearAllMocks();
    mockRes.status.mockClear();
    mockRes.json.mockClear();
    mockRes.setHeader.mockClear();
    mockRes.send.mockClear();
});

describe('Incident Controller', () => {
    it('should return 400 for missing required fields in create', async () => {
        mockReq.body = {};
        // Mock the service to throw the expected error
        jest.spyOn(incidentService, 'createIncidentService').mockRejectedValueOnce(new Error('Description must be at least 10 characters long'));
        await createIncidentController(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringMatching(/Description must be at least 10 characters long/) }));
    });

    it('should return 201 for valid incident creation', async () => {
        mockReq.body = { type: 'fall', description: 'desc for controller', status: 'open' };
        // Mock the service to return the expected incident
        jest.spyOn(incidentService, 'createIncidentService').mockResolvedValueOnce({ ...mockReq.body, id: 1, userId: mockReq.user.uid });
        await createIncidentController(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ type: 'fall' }));
    });

    it('should return 500 for error in list', async () => {
        mockReq.query = {};
        const spy = jest.spyOn(incidentService, 'listIncidentsService').mockRejectedValueOnce(new Error('DB error'));
        await listIncidentsController(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(500);
        spy.mockRestore();
    });

    it('should return 400 for invalid status update', async () => {
        mockReq.params = { id: 1 };
        mockReq.body = { status: 'bad' };
        jest.spyOn(incidentService, 'updateIncidentStatusService').mockRejectedValueOnce(new Error('Status must be one of: open, in_progress, resolved, closed'));
        await updateIncidentStatusController(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringMatching(/Status must be one of/) }));
    });

    it('should export incidents as CSV', async () => {
        mockReq.query = { format: 'csv' };
        const result = { csv: 'ID,Type,Description\n1,fall,desc' };
        const spy = jest.spyOn(incidentService, 'exportIncidentsService').mockResolvedValueOnce(result);
        await exportIncidentsController(mockReq, mockRes);
        expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
        expect(mockRes.send).toHaveBeenCalledWith(result.csv);
        spy.mockRestore();
    });
});

describe('Error Handling', () => {
    it('should return 400 for invalid type', async () => {
        const req: any = { user: { uid: 'user-id' }, body: { type: 'invalid', description: 'Valid description' } };
        const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        await createIncidentController(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringMatching(/Type must be one of/) }));
    });

    it('should return 400 for short description', async () => {
        const req: any = { user: { uid: 'user-id' }, body: { type: 'fall', description: 'short' } };
        const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        await createIncidentController(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringMatching(/at least 10 characters/) }));
    });
});
