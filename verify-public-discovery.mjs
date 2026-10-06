import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Public GETs only: no telemetry, registry publication, OAuth or store tools.
const repository = 'oooafganec-dev/vesremont-sdk';
const root = new URL('./', import.meta.url);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const pending = [];
async function get(url, allow404 = false) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Vesremont-public-discovery-check/1.0', 'Cache-Control': 'no-cache' },
    redirect: 'follow', signal: AbortSignal.timeout(25000)
  });
  assert.ok(response.status === 200 || (allow404 && response.status === 404), `${url}: HTTP ${response.status}`);
  return response;
}
function todo(message) {
  pending.push(message);
  console.log(`PENDING ${message}`);
}
try {
  console.log('НИЧЕГО НЕ НАЖИМАЕМ — публичные проверки GitHub/Registry/skills.sh; до 25 секунд на запрос, без вызова инструментов магазина');
  const server = JSON.parse(await readFile(new URL('registry/server.json', root), 'utf8'));
  const entryUrl = `https://registry.modelcontextprotocol.io/v0.1/servers/${encodeURIComponent(server.name)}/versions/${server.version}`;
  const entry = await (await get(entryUrl)).json();
  assert.deepEqual(entry.server, server);
  assert.equal(entry._meta['io.modelcontextprotocol.registry/official'].status, 'active');
  console.log(`PASS Registry ${server.name}@${server.version} active; endpoint/website match`);
  const matches = await (await get('https://registry.modelcontextprotocol.io/v0.1/servers?search=vesremont&limit=100')).json();
  assert.ok(matches.servers.some(value => value.server.name === server.name && value.server.version === server.version));
  console.log('PASS Registry search vesremont');
  const card = await get('https://smithery.ai/servers/oooafganec/Vesremont');
  assert.equal(card.url, 'https://smithery.ai/servers/oooafganec/Vesremont');
  const html = (await card.text()).replaceAll('\\"', '"');
  const proofMatch = html.match(/"verification":(\{[^{}]+\})/);
  assert.ok(proofMatch, 'Smithery verification payload is absent; inspect the current page format');
  const proof = JSON.parse(proofMatch[1]);
  assert.equal(proof.homepageHost, 'vesremont.com');
  assert.equal(proof.hasDomainProof, true);
  assert.equal(proof.hasBacklinkProof, true);
  console.log(`PASS Smithery domain/backlink proof; official=${proof.official}, checkedAt=${proof.checkedAt}`);
  for (const path of ['/', '/developers/']) {
    const site = await (await get(`https://vesremont.com${path}`)).text();
    assert.ok(site.includes('href="https://smithery.ai/servers/oooafganec/Vesremont"'));
    assert.ok(site.includes('registry.modelcontextprotocol.io'));
    console.log(`PASS site registry backlinks ${path}`);
  }
  const commit = await (await get(`https://api.github.com/repos/${repository}/commits/main`)).json();
  assert.match(commit.sha, /^[a-f0-9]{40}$/);
  console.log(`GITHUB_COMMIT=${commit.sha}`);
  const files = ['.gitattributes', 'README.md', 'AGENT_INTEGRATIONS.md', 'PUBLISHING.md', 'connections/README.md', 'registry/README.md',
    '.mcp.json', '.cursor/mcp.json', '.claude/rules/vesremont-sdk.md', '.windsurf/rules/vesremont-sdk.md',
    'connections/windsurf.mcp_config.json'];
  for (const path of files) {
    const response = await get(`https://raw.githubusercontent.com/${repository}/${commit.sha}/${path}`, true);
    if (response.status === 404) { todo(`GitHub file not published: ${path}`); continue; }
    const expected = await readFile(new URL(path, root));
    const actual = Buffer.from(await response.arrayBuffer());
    if (hash(actual) !== hash(expected)) todo(`GitHub bytes differ from reviewed follow-up: ${path}`);
    else console.log(`PASS GitHub exact file ${path}`);
  }
  const sources = JSON.parse(await readFile(new URL('skills/sources.json', root), 'utf8'));
  for (const skill of sources.skills) {
    const response = await get(`https://raw.githubusercontent.com/${repository}/${commit.sha}/skills/${skill.name}/SKILL.md`);
    assert.equal('sha256:' + hash(Buffer.from(await response.arrayBuffer())), skill.digest);
    console.log(`PASS public GitHub skill digest ${skill.name}`);
    const page = await get(`https://www.skills.sh/${repository}/${skill.name}`, true);
    const content = await page.text();
    if (page.status === 404 || /isn.t available|Skill not found|NEXT_HTTP_ERROR_FALLBACK;404/i.test(content)) {
      todo(`skills.sh unavailable: ${skill.name}`);
    } else {
      // A title/name alone also exists on unavailable pages; require actual skill body.
      if (!content.includes(skill.name) || !content.includes('SKILL.md')) todo(`skills.sh listing cannot be confirmed: ${skill.name}`);
      else console.log(`AVAILABLE skills.sh ${skill.name}; official classification/adoption still requires directory review`);
    }
  }
  const ora = await (await get('https://ora.ai/api/score/vesremont.com')).json();
  console.log(`ORA_CACHED score=${ora.score}, scannedAt=${ora.scannedAt}; not a new scan`);
  for (const layer of ora.layers) {
    for (const check of layer.checks) {
      if (/mcp-registry-listed|skills-sh-listed|skills-sh-quality|agent-rules-repo/.test(check.id)) {
        console.log(`ORA ${check.id}: ${check.status} ${check.score}/${check.maxScore}: ${check.details}`);
      }
    }
  }
  console.log(`PUBLIC_CHECKS=PASS; EXTERNAL_PUBLICATION_OR_INDEXING_PENDING=${pending.length}; no artificial installs or usage`);
  if (pending.length) process.exitCode = 2;
} catch (error) {
  console.error(`PUBLIC_CHECK_FAILED: ${error.message}`);
  process.exitCode = 1;
}
