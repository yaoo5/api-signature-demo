import type {Context} from "koa";
import {HS256} from "../shared/tool";

const nonceMap: { nonce: string | number, time: number }[] = [];

// expose ts declarations.
export interface ValidResult {
    code: number | string
    message?: string
}
export type IGetSecretByKey = (ctx: Context, appKey: string) => Promise<string>

// expose variables and functions
export const expire = 60 * 1000; // 60s有效期
export enum ValidCode {
    // 成功
    success = 0,
    // 签名过期
    signatureExpire = '40001',
    // 密钥不存在
    appKeyNotFound = '40002',
    // nonce重复
    nonceRepeated = '40003',
    // nonce不存在
    nonceNotFound= '40004',
    // 签名错误
    signatureFailure = '40005',
}

export function sign(
    timestamp: number,
    nonce: string,
    appKey: string,
    appSecret: string,
    queryString: string,
    requestPayload: Record<string | number | symbol, any>
) {
    // TODO: 需要对querystring做编码
    const str = `${timestamp}\n`
        + `${nonce}\n`
        + `${appKey}\n`
        + `${queryString}\n`
        + JSON.stringify(requestPayload)

    return HS256(str, appSecret);
}
export function validate(
    timestamp: number,
    nonce: string,
    appKey: string,
    appSecret: string,
    signature: string,
    queryString: string,
    requestPayload: Record<string | number | symbol, any>
): ValidResult {
    // TODO: 将nonce放到redis或内存缓存中
    // 去除过期的nonce
    while (nonceMap.length && nonceMap[0].time + expire < Date.now() ) nonceMap.shift();

    if (!appKey) return { code: ValidCode.appKeyNotFound }
    if (!timestamp || timestamp + expire < Date.now() || timestamp > Date.now()) return { code: ValidCode.signatureExpire }
    if (!nonce) return { code: ValidCode.nonceNotFound }
    if (nonceMap.some(n => n.nonce === nonce)) return { code: ValidCode.nonceRepeated }

    const mySignature = sign(timestamp, nonce, appKey, appSecret, queryString, requestPayload);
    if (mySignature !== signature) return { code: ValidCode.signatureFailure }

    nonceMap.push({ nonce, time: timestamp })

    return { code: 0, message: '' }
}

// default expose as middleware
export default function (options: {
    getSecretByKey: IGetSecretByKey
}) {
    return async function (ctx: Context, next) {
        const timestamp = +ctx.headers['x-sg-timestamp'];
        const nonce = ctx.headers['x-sg-nonce'] as string;
        const signature = ctx.headers['x-sg-signature'] as string;
        const appKey = ctx.headers["x-sg-appkey"];
        const queryString = ctx.querystring || '';
        const payload = ctx.body || {};
        const forbidden = (ctx: Context, message: string, code: number | string = -1 , status = 403) => {
            ctx.status = status;
            ctx.body = { code, message: `[signature middleware] valid failed, ${message}` }
        }

        // validate if appKey is a string, to get the appSecret by appKey
        if (typeof appKey !== 'string') {
            forbidden(ctx, `appKey must be a string. ${appKey}`, ValidCode.appKeyNotFound)
            return;
        }

        // validate signature
        const appSecret = await options.getSecretByKey(ctx, appKey);
        const valid = validate(timestamp, nonce, appKey, appSecret, signature, queryString, payload)

        // stop request as 403(Forbidden)
        if (valid.code !== ValidCode.success) {
            const errorMessage = {
                [ValidCode.signatureExpire]: 'signature expire',
                [ValidCode.appKeyNotFound]: 'app key not found',
                [ValidCode.signatureFailure]: 'signature failure',
                [ValidCode.nonceRepeated]: 'nonce repeated',
                [ValidCode.nonceNotFound]: 'nonce not found',
            }
            const message = errorMessage[valid.code] || `unknown error, ${valid.message}`;

            forbidden(ctx, message, valid.code)
            return;
        }

        await next();
    }
}
