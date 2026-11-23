const { randomBytes, scrypt, timingSafeEqual } = require('crypto');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const derive = promisify(scrypt);
const prefix = '/tournamenter-obr';
const cookieName = 'obr_pontuador';
const sessionMs = 12 * 60 * 60 * 1000;
const attemptsMs = 60 * 1000;

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
  const sessions = new Map();
  let credential = null;
  let attempts = 0;
  let resetAt = 0;
  let change = Promise.resolve();
  const loaded = (async () => {
    try {
      const stored = JSON.parse(await fs.readFile(file, 'utf8'));
      if (!/^[0-9a-f]{32}$/.test(stored.salt) || !/^[0-9a-f]{128}$/.test(stored.hash)) {
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
    const match = /(?:^|;\s*)obr_pontuador=([0-9a-f]{64})(?:;|$)/.exec(req.headers.cookie || '');
    return match && match[1];
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
    return { enabled: Boolean(config.password && credential), adminConfigured: Boolean(config.password) };
  }

  function changePassword(password) {
    const work = change.then(async () => {
      await loaded;
      if (!config.password) return false;
      if (password !== null && (typeof password !== 'string' || password.trim().length < 12 ||
          Buffer.byteLength(password) > 256 || password === config.password)) return false;
      if (password === null) {
        await fs.unlink(file).catch((error) => { if (error.code !== 'ENOENT') throw error; });
        credential = null;
      } else {
        const salt = randomBytes(16).toString('hex');
        const hash = (await derive(password, salt, 64)).toString('hex');
        const next = { salt, hash };
        const tmp = file + '.' + randomBytes(8).toString('hex') + '.tmp';
        await fs.mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
        try {
          await fs.writeFile(tmp, JSON.stringify(next), { flag: 'wx', mode: 0o600 });
          await fs.rename(tmp, file);
        } finally {
          await fs.unlink(tmp).catch(() => {});
        }
        credential = next;
      }
      sessions.clear();
      return true;
    });
    change = work.catch(() => {});
    return work;
  }

  async function signIn(req, res) {
    await loaded;
    const current = credential;
    const password = req.body && req.body.password;
    if (!config.password || !current) return res.status(403).json({ error: 'O acesso de voluntários não está ativo.' });
    if (typeof password !== 'string' || Buffer.byteLength(password) > 256) {
      return res.status(400).json({ error: 'Senha inválida.' });
    }
    const start = now();
    if (start >= resetAt) {
      attempts = 0;
      resetAt = start + attemptsMs;
    }
    if (attempts >= 40) {
      return res.set('Retry-After', String(Math.ceil((resetAt - start) / 1000)))
        .status(429).json({ error: 'Muitas tentativas. Aguarde um minuto.' });
    }
    attempts += 1;
    const supplied = await derive(password, current.salt, 64);
    if (current !== credential || !timingSafeEqual(supplied, Buffer.from(current.hash, 'hex'))) {
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
