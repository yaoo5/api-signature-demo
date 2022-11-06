import crypto from "crypto";

export function sha256(text: string, secret: string): string {
    return crypto
        .createHmac('sha256', secret)
        .update(text)
        .digest('hex');
}
