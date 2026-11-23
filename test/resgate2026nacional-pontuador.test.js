const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function harness(table, data = {}, load = false) {
  const controllers = {};
  const angularModule = {
    controller(name, handler) { controllers[name] = handler; return this; },
  };
  const alerts = [];
  const writes = [];
  vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,
    '../public/tournamenter-obr/scripts/controllers.js'), 'utf8'), {
    angular: { module: () => angularModule },
    _: { deepClone: (value) => JSON.parse(JSON.stringify(value)) },
    window: { alert: (message) => alerts.push(message) },
    console: { log() {} },
    setTimeout: (f) => f(),
  });
  const scorerScope = { $watch() {}, $apply() {} };
  const Scorer = { model: {}, totalTime: 480, score: () => ({ total: 42 }) };
  const timer = { reset() {}, data: { value: 1000 } };
  let modal;
  const $modal = {
    open({ resolve }) {
      const scope = {};
      const extra = resolve.extra();
      controllers.SaveScoreController(scope, { close: (selected) => modal.onClose(selected) },
        extra, { all: () => [table] });
      modal = { scope };
      return { result: { then: (callback) => { modal.onClose = callback; } } };
    },
  };
  const Score = {
    saveScore(payload, done) {
      const { number, value } = payload;
      writes.push([number, value]);
      data[number] = { value };
      done();
    },
    get({ id }, done) { done({ id, scores: data }); },
  };
  controllers.RescueScorer.at(-1)(scorerScope, Scorer, timer, $modal, Score);
  scorerScope.selectScoredTeam(load);
  modal.scope.selectTable(table);
  return { ...modal, writes, alerts, scorerScope };
}

const finalist = { id: 'a', resgateFinalista: true, scores: {} };
const other = { id: 'b', resgateFinalista: false, scores: {} };
const table = { columns: 10, evaluateMethod: 'resgate2026nacional', scores: [finalist, other] };

test('national final is separate from R3, saves only column 10, and verifies its readback', () => {
  const { scope, writes, alerts } = harness(table);
  assert.deepEqual(Array.from(scope.rounds(table)), ['Round 1', 'Round 2', 'Round 3', 'Final']);
  scope.selectRound(3);
  assert.equal(scope.teamAvailable(other), false);
  scope.selectScore(other);
  scope.ok();
  assert.deepEqual(writes, []);
  scope.selectScore(finalist);
  scope.ok();
  assert.deepEqual(writes, [[9, 42]]);
  assert.deepEqual(alerts, ['OK! Salvo com sucesso.']);
});

test('national final loads the stored score sheet from column 10', () => {
  const scored = { ...finalist, scores: { 9: { data: '{"completed":42}' } } };
  const { scope, writes, scorerScope } = harness(table, {}, true);
  scope.selectRound(3);
  scope.selectScore(scored);
  scope.ok();
  assert.equal(scorerScope.scoreData.completed, 42);
  assert.deepEqual(writes, []);
});

test('R3 still saves points and time to columns 5 and 6, including for legacy tables', () => {
  for (const mode of [table, { ...table, evaluateMethod: 'obr2025' }]) {
    const { scope, writes } = harness(mode);
    scope.selectRound(2);
    scope.selectScore(finalist);
    scope.ok();
    assert.deepEqual(writes, [[4, 42], [5, 480]]);
  }
});
