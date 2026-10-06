import { createPrivateKey, createPublicKey, createHash } from 'node:crypto';
import { Resolver } from 'node:dns/promises';
import { readFile, writeFile, mkdtemp } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';

const registry = 'https://registry.modelcontextprotocol.io';
const archiveUrl = 'https://github.com/modelcontextprotocol/registry/releases/download/v1.8.1/mcp-publisher_windows_amd64.tar.gz';
const archiveHash = '399ad0d6e00a50812b563a71d8bfbff5160c085e6b13aac6ec083d98d5ff7c45';
const expectedName = 'com.vesremont/store';
const endpoint = 'https://vesremont.com/mcp';

async function get(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(25000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response;
}

async function findEntry(server) {
  const url = `${registry}/v0.1/servers/${encodeURIComponent(server.name)}/versions/${encodeURIComponent(server.version)}`;
  const response = await fetch(url, { redirect: 'error', headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' }, signal: AbortSignal.timeout(25000) });
  if (response.status === 404) return;
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  const entry = await response.json();
  if (entry.server?.name !== server.name || entry.server?.version !== server.version) throw new Error('Invalid Registry response');
  return entry;
}

function verifyEntry(entry, server) {
  if (entry._meta?.['io.modelcontextprotocol.registry/official']?.status !== 'active') throw new Error('Registry entry is not active');
  if (entry.server.websiteUrl !== server.websiteUrl || !entry.server.remotes?.some(remote => remote.type === 'streamable-http' && remote.url === endpoint)) {
    throw new Error('Registry entry exists, but its endpoint/website differs; publication stopped');
  }
}

async function main() {
  const option = process.argv[2];
  if (process.argv.length !== 3 || !['--help', '--check', '--verify', '--publish'].includes(option)) throw new Error('Use --help, --check, --verify or --publish');
  if (option === '--help') {
    console.log('node registry/publish-domain.mjs --check | --verify | --publish');
    console.log('--check verifies the descriptor, DNS proof and existing Registry entry; does not publish.');
    console.log('--verify reads the exact published Registry version without DNS login or reading a private key.');
    console.log('--publish then downloads SHA256-verified official mcp-publisher 1.8.1 and asks Enter before login/publish.');
    return;
  }
  if (process.platform !== 'win32' || process.arch !== 'x64') throw new Error('This owner workflow requires Windows x64');
  if (!process.env.LOCALAPPDATA) throw new Error('LOCALAPPDATA unavailable');
  const descriptorBytes = await readFile(new URL('./server.json', import.meta.url));
  const server = JSON.parse(descriptorBytes);
  if (server.name !== expectedName || server.version !== '1.0.0' || server.websiteUrl !== 'https://vesremont.com/developers/' || server.packages || server.remotes?.length !== 1 || server.remotes[0].type !== 'streamable-http' || server.remotes[0].url !== endpoint) {
    throw new Error('Review required: server.json differs from the approved remote descriptor');
  }
  if (option === '--verify') {
    console.log('НИЧЕГО НЕ НАЖИМАЕМ — чтение опубликованной версии Registry; до 25 секунд');
    const published = await findEntry(server);
    if (!published) throw new Error('Exact Registry version not found; no publication attempted');
    verifyEntry(published, server);
    console.log('MCP_REGISTRY=PASS com.vesremont/store@1.0.0; active, endpoint and website match');
    return;
  }
  const keyPath = path.join(process.env.LOCALAPPDATA, 'Vesremont', 'mcp-registry', 'ed25519.pem');
  const key = createPrivateKey(await readFile(keyPath));
  if (key.asymmetricKeyType !== 'ed25519') throw new Error('Expected the previously prepared Ed25519 key');
  const publicJwk = createPublicKey(key).export({ format: 'jwk' });
  const proof = 'v=MCPv1; k=ed25519; p=' + Buffer.from(publicJwk.x, 'base64url').toString('base64');
  console.log('НИЧЕГО НЕ НАЖИМАЕМ — проверка TXT и Registry; DNS до 5 секунд, HTTP до 25 секунд на запрос');
  const dns = new Resolver({ timeout: 5000, tries: 1 });
  dns.setServers(['1.1.1.1']);
  const records = await dns.resolveTxt('vesremont.com');
  if (!records.some(parts => parts.join('') === proof)) throw new Error('DNS proof is not visible yet. Add a separate TXT at @: ' + proof);
  console.log('MCP_DNS_PROOF=PASS');
  const existing = await findEntry(server);
  if (existing) {
    verifyEntry(existing, server);
    console.log('MCP_REGISTRY=PASS already published com.vesremont/store@1.0.0; no repeated publication');
    return;
  }
  console.log('Registry entry is not published yet');
  if (option === '--check') return;
  console.log('НИЧЕГО НЕ НАЖИМАЕМ — скачивание официального mcp-publisher 1.8.1; до 25 секунд');
  const bytes = Buffer.from(await (await get(archiveUrl)).arrayBuffer());
  if (createHash('sha256').update(bytes).digest('hex') !== archiveHash) throw new Error('Publisher archive SHA256 mismatch');
  const directory = await mkdtemp(path.join(tmpdir(), 'vesremont-mcp-publisher-'));
  const archive = path.join(directory, 'publisher.tar.gz');
  await writeFile(archive, bytes, { flag: 'wx' });
  const extract = spawnSync(path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'tar.exe'), ['-xzf', archive, '-C', directory, 'mcp-publisher.exe'], { timeout: 25000, stdio: 'inherit', windowsHide: true });
  if (extract.error || extract.status !== 0) throw new Error('Official publisher extraction failed');
  const descriptorPath = path.join(directory, 'server.json');
  await writeFile(descriptorPath, descriptorBytes, { flag: 'wx' });
  const readline = createInterface({ input: process.stdin, output: process.stdout });
  let answer;
  try { answer = await readline.question('В КОНСОЛИ — Enter означает ОК: публикуем com.vesremont/store 1.0.0 в официальном MCP Registry; любой текст останавливает: '); }
  finally { readline.close(); }
  if (answer !== '') { console.log('Publication cancelled'); return; }
  const executable = path.join(directory, 'mcp-publisher.exe');
  const seed = Buffer.from(key.export({ format: 'jwk' }).d, 'base64url');
  try {
    console.log('НИЧЕГО НЕ НАЖИМАЕМ — DNS login; до 60 секунд. Закрытый ключ не печатается');
    const login = spawnSync(executable, ['login', 'dns', '--domain', 'vesremont.com', '--private-key', seed.toString('hex')], { cwd: directory, timeout: 60000, stdio: 'inherit', windowsHide: true });
    if (login.error || login.status !== 0) throw new Error('DNS login failed; nothing published');
  } finally { seed.fill(0); }
  console.log('НИЧЕГО НЕ НАЖИМАЕМ — публикация; до 60 секунд');
  const publish = spawnSync(executable, ['publish', descriptorPath], { cwd: directory, timeout: 60000, stdio: 'inherit', windowsHide: true });
  if (publish.error || publish.status !== 0) throw new Error('Publisher did not confirm success. No automatic retry; check Registry before repeating');
  console.log('MCP_REGISTRY_UPLOAD=PASS; publication succeeded; checking public metadata');
  const published = await findEntry(server);
  if (!published) throw new Error('Publication succeeded, but Registry lookup has not confirmed it yet. Do not publish again');
  verifyEntry(published, server);
  console.log('MCP_REGISTRY=PASS com.vesremont/store@1.0.0; endpoint and website match');
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
