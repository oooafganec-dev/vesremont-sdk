import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const root = new URL('./', import.meta.url);
const json = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const endpoint = 'https://vesremont.com/mcp';
const digest = bytes => 'sha256:' + createHash('sha256').update(bytes).digest('hex');
const plugin = await json('plugin.json');
assert.equal(plugin.$schema, 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json');
assert.equal(plugin.name, 'vesremont');
assert.equal(plugin.repository, 'https://github.com/oooafganec-dev/vesremont-sdk');
assert.match(plugin.version, /^\d+\.\d+\.\d+$/);
const portable = await json('mcp.json');
assert.equal(portable.$schema, 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json');
assert.deepEqual(portable.mcpServers, { vesremont: { type: 'streamable-http', url: endpoint } });
assert.deepEqual((await json('connections/claude-code.mcp.json')).mcpServers, { vesremont: { type: 'http', url: endpoint } });
assert.deepEqual((await json('connections/cursor.mcp.json')).mcpServers, { vesremont: { url: endpoint } });
assert.deepEqual((await json('connections/vscode.mcp.json')).servers, { vesremont: { type: 'http', url: endpoint } });
assert.deepEqual(await json('.mcp.json'), await json('connections/claude-code.mcp.json'));
assert.deepEqual(await json('.cursor/mcp.json'), await json('connections/cursor.mcp.json'));
assert.deepEqual(await json('connections/windsurf.mcp_config.json'), { mcpServers: { vesremont: { serverUrl: endpoint } } });
const claudeRule = await readFile(new URL('.claude/rules/vesremont-sdk.md', root), 'utf8');
assert.match(claudeRule, /^---\npaths:\n/);
const windsurfRule = await readFile(new URL('.windsurf/rules/vesremont-sdk.md', root), 'utf8');
assert.match(windsurfRule, /^---\ntrigger: model_decision\ndescription: .+\n---\n/);
const readme = await readFile(new URL('README.md', root), 'utf8');
for (const path of ['.mcp.json', '.cursor/mcp.json', '.claude/rules/vesremont-sdk.md', '.windsurf/rules/vesremont-sdk.md', 'connections/windsurf.mcp_config.json']) {
  assert.ok(readme.includes(`](${path})`), `README discovery link: ${path}`);
}
const codex = await readFile(new URL('connections/codex.toml', root), 'utf8');
assert.match(codex, /\[mcp_servers\.vesremont\]\r?\nurl = "https:\/\/vesremont\.com\/mcp"/);
assert.doesNotMatch(codex, /(?:token|headers|approval_mode)\s*=/);
const sources = await json('skills/sources.json');
assert.equal(sources.index, 'https://vesremont.com/.well-known/agent-skills/index.json');
const directories = (await readdir(new URL('skills/', root), { withFileTypes: true })).filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
assert.deepEqual(directories, sources.skills.map(entry => entry.name).sort());
assert.equal(new Set(directories).size, 3);
for (const entry of sources.skills) {
  assert.match(entry.name, /^vesremont-[a-z-]+$/);
  assert.equal(entry.url, `https://vesremont.com/.well-known/agent-skills/${entry.name}/SKILL.md`);
  const bytes = await readFile(new URL(`skills/${entry.name}/SKILL.md`, root));
  assert.equal(digest(bytes), entry.digest, `Snapshot digest: ${entry.name}`);
  const text = bytes.toString('utf8');
  assert.ok(text.startsWith(`---\nname: ${entry.name}\ndescription: `));
  assert.match(text, /\n---\n/);
  assert.doesNotMatch(text, /C:\\|AGENTS\.md|BEGIN PRIVATE KEY|Authorization: Bearer/);
  console.log(`PASS skill snapshot ${entry.name}`);
}
const server = await json('registry/server.json');
assert.equal(server.name, 'com.vesremont/store');
assert.deepEqual(server.remotes, [{ type: 'streamable-http', url: endpoint }]);
assert.equal(server.packages, undefined, 'SDK packages are not an MCP server implementation');
if (process.argv.includes('--public')) {
  async function get(url) {
    const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(25000) });
    assert.equal(response.status, 200, url);
    return response;
  }
  const index = await (await get(sources.index)).json();
  for (const entry of sources.skills) {
    const live = index.skills.find(skill => skill.name === entry.name);
    assert.ok(live, `Live discovery: ${entry.name}`);
    assert.equal(live.type, 'skill-md');
    assert.equal(new URL(live.url, sources.index).href, entry.url);
    assert.equal(live.digest, entry.digest, `Source changed; review new skill before updating ${entry.name}`);
    assert.equal(digest(Buffer.from(await (await get(entry.url)).arrayBuffer())), entry.digest);
    console.log(`PASS public source ${entry.name}`);
  }
  const record = await (await get(`https://registry.modelcontextprotocol.io/v0.1/servers/${encodeURIComponent(server.name)}/versions/${server.version}`)).json();
  assert.deepEqual(record.server, server, 'Published Registry descriptor matches local descriptor semantically');
  assert.equal(record._meta['io.modelcontextprotocol.registry/official'].status, 'active');
  const search = await (await get('https://registry.modelcontextprotocol.io/v0.1/servers?search=vesremont&limit=100')).json();
  assert.ok(search.servers.some(entry => entry.server.name === server.name && entry.server.version === server.version));
  console.log(`PASS Registry active, descriptor and search ${server.name}@${server.version}`);
}
console.log('AGENT_INTEGRATIONS=PASS; no store tools called, no publication or client OAuth claimed');
