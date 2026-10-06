import { generateKeyPairSync, createPrivateKey, createPublicKey } from 'node:crypto';
import { mkdir, readFile, writeFile, lstat } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';

// Run explicitly on the owner's trusted workstation. Never store this key in Git.
if (process.argv.includes('--help')) {
  console.log('node registry/prepare-domain-proof.mjs');
  console.log('Creates/reuses a private Ed25519 key outside the repository and prints only the public DNS TXT proof. Does not publish or change DNS.');
  process.exit(0);
}
if (process.argv.length !== 2) throw new Error('Unexpected arguments; use --help');
const base = process.platform === 'win32' ? process.env.LOCALAPPDATA : path.join(homedir(), '.local', 'share');
if (!base || !path.isAbsolute(base)) throw new Error('Owner local application-data directory is unavailable');
const directory = path.join(base, 'Vesremont', 'mcp-registry');
const keyPath = path.join(directory, 'ed25519.pem');
await mkdir(directory, { recursive: true, mode: 0o700 });
if ((await lstat(directory)).isSymbolicLink()) throw new Error('Refusing a linked key directory');
let pem;
try {
  if ((await lstat(keyPath)).isSymbolicLink()) throw new Error('Refusing a linked key file');
  pem = await readFile(keyPath);
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
  const pair = generateKeyPairSync('ed25519');
  pem = pair.privateKey.export({ type: 'pkcs8', format: 'pem' });
  await writeFile(keyPath, pem, { flag: 'wx', mode: 0o600 });
}
const privateKey = createPrivateKey(pem);
if (privateKey.asymmetricKeyType !== 'ed25519') throw new Error('Existing key is not Ed25519; not overwriting');
const publicKey = createPublicKey(privateKey).export({ format: 'jwk' });
const value = 'v=MCPv1; k=ed25519; p=' + Buffer.from(publicKey.x, 'base64url').toString('base64');
console.log('В БРАУЗЕРЕ — в управлении DNS vesremont.com добавьте отдельную TXT-запись:');
console.log('Хост: @');
console.log('Значение: ' + value);
console.log('Не заменяйте SPF, DKIM, DMARC или запись Smithery. Это отдельная новая запись.');
console.log('Закрытый ключ сохранён только на этом ПК: ' + keyPath);
console.log('Не отправляйте ключ в чат, GitHub или DNS. Сохраните его в защищённой резервной копии.');
console.log('DNS и MCP Registry не изменены автоматически. После обновления DNS требуется отдельный login и publish владельцем.');
