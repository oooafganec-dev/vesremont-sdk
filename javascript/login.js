import http from 'node:http';
import { randomBytes, createHash } from 'node:crypto';
import { exchange } from './index.js';

const ORIGIN = 'https://vesremont.com';
const CLIENT = 'vesremont-cli';
const REDIRECT = 'http://127.0.0.1:8765/callback';
const RESOURCE = ORIGIN + '/api/v1';

// One command, one buyer consent. No credentials or tokens written to disk.
export async function withLogin(scope, action, display = console.error) {
    if (!/^[a-z_]+:[a-z_]+(?: [a-z_]+:[a-z_]+)*$/.test(scope) || scope.length > 500) throw new TypeError('Explicit REST scope required');
    const state = randomBytes(32).toString('base64url');
    const verifier = randomBytes(48).toString('base64url');
    const url = new URL('/oauth/authorize', ORIGIN);
    url.search = new URLSearchParams({ response_type: 'code', client_id: CLIENT, redirect_uri: REDIRECT,
        scope, resource: RESOURCE, state, code_challenge_method: 'S256',
        code_challenge: createHash('sha256').update(verifier).digest('base64url') }).toString();
    let timer, token;
    const server = http.createServer({ maxHeaderSize: 16384 });
    server.requestTimeout = server.headersTimeout = server.timeout = 10000;
    server.maxConnections = 8;
    server.on('clientError', (_error, socket) => socket.destroy());
    try {
        const code = await new Promise((resolve, reject) => {
            server.on('error', () => reject(new Error('OAuth callback port 8765 unavailable')));
            server.on('request', (req, res) => {
                res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store',
                    'Referrer-Policy': 'no-referrer', 'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'" });
                let callback;
                try { callback = new URL(req.url, REDIRECT); } catch { res.end('Invalid callback'); return; }
                const params = callback.searchParams;
                if (req.method !== 'GET' || req.headers.host !== '127.0.0.1:8765' ||
                    callback.origin !== 'http://127.0.0.1:8765' || callback.pathname !== '/callback' ||
                    [...params.keys()].length !== new Set(params.keys()).size ||
                    params.get('state') !== state || params.get('iss') !== ORIGIN) {
                    res.end('Invalid callback'); return;
                }
                clearTimeout(timer);
                res.end('Ответ принят. Вернитесь в консоль.');
                if (params.has('error')) { reject(new Error('OAuth consent denied')); return; }
                const value = params.get('code');
                if (!value || value.length > 8192 || /[\x00-\x20\x7f]/.test(value)) reject(new Error('Invalid OAuth code'));
                else resolve(value);
            });
            server.listen({ host: '127.0.0.1', port: 8765, exclusive: true }, () => {
                timer = setTimeout(() => reject(new Error('OAuth consent timed out')), 300000);
                display('Откройте ссылку на этом ПК и разрешите доступ на странице Vesremont (5 минут):\n' + url.href);
            });
        });
        server.close();
        server.closeAllConnections();
        const result = await exchange('/oauth/token', { method: 'POST', form: true, body: {
            grant_type: 'authorization_code', client_id: CLIENT, redirect_uri: REDIRECT,
            resource: RESOURCE, code, code_verifier: verifier,
        } });
        if (typeof result?.access_token !== 'string') throw new Error('OAuth token missing');
        token = result.access_token;
        return await action(token);
    } finally {
        clearTimeout(timer);
        server.close();
        server.closeAllConnections();
        if (token) {
            try { await exchange('/oauth/revoke', { method: 'POST', form: true, body: { client_id: CLIENT, token } }); }
            catch { display('Не удалось отозвать токен. Отзовите разрешение: https://vesremont.com/oauth/permissions'); }
        }
    }
}
