import crypto from "crypto";
import {Buffer} from "buffer";

export type BinaryToTextEncoding = 'base64' | 'hex';
export function HS256(text: string, secret: string, encoding: BinaryToTextEncoding  = 'hex'): string {
    const hash = crypto.createHmac('sha256', secret).update(text).digest(encoding);

    return encoding === 'hex' ? hash : fixBase64(hash);
}

export function base64decode(base64: string) {
    return Buffer.from(base64, 'base64').toString();
}

export function base64encode(str: string): string {
    return fixBase64(Buffer.from(str, 'utf8').toString('base64'));
}

export function fixBase64(base64:string): string {
    return base64
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}
