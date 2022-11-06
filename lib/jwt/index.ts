import type {Context} from "koa";
import {base64decode, base64encode, HS256} from "../shared/tool";

export function sign(payload: Record<string | number, any>, secret): string {
    const header = { alg: 'HS256', type: "JWT" };
    const header64 = base64encode(JSON.stringify(header));
    const payload64 = base64encode(JSON.stringify(payload));
    const signature = HS256(`${header64}.${payload64}`, secret, 'base64');

    return `${header64}.${payload64}.${signature}`;
}

export function validate(jwt: any, secret): {
    valid: boolean
    message?: string
    header?: any
    payload?: any
    signature?: string
} {
    if (typeof jwt !== 'string' || !jwt) return { valid: false };

    const reg = /([^.]+)\.([^.]+)\.([^.]+)/;
    const match = reg.exec(jwt);

    if (!match) return { valid: false };

    const [, header, payload, signature] = match;
    const valid = HS256(`${header}.${payload}`, secret, 'base64') === signature;

    try {
        return {
            valid,
            header: JSON.parse(base64decode(header)),
            payload: JSON.parse(base64decode(payload)),
            signature}
    } catch (e) {
        return {
            valid: false,
            message: e.message
        }
    }
}

export default function (secret: string) {
    return async function (ctx: Context, next) {
        const tokenHeader = ctx.headers['authorization'];
        const forbidden = (message: string, code = -1, status = 401) => {
            ctx.status = status;
            ctx.body = { code, message: `[jwt middleware] valid failed, ${message}` }
        }

        // validate 1: if Authorization header exist
        if (!tokenHeader) return forbidden(`Authorization token not found`);
        // validate 2: if Authorization header a string
        if (typeof tokenHeader !== 'string') return forbidden(`Authorization token must be a string`);

        // validate 3: if Authorization header "Bearer <token>"
        const match = /Bearer (.+)/i.exec(tokenHeader);
        if (!match || !match[0]) return forbidden(`Authorization token must be "Authorization: Bearer <token>"`)

        // validate 4: if jwt token correct
        const token = match[1];
        const jwtValid = validate(token, secret);
        if (!jwtValid.valid) return forbidden(`signature failure`);

        // validate 5: custom valid, payload.role === 'admin'
        if (jwtValid.payload?.role !== 'admin') return forbidden(`Admin allowed,`, -1, 403)

        await next();
    }
}
