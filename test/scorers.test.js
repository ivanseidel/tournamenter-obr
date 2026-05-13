const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const artistica2026 = require('../sorters/artistica2026');

function loadScorers() {
  const factories = {};
  const moduleApi = {
    factory(name, factoryFn) {
      factories[name] = factoryFn();
      return moduleApi;
    },
  };

  const context = {
    angular: {
      module() {
        return moduleApi;
      },
    },
    Math,
    console,
  };

  const scorersPath = path.join(__dirname, '..', 'public', 'tournamenter-obr', 'scripts', 'scorers.js');
  const source = fs.readFileSync(scorersPath, 'utf8');
  vm.runInNewContext(source, context, { filename: scorersPath });

  return factories;
}

function cloneModel(model) {
  return JSON.parse(JSON.stringify(model));
}

test('registers the regional 2026 scorer with the expected base config', () => {
  const scorers = loadScorers();
  const scorer = scorers.RescueScorer2026Regional;

  assert.ok(scorer);
  assert.match(scorer.view, /^views\/rescue_scorer_2026_regional\.html\?r=/);
  assert.equal(scorer.totalTime, 300);
});

test('returns zero score and neutral multiplier for an untouched model', () => {
  const scorers = loadScorers();
  const scorer = scorers.RescueScorer2026Regional;
  const model = cloneModel(scorer.model);

  const result = scorer.score(model);

  assert.equal(result.total, 0);
  assert.equal(model.multiplier.value, 1);
});

test('computes a minimal mixed regional 2026 score correctly', () => {
  const scorers = loadScorers();
  const scorer = scorers.RescueScorer2026Regional;
  const model = cloneModel(scorer.model);

  model.squares.initial = 1;
  model.squares['1'] = 2;
  model.tentativa['1'] = 1;
  model.obstacles['11'] = true;
  model.victims_alive.total = 1;
  model.desafio_surpresa.completed = 1;

  const result = scorer.score(model);

  assert.equal(result.squares.initial, 5);
  assert.equal(result.squares['1'], 10);
  assert.equal(result.obstacles['11'], 20);
  assert.equal(model.multiplier.value, 1.95);
  assert.equal(result.total, 68);
});

test('sorts artistica 2026 scores with weighted score and tiebreakers', () => {
  const sort = artistica2026();

  const result = sort([80, 12, 70, 90, 3]);

  assert.deepEqual(result, [98, 160, -3]);
});

test('sorts artistica 2026 empty values as zero', () => {
  const sort = artistica2026();

  const result = sort([undefined, '', null, 50, '']);

  assert.deepEqual(result, [30, 50, -0]);
});
