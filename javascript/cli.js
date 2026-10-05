#!/usr/bin/env node
import { readFileSync, statSync } from 'node:fs';
import { VesremontClient } from './index.js';
import { withLogin } from './login.js';

const help = `vesremont 0.2.0 — Node.js 22+, запуск с внешнего ПК, не с сервера сайта
  vesremont status
  vesremont search "труборез"
  vesremont product 375094
  vesremont cart-link 375094 [количество]
  vesremont cart --login
  vesremont request GET /catalog/filters --query filters-query.json
  vesremont request POST /cart/items --body item.json --write --login --scope cart:write
  vesremont request POST /orders/submit --body confirmed.json --key <ключ> --write

Авторизация: --login (PKCE, согласие в браузере, токен отзывается после команды)
либо VESREMONT_ACCESS_TOKEN для уже полученного REST Bearer token. Не передавайте
токен аргументом командной строки. Для request --login явно укажите --scope.
POST/PATCH/DELETE требуют --write. Заказ всё равно требует prepare и подтверждения
покупателя на Vesremont. Результат — исходный JSON; может содержать личные данные.
Нет автоматических повторов запросов. Нет sandbox, все операции — production.
`;

function readObject(file) {
    if (statSync(file).size > 65536) throw new Error('Input file exceeds 64 KiB');
    const value = JSON.parse(readFileSync(file, 'utf8'));
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('JSON object required');
    return value;
}

async function main(args) {
    if (!args.length || args[0] === '--help') { console.log(help); return; }
    if (args[0] === '--version') { console.log('0.2.0'); return; }
    const positional = [], flags = {};
    for (let i = 0; i < args.length; i++) {
        const name = args[i];
        if (!name.startsWith('--')) { positional.push(name); continue; }
        if (!['--login', '--write', '--body', '--query', '--key', '--scope'].includes(name) || name in flags) throw new Error('Unknown/duplicate option');
        flags[name] = ['--login', '--write'].includes(name) ? true : args[++i];
        if (!flags[name]) throw new Error('Missing option value');
    }
    const [command, first, second] = positional;
    const counts = { status: [1], search: [2], product: [2], 'cart-link': [2, 3], cart: [1], request: [3] };
    if (!counts[command]?.includes(positional.length)) throw new Error('Invalid command; use --help');
    if (command !== 'request' && Object.keys(flags).some(name => name !== '--login')) throw new Error('Option only supported by request');
    if (flags['--login'] && !['request', 'cart'].includes(command)) throw new Error('This command needs no login');
    if (command === 'request' && first !== 'GET' && !flags['--write']) throw new Error('Mutation requires --write');
    if (flags['--scope'] && !flags['--login']) throw new Error('--scope requires --login');
    if (flags['--login'] && process.env.VESREMONT_ACCESS_TOKEN) throw new Error('Choose --login or VESREMONT_ACCESS_TOKEN, not both');
    const options = command === 'request' ? {
        query: flags['--query'] ? readObject(flags['--query']) : {},
        body: flags['--body'] ? readObject(flags['--body']) : first === 'GET' ? undefined : {},
        idempotencyKey: flags['--key'],
    } : {};
    const run = async token => {
        const api = new VesremontClient({ token });
        switch (command) {
            case 'status': return api.status();
            case 'search': return api.search(first);
            case 'product': return api.product(Number(first));
            case 'cart-link': return api.cartDraft(Number(first), second === undefined ? 1 : Number(second));
            case 'cart': return api.cart();
            case 'request': return api.request(first, second, options);
        }
    };
    const result = flags['--login']
        ? await withLogin(command === 'cart' ? 'cart:read' : flags['--scope'] || '', run)
        : await run(process.env.VESREMONT_ACCESS_TOKEN || '');
    console.log(JSON.stringify(result, null, 2));
}

main(process.argv.slice(2)).catch(error => {
    // Syntax/filesystem exceptions may echo sensitive input; report only known messages.
    console.error(error.name === 'ApiError' ? error.message + (error.requestId ? ` request_id=${error.requestId}` : '')
        : error.constructor === Error ? error.message : 'Invalid input or local configuration; use --help');
    process.exitCode = 1;
});
