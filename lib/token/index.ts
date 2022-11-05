import { type Context } from "koa";

type Token = string | (() => string)
export default (token: Token) => {
    return async function (ctx: Context, next) {
        const reqToken = ctx.headers['x-token'];
        const sysToken = typeof token === 'string' ? token : token();

        if (reqToken !== sysToken) {
            ctx.status = 403;
            ctx.message = `token middleware: valid token failed, get ${reqToken}`
            return;
        }

        await next();
    }
}
