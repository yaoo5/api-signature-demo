import request from 'supertest';
import app from "../server";

describe('request /api/signature/token', () => {
    test('request /api/signature/token non-token', async () => {
        await request(app.callback())
            .post('/api/signature/token')
            .expect(403);
    });
    test('request /api/signature/token wrong-token',  async () => {
        await request(app.callback())
            .post('/api/signature/token')
            .set('x-token', 'app-secret-token-wrong')
            .expect(403);
    });
    test('request /api/signature/token correct-token',  async () => {
        await request(app.callback())
            .post('/api/signature/token')
            .set('x-token', 'app-secret-token')
            .expect(200);
    });
});
