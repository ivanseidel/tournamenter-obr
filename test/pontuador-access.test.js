const test = require('node:test');
const assert = require('node:assert/strict');
const { mkdtemp, readFile, stat, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { createAccess } = require('../pontuador/access');
const { install } = require('../pontuador/routes');
const { installAdminScoreWrites } = require('../pontuador/score-writes');
const { roundScore } = require('../pontuador/submission');
const artistic = require('../public/tournamenter-obr/scripts/artistica');

const base = '/tournamenter-obr/voluntario-api';
const admin = '/obr-pontuador-config';
const firstPassword = 'senha exclusiva de teste';
const secondPassword = 'nova frase secreta de teste';

async function fixture(t, config = { password: 'senha administrativa de teste' }) {
  const dir = await mkdtemp(path.join(tmpdir(), 'pontuador-test-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'volunteers.json');
  let clock = Date.now();
  const access = createAccess(config, { file, now: () => clock });
  const routes = new Map();
  const server = {};
  for (const method of ['get', 'post', 'put']) {
    server[method] = (url, ...handlers) => routes.set(method + ' ' + url, handlers);
  }
  const tables = [{ id: '1', columns: 6, evaluateMethod: 'obr2025', name: 'N1', token: 'never read' },
    { id: '2', columns: 8, evaluateMethod: 'artistica2026nacional', name: 'Artística' },
    { id: '3', columns: 6, evaluateMethod: 'obr2025', name: 'Fechado', locked: 'yes' }];
  const rows = [{ id: 'a', tableId: '1', teamId: 't', scores: { 4: { value: 25, data: { private: true } } },
    updatedAt: new Date() }];
  const teams = [{ id: 't', name: 'Equipe A', hidden: 'private' }];
  let pauseUpdate;
  const snapshot = (rows) => structuredClone(rows);
  const Models = {
    Table: { find: async () => tables, findOne: async (id) => tables.find((table) => table.id === id) },
    Team: { find: async () => teams, findOne: async (id) => teams.find((team) => team.id === id) },
    Scores: {
      find: async ({ tableId }) => snapshot(rows.filter((row) => [].concat(tableId).includes(row.tableId))),
      findOne: async (id) => snapshot(rows.find((row) => row.id === id)),
      update: async (criteria, fields) => {
        if (pauseUpdate) {
          const pause = pauseUpdate;
          pauseUpdate = undefined;
          await pause();
        }
        assert.equal(criteria.id, 'a');
        const row = rows[0];
        if (+row.updatedAt !== +criteria.updatedAt || (criteria.tableId && row.tableId !== criteria.tableId)) return [];
        Object.assign(row, fields, { updatedAt: new Date(+row.updatedAt + 1) });
        return [snapshot(row)];
      },
    },
  };
  const adminAuth = (req, res, next) => req.admin ? next() : res.status(403).json({});
  const controllers = { Scores: { update: (req, res) => res.json({ metadata: req.body }) } };
  installAdminScoreWrites({ controllers, models: Models });
  server.get('/scores/:id/:number', adminAuth, controllers.Scores.updateScore);
  server.put('/scores/:id', adminAuth, controllers.Scores.update);
  install({ server, models: Models, config }, adminAuth, access);

  const request = (route, options = {}) => new Promise((resolve, reject) => {
    const result = { status: 200, headers: {} };
    const routePath = route.split(' ')[1];
    const res = {
      status(code) { result.status = code; return this; },
      set(key, value) { result.headers[key] = value; return this; },
      json(data) { resolve({ ...result, data }); return this; },
      redirect(url) { resolve({ status: 302, url }); },
      sendFile(file) { resolve({ ...result, file }); },
    };
    const req = {
      path: routePath, route: { path: routePath },
      body: options.body || {}, params: { tableId: '1', id: 'a', ...options.params },
      query: options.query || {},
      param: (name, fallback) => options.query?.[name] ?? fallback,
      headers: {cookie: options.cookie}, secure: true, admin: options.admin,
      get: (name) => name === 'X-OBR-Pontuador' && options.header !== false ? '1' : undefined,
      is: (type) => options.json !== false && type === 'application/json',
    };
    const handlers = routes.get(route);
    let i = 0;
    const next = (error) => {
      if (error) return reject(error);
      try { handlers[i++](req, res, next); } catch (error) { reject(error); }
    };
    next();
  });
  const configure = (body, options = {}) => request('post ' + admin, { admin: true, body, ...options });
  const signIn = async (password = firstPassword) => {
    const response = await request('post ' + base + '/login', { body: { password } });
    return { ...response, cookie: response.headers['Set-Cookie']?.split(';')[0] };
  };
  function pauseNextUpdate() {
    let release;
    const resume = new Promise((resolve) => { release = resolve; });
    const started = new Promise((resolve) => {
      pauseUpdate = () => { resolve(); return resume; };
    });
    return { release, started };
  }
  return { request, configure, signIn, file, rows, access, config, pauseNextUpdate, advance: (ms) => { clock += ms; } };
}

test('only an admin can set a separate password; credential persists privately and routes are isolated', async (t) => {
  const f = await fixture(t);
  assert.equal((await f.signIn()).status, 403);
  assert.equal((await f.configure({ password: firstPassword }, { admin: false })).status, 403);
  assert.equal((await f.configure({ password: f.config.password })).status, 400);
  assert.equal((await f.configure({ password: firstPassword }, { header: false })).status, 403);
  assert.equal((await f.configure({ password: firstPassword })).status, 200);
  assert.equal((await stat(f.file)).mode & 0o777, 0o600);
  assert.doesNotMatch(await readFile(f.file, 'utf8'), /exclusiva/);
  assert.equal((await f.signIn('senha incorreta')).status, 401);
  const login = await f.signIn();
  assert.match(login.headers['Set-Cookie'], /Path=\/tournamenter-obr; HttpOnly; SameSite=Strict; Max-Age=43200; Secure/);
  assert.equal((await f.request('get ' + admin, { cookie: login.cookie })).status, 403);
  const response = await f.request('get ' + base + '/tabelas', { cookie: login.cookie });
  assert.deepEqual(response.data, [{
    id: '1', name: 'N1', columns: 6, evaluateMethod: 'obr2025',
    scores: [{id: 'a', team: {name: 'Equipe A'}, resgateFinalista: false, submittedRounds: [2]}],
  }]);
  const restarted = createAccess(f.config, { file: f.file });
  assert.equal((await restarted.status()).enabled, true);
  assert.equal(restarted.valid({headers:{cookie:login.cookie}}), false);
});

test('rotation, logout, expiration and revocation prevent old sessions from continuing', async (t) => {
  const f = await fixture(t);
  await f.configure({ password: firstPassword });
  const first = await f.signIn();
  await f.configure({ password: secondPassword });
  const list = (cookie) => f.request('get ' + base + '/tabelas', { cookie });
  assert.equal((await list(first.cookie)).status, 401);
  assert.equal((await f.signIn()).status, 401);
  const second = await f.signIn(secondPassword);
  assert.equal((await list(second.cookie)).status, 200);
  await f.request('post ' + base + '/logout', { cookie: second.cookie });
  assert.equal((await list(second.cookie)).status, 401);
  const third = await f.signIn(secondPassword);
  f.advance(12 * 60 * 60 * 1000);
  assert.equal((await list(third.cookie)).status, 401);
  const fourth = await f.signIn(secondPassword);
  await f.configure({ disable: true });
  assert.equal((await list(fourth.cookie)).status, 401);
  assert.equal((await f.signIn(secondPassword)).status, 403);
});

test('volunteer access cannot be enabled if the Tournamenter is open without an admin password', async (t) => {
  const f = await fixture(t, {});
  assert.equal((await f.configure({ password: firstPassword })).status, 400);
  assert.equal((await f.signIn()).status, 403);
});

test('protected submission writes the first result and time together; never replaces existing cells', async (t) => {
  const f = await fixture(t);
  await f.configure({ password: firstPassword });
  const login = await f.signIn();
  const route = 'post ' + base + '/sumulas/:tableId/:id';
  const body = { round: 0, time: 70.5, data: {squares:{initial:1}}, value: 900 };
  assert.equal((await f.request(route, {body})).status, 401);
  assert.equal((await f.request(route, {cookie:login.cookie, body, json:false})).status, 403);
  assert.equal((await f.request(route, {cookie:login.cookie, body, params:{tableId:'3'}})).status, 409);
  assert.equal((await f.request(route, {cookie:login.cookie, body:{...body,round:3}})).status, 409);
  const write = () => f.request(route, {cookie:login.cookie, body});
  const one = await Promise.all([write(),write()]);
  assert.deepEqual(one.map((r) => r.status).sort(), [201,409]);
  assert.equal(f.rows[0].scores[0].value, 5);
  assert.equal(f.rows[0].scores[1].value, 70);
  assert.equal(f.rows[0].scores[4].value, 25);
  assert.equal((await write()).status, 409);
});

test('shared scorer and server validation preserve legal UI values and derive the total', () => {
  const calculated = roundScore({
    squares:{initial:1,'1':'2'}, tentativa:{'1':'1'}, obstacles:{'11':true},
    victims_alive:{total:2}, desafio_surpresa:{completed:1}, multiplier:{value:99},
  });
  assert.equal(calculated.value, 89);
  assert.equal(calculated.data.multiplier.value, 2.535);
  assert.throws(() => roundScore({squares:{'2':51}}));
  assert.throws(() => roundScore({gaps:{'55':true}}));
  assert.throws(() => roundScore({squares:{'invalid':1}}));
});

test('a simultaneous admin cell correction and a volunteer submission keep both rounds', async (t) => {
  const f = await fixture(t);
  await f.configure({ password: firstPassword });
  const { cookie } = await f.signIn();
  const pause = f.pauseNextUpdate();
  const correction = f.request('get /scores/:id/:number', {
    admin: true,
    query: { value: '43', data: { corrected: true } },
    params: { number: '2' },
  });
  await pause.started;
  const submission = f.request('post ' + base + '/sumulas/:tableId/:id', {
    cookie,
    body: { round: 0, time: 80, data: { squares: { initial: 1 } } },
  });
  await new Promise(setImmediate);
  pause.release();

  assert.deepEqual((await Promise.all([correction, submission])).map(({ status }) => status), [200, 201]);
  assert.equal(f.rows[0].scores[0].value, 5);
  assert.equal(f.rows[0].scores[1].value, 80);
  assert.equal(f.rows[0].scores[2].value, 43);
  assert.equal(f.rows[0].scores[4].value, 25);
});

test('an old table snapshot cannot erase a volunteer submission', async (t) => {
  const f = await fixture(t);
  await f.configure({ password: firstPassword });
  const { cookie } = await f.signIn();
  const oldTable = structuredClone(f.rows[0]);
  const submitted = await f.request('post ' + base + '/sumulas/:tableId/:id', {
    cookie,
    body: { round: 0, time: 80, data: { squares: { initial: 1 } } },
  });
  assert.equal(submitted.status, 201);

  const edit = ({ scores, updatedAt }) => f.request('put /scores/:id', {
    admin: true,
    body: { scores: { ...scores, 4: { value: 14 } }, updatedAt: updatedAt.toISOString() },
  });
  assert.equal((await edit(oldTable)).status, 409);
  assert.equal((await edit(f.rows[0])).status, 200);
  assert.equal(f.rows[0].scores[0].value, 5);
  assert.equal(f.rows[0].scores[1].value, 80);
  assert.equal(f.rows[0].scores[4].value, 14);
  const metadata = await f.request('put /scores/:id', { admin: true, body: { teamId: 't' } });
  assert.deepEqual(metadata.data, { metadata: { teamId: 't' } });
});

const artisticAdmin = '/obr-artistica-api';
const artisticVolunteer = base + '/artistica';
const artisticForm = '/sumulas/:tableId/:id/:column';

function completedForm(id, points) {
  const draft = artistic.createDraft(id);
  const column = artistic.columns.find((item) => item.id === id);
  for (const criterion of column.criteria) {
    const entry = draft.criteria[criterion.id];
    entry.points = points[criterion.id] || 0;
    entry.justification = 'Consenso sobre ' + criterion.id;
  }
  draft.justification = 'Avaliação concluída pelos juízes.';
  return draft;
}

test('artistic judges use the rescue session, see only names and submission status, and can create each sheet once', async (t) => {
  const f = await fixture(t);
  const row = f.rows[0];
  row.tableId = '2';
  row.scores = { 3: { value: 0, data: { private: true } } };
  await f.configure({ password: firstPassword });
  const { cookie } = await f.signIn();
  const list = 'get ' + artisticVolunteer + '/tabelas';
  const volunteerPage = '/tournamenter-obr/voluntario-artistica';
  const login = await f.request('get ' + volunteerPage);
  assert.equal(login.url, '/tournamenter-obr/acesso?modalidade=artistica');
  assert.equal((await f.request('get /tournamenter-obr/acesso', { cookie, query: { modalidade: 'artistica' } })).url, volunteerPage);
  const pageFile = path.join(__dirname, '../pontuador/artistica.html');
  assert.equal((await f.request('get ' + volunteerPage, { cookie })).file, pageFile);
  assert.equal((await f.request('get /obr-artistica', { cookie })).status, 403);
  assert.equal((await f.request('get /obr-artistica', { admin: true })).file, pageFile);
  assert.equal((await f.request(list)).status, 401);
  assert.equal((await f.request('get ' + artisticAdmin + '/tabelas', { cookie })).status, 403);
  assert.deepEqual((await f.request(list, { cookie })).data, [{
    id: '2', name: 'Artística', scores: [{ id: 'a', team: { name: 'Equipe A' }, submittedColumns: ['entrevista'] }],
  }]);
  const form = (method, column, options) => f.request(method + ' ' + artisticVolunteer + artisticForm, {
    cookie, params: { tableId: '2', column }, ...options,
  });
  assert.equal((await form('get', 'entrevista')).status, 409);
  const { data: empty } = await form('get', 'stand');
  assert.deepEqual(empty.cells, []);
  const body = { revision: empty.revision, data: completedForm('stand', { participacao: 5 }), value: 500 };
  assert.equal((await form('put', 'stand', { header: false, body })).status, 403);
  const results = await Promise.all([form('put', 'stand', { body }), form('put', 'stand', { body })]);
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
  assert.deepEqual(row.scores[2], { value: 5, data: body.data });
  assert.deepEqual(row.scores[3], { value: 0, data: { private: true } });
  assert.equal((await form('get', 'stand')).status, 409);
  await f.configure({ disable: true });
  assert.equal((await form('get', 'video')).status, 401);
});

test('artistic corrections check both interview cells and commit the validated consensus with its bonus atomically', async (t) => {
  const f = await fixture(t);
  const row = f.rows[0];
  row.tableId = '2';
  row.scores = { 0: { value: 70 }, 3: { value: 3 } };
  const form = (method, column, options) => f.request(method + ' ' + artisticAdmin + artisticForm, {
    admin: true, params: { tableId: '2', column }, ...options,
  });
  assert.equal((await form('get', 'entrevista', { params: { tableId: '1', column: 'entrevista' } })).status, 409);
  assert.equal((await form('get', 'deducao')).status, 400);
  assert.equal((await form('get', 'video', { params: { tableId: '2', id: 'missing', column: 'video' } })).status, 404);
  const { data: initial } = await form('get', 'entrevista');
  assert.equal(initial.cells[0].value, 3);
  const data = completedForm('entrevista', { software: 10, sustentabilidade: 8 });
  const altered = structuredClone(data);
  altered.criteria.software.points = 30;
  const save = (revision, draft) => form('put', 'entrevista', { body: { revision, data: draft, value: 999 } });
  assert.equal((await save(initial.revision, altered)).status, 400);
  assert.equal(row.scores[4], undefined);
  row.scores[3].value = 2;
  assert.equal((await save(initial.revision, data)).status, 409);
  const { data: fresh } = await form('get', 'entrevista');
  const result = await save(fresh.revision, data);
  assert.equal(result.status, 200);
  assert.deepEqual(row.scores[4], { value: 10, data });
  assert.deepEqual(row.scores[3], { value: 8, data });
  assert.deepEqual(row.scores[0], { value: 70 });
  assert.deepEqual((await form('get', 'entrevista')).data, result.data);
  assert.equal((await save(fresh.revision, data)).status, 409);
});

async function saveArtisticForm(f, column, points) {
  const route = artisticAdmin + artisticForm;
  const options = { admin: true, params: { tableId: '2', column } };
  const opened = await f.request('get ' + route, options);
  assert.equal(opened.status, 200);
  const body = { revision: opened.data.revision, data: completedForm(column, points) };
  const saved = await f.request('put ' + route, { ...options, body });
  assert.equal(saved.status, 200);
}

test('national ranking receives the sum of interview and both stage deductions after concurrent entries and corrections', async (t) => {
  const f = await fixture(t);
  f.rows[0].tableId = '2';
  f.rows[0].scores = {};
  await Promise.all([
    saveArtisticForm(f, 'entrevista', { software: 12, deducao: 2, sustentabilidade: 3 }),
    saveArtisticForm(f, 'apresentacao1', { impactoVisual: 20, reinicios: 1 }),
    saveArtisticForm(f, 'apresentacao2', { impactoVisual: 15, intervencoes: 2 }),
  ]);
  const ranking = require('../sorters/artistica2026nacional')();
  const ranked = () => ranking(Array.from({ length: 8 }, (_, i) => f.rows[0].scores[i]?.value));
  assert.deepEqual(ranked(), [12.8, 26, -11]);
  await saveArtisticForm(f, 'apresentacao1', { impactoVisual: 20, reinicios: 2 });
  const [score, stages, tieBreak] = ranked();
  assert.ok(Math.abs(score - 11.6) < 1e-10);
  assert.deepEqual([stages, tieBreak], [23, -14]);
  assert.deepEqual(f.rows[0].scores[7].data.deductions, { entrevista: 2, apresentacao1: 6, apresentacao2: 6 });
});

test('manual tie-break totals and unknown deductions from legacy sheets are preserved', async (t) => {
  const f = await fixture(t);
  const row = f.rows[0];
  row.tableId = '2';
  row.scores = { 5: { value: 65 } };
  await saveArtisticForm(f, 'entrevista', { software: 10, deducao: 2 });
  assert.equal(row.scores[7], undefined);
  row.scores[7] = { value: 0 };
  await saveArtisticForm(f, 'apresentacao1', { impactoVisual: 20, reinicios: 1 });
  assert.deepEqual(row.scores[7], { value: 0 });
  delete row.scores[7];
  await saveArtisticForm(f, 'apresentacao2', { impactoVisual: 20, reinicios: 1 });
  assert.equal(row.scores[7].value, 8);
  row.scores[7].value = 1; // Tournamenter may keep the scoring metadata on a manual edit.
  await saveArtisticForm(f, 'apresentacao1', { impactoVisual: 20, reinicios: 2 });
  assert.equal(row.scores[7].value, 1);
});
