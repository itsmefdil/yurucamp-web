import crypto from 'crypto';

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function generateId(length: number = 6): string {
    let id = '';
    // Generate random bytes
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
        // Use modulo to map byte to alphabet index
        // Note: biased if 256 is not divisible by ALPHABET.length (62), but negligible for small apps
        id += ALPHABET[bytes[i] % ALPHABET.length];
    }
    return id;
}
