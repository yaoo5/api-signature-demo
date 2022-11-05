import request from 'supertest';
import app from "../server";

describe('request all', () => {
    test('request /api/signature/token 403', async () => {
        await request(app.callback())
            .post('/api/signature/token')
            .expect(403);
    });
    test('request /api/signature/token 200',  async () => {
        await request(app.callback())
            .post('/api/signature/token')
            .set('x-token', 'app-secret-token')
            .expect(200);
    });
});
