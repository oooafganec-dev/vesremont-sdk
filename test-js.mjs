import assert from 'node:assert/strict';
import test from 'node:test';
import { VesremontClient, ApiError } from './javascript/index.js';
import { withLogin } from './javascript/login.js';
import http from 'node:http';
import { EventEmitter } from 'node:events';
import { createHash } from 'node:crypto';

test('SDK: routes, bearer, JSON, idempotency and safe errors, offline', async () => {
    const oldFetch = globalThis.fetch;
    const requests = [];
    globalThis.fetch = async (url, options) => {
        requests.push({ url, options });
        return new Response('{"ok":true}', { status: 200 });
    };
    try {
        const api = new VesremontClient({ token: 'test-token' });
        assert.deepEqual(await api.search('труборез', { page: 1 }), { ok: true });
        assert.equal(requests[0].url.origin, 'https://vesremont.com');
        assert.equal(requests[0].url.searchParams.get('q'), 'труборез');
        assert.equal(requests[0].options.headers.Authorization, 'Bearer test-token');
        assert.equal(requests[0].options.redirect, 'manual');
        assert.throws(() => api.request('GET', '//evil.example'), /path/);
        assert.throws(() => api.request('GET', '/../oauth'), /path/);
        assert.throws(() => api.request('POST', '/orders/submit', { body: {} }), /Idempotency/);
        await api.cartDraft(375094, 1);
        assert.equal(requests.at(-1).url.pathname, '/api/v1/cart-drafts/');
        await api.request('POST', '/orders/submit', { body: { confirmation_token: 'test-only' }, idempotencyKey: 'test-only-key-1234' });
        assert.equal(requests.at(-1).options.headers['Idempotency-Key'], 'test-only-key-1234');
        let calls = 0;
        globalThis.fetch = async () => { calls++; return new Response('{"code":"rate_limited","request_id":"abc","detail":"secret"}', { status: 429, headers: { 'Retry-After': '60' } }); };
        await assert.rejects(api.cart(), error => error instanceof ApiError && error.status === 429 &&
            error.retryAfter === '60' && error.requestId === 'abc' && !error.message.includes('secret'));
        assert.equal(calls, 1);
    } finally { globalThis.fetch = oldFetch; }
});

test('CLI PKCE: callback state, token exchange and revocation, mocked transport', async () => {
    const oldFetch = globalThis.fetch;
    const oldCreateServer = http.createServer;
    let authorization, revoked = false, receiver;
    http.createServer = () => {
        receiver = new EventEmitter();
        receiver.listen = (options, ready) => { assert.equal(options.host, '127.0.0.1'); assert.equal(options.port, 8765); ready(); };
        receiver.close = receiver.closeAllConnections = () => {};
        return receiver;
    };
    globalThis.fetch = async (url, options) => {
        const form = new URLSearchParams(options.body);
        if (url.pathname === '/oauth/token') {
            assert.equal(form.get('client_id'), 'vesremont-cli');
            assert.equal(form.get('resource'), 'https://vesremont.com/api/v1');
            assert.equal(createHash('sha256').update(form.get('code_verifier')).digest('base64url'), authorization.searchParams.get('code_challenge'));
            return new Response('{"access_token":"test-token"}');
        }
        assert.equal(url.pathname, '/oauth/revoke');
        assert.equal(form.get('token'), 'test-token');
        revoked = true;
        return new Response('{}');
    };
    try {
        const value = await withLogin('cart:read', async token => { assert.equal(token, 'test-token'); return 'ok'; }, message => {
            authorization = new URL(message.split('\n').at(-1));
            const callback = new URL('http://127.0.0.1:8765/callback');
            callback.search = new URLSearchParams({ state: authorization.searchParams.get('state'), iss: 'https://vesremont.com', code: 'test-code' });
            const response = { writeHead() {}, end() {} };
            // A request with wrong state cannot consume the pending authorization.
            receiver.emit('request', { method: 'GET', headers: { host: '127.0.0.1:8765' }, url: '/callback?state=wrong' }, response);
            receiver.emit('request', { method: 'GET', headers: { host: '127.0.0.1:8765' }, url: callback.pathname + callback.search }, response);
        });
        assert.equal(value, 'ok');
        assert.equal(revoked, true);
    } finally { globalThis.fetch = oldFetch; http.createServer = oldCreateServer; }
});
