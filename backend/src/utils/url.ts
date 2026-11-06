/**
 * Normalizes an optional external link supplied by a user.
 * Returns null for empty input, the trimmed URL for a valid https:// URL,
 * and undefined when the value is not an acceptable link (e.g. `javascript:`).
 */
export function normalizeHttpsUrl(value: unknown): string | null | undefined {
    if (value === undefined || value === null || value === '') return null;
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    if (trimmed === '') return null;
    // Allow links typed without a scheme (e.g. "chat.whatsapp.com/abc"), but never other schemes
    const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
    try {
        const url = new URL(withScheme);
        return url.protocol === 'https:' ? url.toString() : undefined;
    } catch {
        return undefined;
    }
}
