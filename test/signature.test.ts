import request from 'supertest';
import app from "../server";
import {sign, ValidCode} from "../lib/signature";

describe('request /api/signature/signature', () => {
    test('request /api/signature/signature non-appKey', async () => {
        const res = await request(app.callback())
            .post('/api/signature/signature')
            .expect(403)

        expect(res.body?.code).toEqual(ValidCode.appKeyNotFound)
        expect(res.body?.message).toMatch(/appKey/i)
    });

    test('request /api/signature/signature timestamp-expire', async () => {
        const res = await request(app.callback())
            .post('/api/signature/signature')
            .set('x-sg-appKey', 'my-app-key')
            .set('x-sg-timestamp', `${new Date('2020-01-01').getTime()}`)
            .expect(403)

        expect(res.body?.code).toEqual(ValidCode.signatureExpire)
        expect(res.body?.message).toMatch(/expire/i)
    });
    test('request /api/signature/signature nonce-not-found', async () => {
        const res = await request(app.callback())
            .post('/api/signature/signature')
            .set('x-sg-appKey', 'my-app-key')
            .set('x-sg-timestamp', `${new Date().getTime()}`)
            .expect(403)

        expect(res.body?.code).toEqual(ValidCode.nonceNotFound)
        expect(res.body?.message).toMatch(/nonce not found/i)
    });

    const nonceSuccess = 'nonce-success';
    test('request /api/signature/signature success', async () => {
        const now = Date.now();
        const appKey = 'my-app-key';
        const signature = sign(now, nonceSuccess, appKey, `${appKey}&app-secret`, '', {});
        const res = await request(app.callback())
            .post('/api/signature/signature')
            .set('x-sg-appKey', appKey)
            .set('x-sg-timestamp', `${now}`)
            .set('x-sg-nonce', nonceSuccess)
            .set('x-sg-signature', signature)
            .expect(200)
    });

    test('request /api/signature/signature nonce repeat', async () => {
        const now = Date.now();
        const appKey = 'my-app-key';
        const nonceSuccess = 'nonce-success';
        const signature = sign(now, nonceSuccess, appKey, `${appKey}&app-secret`, '', {});
        const res = await request(app.callback())
            .post('/api/signature/signature')
            .set('x-sg-appKey', appKey)
            .set('x-sg-timestamp', `${now}`)
            .set('x-sg-nonce', nonceSuccess)
            .set('x-sg-signature', signature)
            .expect(403);

        expect(res.body?.code).toEqual(ValidCode.nonceRepeated);
        expect(res.body?.message).toMatch(/nonce repeat/i);
    });

    test('request /api/signature/signature wrong queryString', async () => {
        const now = Date.now();
        const appKey = 'my-app-key';
        const signature = sign(now, `${now}`, appKey, `${appKey}&app-secret`, 'error', {});
        const res1 = await request(app.callback())
            .post('/api/signature/signature')
            .set('x-sg-appKey', appKey)
            .set('x-sg-timestamp', `${now}`)
            .set('x-sg-nonce', `${now}`)
            .set('x-sg-signature', signature)
            .expect(403)

        expect(res1.body?.code).toEqual(ValidCode.signatureFailure);
        expect(res1.body?.message).toMatch(/signature failure/i);
    });

    test('request /api/signature/signature wrong payload', async () => {
        const now = Date.now();
        const appKey = 'my-app-key';
        const signature = sign(now, `${now}`, appKey, `${appKey}&app-secret`, '', {a:1});
        const res = await request(app.callback())
            .post('/api/signature/signature')
            .set('x-sg-appKey', appKey)
            .set('x-sg-timestamp', `${now}`)
            .set('x-sg-nonce', `${now}`)
            .set('x-sg-signature', signature)
            .expect(403)

        expect(res.body?.code).toEqual(ValidCode.signatureFailure);
        expect(res.body?.message).toMatch(/signature failure/i);
    });
});
