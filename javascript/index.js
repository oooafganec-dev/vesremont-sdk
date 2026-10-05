const ORIGIN = 'https://vesremont.com';
const LIMIT = 2 * 1024 * 1024;

export class ApiError extends Error {
    constructor(status, code, requestId = null, retryAfter = null) {
        super(`Vesremont: ${code} (HTTP ${status})`);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
        this.requestId = requestId;
        this.retryAfter = retryAfter;
    }
}

const safeText = value => typeof value === 'string' && /^[A-Za-z0-9_.:-]{1,128}$/.test(value) ? value : null;
const tokenValid = value => typeof value === 'string' && /^[A-Za-z0-9_.~-]{1,8192}$/.test(value);

// Shared with the CLI OAuth flow; fixed origin, verified TLS, no redirects/retries.
export async function exchange(path, { method = 'GET', body, token = '', key, timeout = 15000, form = false } = {}) {
    if (!/^\/(?:api\/v1\/|oauth\/(?:token|revoke)$)/.test(path) || path.includes('#') ||
        !Number.isInteger(timeout) || timeout < 1 || timeout > 60000 ||
        process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') throw new TypeError('Invalid request configuration');
    const url = new URL(path, ORIGIN);
    if (url.origin !== ORIGIN) throw new TypeError('Invalid origin');
    const headers = { Accept: 'application/json', 'User-Agent': 'Vesremont-JS/0.2.0' };
    if (token) {
        if (!tokenValid(token)) throw new TypeError('Invalid access token');
        headers.Authorization = `Bearer ${token}`;
    }
    if (key !== undefined) {
        if (typeof key !== 'string' || !/^[A-Za-z0-9._:-]{16,128}$/.test(key)) throw new TypeError('Invalid idempotency key');
        headers['Idempotency-Key'] = key;
    }
    const payload = body === undefined ? undefined : form ? new URLSearchParams(body).toString() : JSON.stringify(body);
    if (payload !== undefined) {
        if (Buffer.byteLength(payload) > 65536) throw new TypeError('Request body exceeds 64 KiB');
        headers['Content-Type'] = form ? 'application/x-www-form-urlencoded' : 'application/json';
    }
    try {
        const response = await fetch(url, { method, headers, body: payload, redirect: 'manual', signal: AbortSignal.timeout(timeout) });
        const chunks = [];
        let size = 0;
        for await (const chunk of response.body || []) {
            size += chunk.length;
            if (size > LIMIT) throw new ApiError(response.status, 'response_too_large');
            chunks.push(chunk);
        }
        let data;
        try { data = size ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : null; }
        catch { throw new ApiError(response.status, 'invalid_json'); }
        if (!response.ok) {
            throw new ApiError(response.status, safeText(data?.code) || 'http_error',
                safeText(data?.request_id), safeText(response.headers.get('retry-after')));
        }
        return data;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        // Do not include request URLs, tokens, response bodies or upstream error text.
        throw new ApiError(0, 'transport_error');
    }
}

export class VesremontClient {
    #token;
    #timeout;
    constructor({ token = '', timeout = 15000 } = {}) { this.#token = token; this.#timeout = timeout; }

    request(method, path, { query = {}, body, idempotencyKey } = {}) {
        if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(method) ||
            !/^\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*\/?$/.test(path)) throw new TypeError('Invalid API method/path');
        if (method === 'GET' && body !== undefined) throw new TypeError('GET body is not supported');
        if (body !== undefined && (body === null || typeof body !== 'object' || Array.isArray(body))) throw new TypeError('JSON object required');
        if (method === 'POST' && path.replace(/\/$/, '') === '/orders/submit' && !idempotencyKey) throw new TypeError('Idempotency-Key is required');
        const params = new URLSearchParams();
        for (const [name, value] of Object.entries(query)) {
            if (!/^[a-z_]{1,40}$/.test(name) || !['string', 'number', 'boolean'].includes(typeof value)) throw new TypeError('Query values must be scalar');
            params.set(name, String(value));
        }
        if (params.toString().length > 8192) throw new TypeError('Query exceeds 8192 characters');
        return exchange('/api/v1' + path + (params.size ? '?' + params : ''), {
            method, body, token: this.#token, key: idempotencyKey, timeout: this.#timeout,
        });
    }
    status() { return this.request('GET', '/status'); }
    search(q, query = {}) { return this.request('GET', '/products', { query: { ...query, q } }); }
    product(id) { return this.request('GET', '/products/' + positiveId(id)); }
    cart() { return this.request('GET', '/cart'); }
    cartDraft(productId, quantity = 1, draft) {
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new TypeError('Quantity must be 1..99');
        const query = { product_id: positiveId(productId), quantity };
        if (draft !== undefined) query.draft = draft;
        return this.request('GET', '/cart-drafts/', { query });
    }
}

function positiveId(value) {
    if (!Number.isInteger(value) || value < 1 || value > 2147483647) throw new TypeError('Positive product ID required');
    return value;
}
