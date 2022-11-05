import Koa from 'koa';
import Router from "koa-router";
import token from "./lib/token";

const app = new Koa();
app.keys = ['private key'];

const router = new Router({
    prefix: '/api'
});
router.post('/signature', (ctx) => ctx.body = 'hello world');
router.post('/signature/token', token('app-secret-token'), (ctx) => ctx.body = 'hello world');
router.post('/signature/jwt', (ctx) => ctx.body = 'hello world');
app.use(router.routes());

if (process.env.NODE_ENV !== 'test') {
    app.listen(3000, () => {
        console.log(`>>> app listen in http://localhost:3000`)
    });
}

export default app;
