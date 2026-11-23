const { createHash, pbkdf2, randomBytes, scrypt, timingSafeEqual } = require('crypto');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const stat = promisify(fs.stat);
const rename = promisify(fs.rename);
const unlink = promisify(fs.unlink);
const derive = promisify(pbkdf2);
const deriveLegacyHash = typeof scrypt === 'function' ? promisify(scrypt) : null;
const iterations = 600000;
const passwordAlgorithm = 'pbkdf2-sha256-' + iterations;
const prefix = '/tournamenter-obr';
const sessionMs = 12 * 60 * 60 * 1000;
const attemptsMs = 60 * 1000;
const maxFailures = 10;
const maxConcurrentChecks = 4;

async function makeDirectory(folder) {
  try {
    await mkdir(folder, 0o700);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await makeDirectory(path.dirname(folder));
      return makeDirectory(folder);
    }
    if (error.code !== 'EEXIST' || !(await stat(folder)).isDirectory()) throw error;
  }
}

function passwordHash(password, credential) {
  if (credential.algorithm === passwordAlgorithm) {
    return derive(password, Buffer.from(credential.salt, 'hex'), iterations, 32, 'sha256');
  }
  return deriveLegacyHash(password, credential.salt, 64);
}

function credentialFile(config) {
  const folder = path.resolve(config.connection.filePath);
  const instance = path.basename(config.connection.fileName);
  const relative = path.relative(path.join(config.root, 'public'), folder);
  if (relative === '' || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative))) {
    throw new Error('O arquivo de credencial do pontuador não pode ficar em um diretório público.');
  }
  return path.join(folder, '.' + instance + '.obr-pontuador.json');
}

function createAccess(config, { file = credentialFile(config), now = Date.now } = {}) {
  // Browser cookies are shared by all ports on a hostname.
  const instance = createHash('sha256').update(path.resolve(file) + '\0' + (config.port || '')).digest('hex').slice(0, 16);
  const cookieName = 'obr_pontuador_' + instance;
  const cookiePattern = new RegExp('(?:^|;\\s*)' + cookieName + '=([0-9a-f]{64})(?:;|$)');
  const sessions = new Map();
  const attempts = new Map();
  let credential = null;
  let pruneAt = 0;
  let activeChecks = 0;
  let change = Promise.resolve();
  const loaded = (async () => {
    try {
      const stored = JSON.parse(await readFile(file, 'utf8'));
      const supportedHash = stored.algorithm === passwordAlgorithm && /^[0-9a-f]{64}$/.test(stored.hash);
      const legacyHash = stored.algorithm === undefined && /^[0-9a-f]{128}$/.test(stored.hash);
      if (!/^[0-9a-f]{32}$/.test(stored.salt) || (!supportedHash && !legacyHash)) {
        throw new Error('Metadados de credencial do pontuador inválidos.');
      }
      credential = stored;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  })();
  // A bad credential file must not crash or disable the existing admin interface.
  loaded.catch(() => {});

  function token(req) {
    const match = cookiePattern.exec(req.headers.cookie || '');
    return match && match[1];
  }

  function enabled() {
    return Boolean(config.password && credential && (credential.algorithm === passwordAlgorithm || deriveLegacyHash));
  }

  function valid(req) {
    const id = token(req);
    const expires = sessions.get(id);
    if (config.password && credential && expires && expires > now()) return true;
    sessions.delete(id);
    return false;
  }

  function writeCookie(res, req, value, seconds) {
    res.set('Set-Cookie', cookieName + '=' + value + '; Path=' + prefix +
      '; HttpOnly; SameSite=Strict; Max-Age=' + seconds + (req.secure ? '; Secure' : ''));
  }

  async function status() {
    await loaded;
    return { enabled: enabled(), adminConfigured: Boolean(config.password) };
  }

  function changePassword(password) {
    const work = change.then(async () => {
      await loaded;
      if (!config.password) return false;
      if (password !== null && (typeof password !== 'string' || password.trim().length < 12 ||
          Buffer.byteLength(password) > 256 || password === config.password)) return false;
      if (password === null) {
        await unlink(file).catch((error) => { if (error.code !== 'ENOENT') throw error; });
        credential = null;
      } else {
        const next = { algorithm: passwordAlgorithm, salt: randomBytes(16).toString('hex') };
        next.hash = (await passwordHash(password, next)).toString('hex');
        const tmp = file + '.' + randomBytes(8).toString('hex') + '.tmp';
        await makeDirectory(path.dirname(file));
        try {
          await writeFile(tmp, JSON.stringify(next), { flag: 'wx', mode: 0o600 });
          await rename(tmp, file);
        } finally {
          await unlink(tmp).catch(() => {});
        }
        credential = next;
      }
      sessions.clear();
      attempts.clear();
      return true;
    });
    change = work.catch(() => {});
    return work;
  }

  async function signIn(req, res) {
    await loaded;
    const current = credential;
    const password = req.body && req.body.password;
    if (!enabled()) return res.status(403).json({ error: 'O acesso de voluntários não está ativo.' });
    if (typeof password !== 'string' || Buffer.byteLength(password) > 256) {
      return res.status(400).json({ error: 'Senha inválida.' });
    }
    const start = now();
    if (start >= pruneAt) {
      for (const [origin, bucket] of attempts) if (bucket.resetAt <= start) attempts.delete(origin);
      pruneAt = start + attemptsMs;
    }
    const origin = req.ip || 'unknown';
    let bucket = attempts.get(origin);
    if (bucket && bucket.resetAt > start && bucket.failures >= maxFailures) {
      return res.set('Retry-After', String(Math.ceil((bucket.resetAt - start) / 1000)))
        .status(429).json({ error: 'Muitas tentativas. Aguarde um minuto.' });
    }
    if (activeChecks >= maxConcurrentChecks) {
      return res.set('Retry-After', '1').status(503).json({ error: 'Pontuador ocupado. Tente novamente.' });
    }
    if (!bucket || bucket.resetAt <= start) {
      bucket = { failures: 0, pending: 0, resetAt: start + attemptsMs };
      attempts.set(origin, bucket);
    }
    activeChecks += 1;
    bucket.pending += 1;
    try {
      const supplied = await passwordHash(password, current);
      if (current === credential && !timingSafeEqual(supplied, Buffer.from(current.hash, 'hex'))) {
        bucket.failures += 1;
        return res.status(401).json({ error: 'Senha inválida.' });
      }
    } finally {
      activeChecks -= 1;
      bucket.pending -= 1;
      if (!bucket.pending && !bucket.failures && attempts.get(origin) === bucket) attempts.delete(origin);
    }
    if (current !== credential || !config.password) {
      return res.status(401).json({ error: 'Senha inválida.' });
    }
    for (const [key, expires] of sessions) if (expires <= now()) sessions.delete(key);
    sessions.delete(token(req));
    if (sessions.size >= 1000) return res.status(503).json({ error: 'Limite de sessões atingido.' });
    const id = randomBytes(32).toString('hex');
    sessions.set(id, now() + sessionMs);
    writeCookie(res, req, id, sessionMs / 1000);
    return res.json({ ok: true });
  }

  function signOut(req, res) {
    sessions.delete(token(req));
    writeCookie(res, req, '', 0);
    return res.json({ ok: true });
  }

  return { status, changePassword, valid, signIn, signOut };
}

module.exports = { createAccess, prefix };
