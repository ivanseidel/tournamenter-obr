const test = require('node:test');
const assert = require('node:assert/strict');
const { scryptSync } = require('node:crypto');
const { mkdtemp, readFile, rm, writeFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { createAccess } = require('../pontuador/access');

const password = 'uma senha de voluntários';
const config = { password: 'senha da coordenação' };

async function credentialPath(t) {
  const dir = await mkdtemp(path.join(tmpdir(), 'pontuador-login-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return path.join(dir, 'credential.json');
}

async function login(access, ip, supplied = password) {
  const result = { status: 200, headers: {} };
  const res = {
    set(name, value) { result.headers[name] = value; return this; },
    status(code) { result.status = code; return this; },
    json(body) { return { ...result, body }; },
  };
  return access.signIn({ ip, headers: {}, body: { password: supplied } }, res);
}

test('volunteer cookie names distinguish instances on the same hostname', async (t) => {
  const fileA = await credentialPath(t);
  const fileB = await credentialPath(t);
  const first = createAccess({ ...config, port: 3000 }, { file: fileA });
  const second = createAccess({ ...config, port: 3001 }, { file: fileB });
  await Promise.all([first.changePassword(password), second.changePassword(password)]);
  const [a, b] = await Promise.all([login(first, '192.0.2.1'), login(second, '192.0.2.1')]);
  const cookieA = a.headers['Set-Cookie'].split(';')[0];
  const cookieB = b.headers['Set-Cookie'].split(';')[0];
  assert.notEqual(cookieA.split('=')[0], cookieB.split('=')[0]);
  const req = { headers: { cookie: cookieA + '; ' + cookieB } };
  assert.equal(first.valid(req), true);
  assert.equal(second.valid(req), true);
});

test('failed logins consume the quota of their origin and new attempts stay bounded', async (t) => {
  let now = Date.now();
  const access = createAccess(config, { file: await credentialPath(t), now: () => now });
  await access.changePassword(password);
  const a = '192.0.2.1';
  const b = '192.0.2.2';
  for (let i = 0; i < 10; i += 1) {
    assert.equal((await login(access, a, 'senha incorreta')).status, 401);
  }
  assert.equal((await login(access, a)).status, 429);
  for (let i = 0; i < 11; i += 1) {
    assert.equal((await login(access, b)).status, 200);
  }
  now += 60000;
  assert.equal((await login(access, a)).status, 200);

  const batch = await Promise.all(Array.from({ length: 5 }, () => login(access, b)));
  assert.deepEqual(batch.map((r) => r.status), [200, 200, 200, 200, 503]);
  assert.equal(batch[4].headers['Retry-After'], '1');
});

test('a configured scrypt credential is still readable and rotation uses portable storage', async (t) => {
  const file = await credentialPath(t);
  const salt = '00112233445566778899aabbccddeeff';
  const hash = scryptSync(password, salt, 64).toString('hex');
  await writeFile(file, JSON.stringify({ salt, hash }));
  const access = createAccess(config, { file });
  assert.equal((await login(access, '192.0.2.1')).status, 200);

  await access.changePassword(password);
  const stored = JSON.parse(await readFile(file, 'utf8'));
  assert.equal(stored.algorithm, 'pbkdf2-sha256-600000');
  assert.match(stored.hash, /^[a-f0-9]{64}$/);
  assert.equal((await login(createAccess(config, { file }), '192.0.2.1')).status, 200);
});
