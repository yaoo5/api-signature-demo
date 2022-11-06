import request from "supertest";
import app from "../server";
import {sign} from "../lib/jwt";

const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

describe('request /api/signature/jwt', () => {
    test('request /api/signature/jwt non-Authorization', async () => {
        const res = await request(app.callback())
            .post('/api/signature/jwt')
            .expect(401);

        expect(res.body?.code).toEqual(-1);
        expect(res.body?.message).toMatch(/Authorization token not found/i);
    });

    test('request /api/signature/jwt error-format', async () => {
        const res = await request(app.callback())
            .post('/api/signature/jwt')
            .set('authorization', 'Bear token')
            .expect(401);

        expect(res.body?.code).toEqual(-1);
        expect(res.body?.message).toMatch(/Authorization token must be "Authorization: Bearer/i);
    });

    test('request /api/signature/jwt correct-jwt-and-wrong-role', async () => {
        const res = await request(app.callback())
            .post('/api/signature/jwt')
            .set('authorization', `Bearer ${jwt}`)

        expect(res.status).toEqual(403)
        expect(res.body?.code).toEqual(-1);
        expect(res.body?.message).toMatch(/admin allowed/i);
    });

    test('request /api/signature/jwt success', async () => {
        const jwt = sign({ role: 'admin' }, 'your-256-bit-secret');
        await request(app.callback())
            .post('/api/signature/jwt')
            .set('authorization', `Bearer ${jwt}`)
            .expect(200)
    });
});
