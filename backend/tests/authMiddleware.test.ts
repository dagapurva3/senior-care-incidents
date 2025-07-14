import { authenticateToken } from '../src/middleware/auth';

jest.mock('../src/config/firebase', () => ({
  auth: () => ({
    verifyIdToken: jest.fn(),
  }),
}));

describe('Auth Middleware', () => {
  const mockRes: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockRes.status.mockClear();
    mockRes.json.mockClear();
    next.mockClear();
  });

  it('should return 401 for missing token', async () => {
    const mockReq: any = { headers: {} };
    await authenticateToken(mockReq, mockRes, next);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access token required' });
  });

  it('should return 403 for expired token', async () => {
    const mockReq: any = { headers: { authorization: 'Bearer expiredtoken' } };
    const admin = require('../src/config/firebase');
    admin.auth().verifyIdToken = jest.fn().mockRejectedValue(new Error('Token expired'));
    await authenticateToken(mockReq, mockRes, next);
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
  });

  it('should call next for valid token', async () => {
    const mockReq: any = { headers: { authorization: 'Bearer validtoken' } };
    const admin = require('../src/config/firebase');
    admin.auth = () => ({
      verifyIdToken: jest.fn().mockResolvedValue({ uid: 'test-user-id', email: 'test@example.com', name: 'Test User' })
    });
    await authenticateToken(mockReq, mockRes, next);
    expect(next).toHaveBeenCalled();
    expect(mockReq.user).toEqual({ uid: 'test-user-id', email: 'test@example.com', name: 'Test User' });
  });
});
