import request from 'supertest';
import app from '../src/app';

describe('Global Error Handler', () => {
    it('should return 500 for unexpected errors', async () => {
        const res = await request(app)
            .get('/api/trigger-error')
            .set('Authorization', 'Bearer valid-token');
        expect(res.status).toBe(500);
        expect(res.body.error).toBeDefined();
    });
});
