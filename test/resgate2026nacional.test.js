const test = require('node:test');
const assert = require('node:assert/strict');
const { register } = require('../sorters/resgate2026nacional');

const makeRow = (teamId, values) => ({
  teamId, scores: Object.fromEntries(values.map((value, i) => [i, { value }])),
});
const base = [110, 150, 80, 120, 50, 90, 10, 0, 0];
class Table {
  constructor(scores, evaluateMethod = 'resgate2026nacional') {
    Object.assign(this, { scores, evaluateMethod, columns: 10 });
  }

  calculate() { return 'legacy'; }
}
const attributes = { evaluateMethod: {}, columns: {}, headerScore: {} };
register({ _model: Table, attributes });

test('registration configures the new table defaults on the active collection', () => {
  assert.equal(attributes.evaluateMethod.defaultsTo, 'resgate2026nacional');
  assert.equal(attributes.columns.defaultsTo, 10);
  assert.deepEqual(attributes.headerScore.defaultsTo.split(', '), [
    'Pontos R1', 'Tempo R1', 'Pontos R2', 'Tempo R2', 'Pontos R3', 'Tempo R3',
    'Desafio Técnico', 'Pôster', 'Relatório', 'Pontos da Final',
  ]);
});

const rank = (...teams) => new Table(teams.map(([name, scores]) => makeRow(name, scores))).calculate();
const byId = (rows, id) => rows.find((row) => row.teamId === id);

test('arena includes the technical challenge; normalization uses the best arena in each table', () => {
  const other = [160, 100, 130, 150, 40, 160, 10, 0, 0];
  const evaluated = [...base.slice(0, 7), 18, 96];
  assert.equal(byId(rank(['A', evaluated], ['B', other]), 'A').final, 205);
  assert.equal(byId(rank(['A', evaluated]), 'A').final, 190);
  assert.equal(byId(rank(['A', evaluated], ['B', other]), 'B').final, 240);
});

test('desempate uses all three times including the discarded round', () => {
  const rows = rank(['X', base], ['Y', [110, 150, 80, 120, 50, 80, 10, 0, 0]]);
  assert.deepEqual(rows.map((row) => row.teamId), ['Y', 'X']);
});

test('zero time is accepted in the preliminary tie-break', () => {
  const rows = rank(['X', base], ['Y', [110, 0, ...base.slice(2)]]);
  assert.deepEqual(rows.map((row) => row.teamId), ['Y', 'X']);
});

test('among equal top scores, the fastest round breaks the tie even if it is not the first', () => {
  const rows = rank(
    ['X', [100, 100, 100, 50, 40, 100, 0, 0, 0]],
    ['Y', [100, 70, 100, 80, 40, 100, 0, 0, 0]],
  );
  assert.deepEqual(rows.map((row) => row.teamId), ['X', 'Y']);
});

test('equal totals and times use discarded points, then preliminary points in round order', () => {
  const rows = rank(
    ['X', [100, 100, 70, 100, 20, 100, 0, 0, 0]],
    ['Y', [100, 100, 70, 100, 30, 100, 0, 0, 0]],
    ['Z', [70, 100, 100, 100, 30, 100, 0, 0, 0]],
  );
  assert.deepEqual(rows.map((row) => row.teamId), ['Y', 'Z', 'X']);
  assert.deepEqual(rank(
    ['X', [100, 100, 20, 100, 70, 100, 0, 0, 0]],
    ['Y', [100, 100, 70, 100, 20, 100, 0, 0, 0]],
  ).map((row) => row.teamId), ['Y', 'X']);
});

function standings(values) {
  return values.map((n, i) => [String(i + 1), [n, 100, n, 110, 0, 120, 0, 0, 0]]);
}

test('only ten preliminary finalists receive final points, without changing arena normalization', () => {
  const teams = standings([100, 99, 98, 97, 96, 95, 94, 93, 92, 91, 90]);
  teams[9][1][9] = 100;
  teams[10][1][9] = 1000;
  const rows = rank(...teams);
  assert.equal(rows.filter((row) => row.resgateFinalista).length, 10);
  assert.equal(rows[0].teamId, '10');
  assert.equal(rows[0].final, 245.6);
  assert.equal(byId(rows, '11').final, 144);
});

test('standings exclude final points when the effective column count hides the final', () => {
  const table = new Table([makeRow('A', base), makeRow('B', [100, ...base.slice(1), 20])]);
  table.columns = 9;
  const rows = table.calculate();
  assert.deepEqual(rows.map((row) => [row.teamId, row.rank, row.final]), [
    ['A', 1, 160], ['B', 2, 152],
  ]);

  table.columns = 10;
  assert.deepEqual(table.calculate().map((row) => [row.teamId, row.rank, row.final]), [
    ['B', 1, 172], ['A', 2, 160],
  ]);
});

test('standings exclude hidden preliminary columns from scores and qualification', () => {
  const table = new Table([makeRow('A', [...base.slice(0, 7), 36, 96, 100])]);
  table.columns = 7;
  const [team] = table.calculate();
  assert.equal(team.final, 160);
  assert.equal(team.resgateFinalista, false);
});

test('cutoff tie does not select one of the tied teams arbitrarily', () => {
  const rows = rank(...standings([100, 99, 98, 97, 96, 95, 94, 93, 92, 91, 91]));
  assert.equal(rows.filter((row) => row.resgateFinalista).length, 9);
  assert.equal(byId(rows, '10').rank, 10);
  assert.equal(byId(rows, '11').rank, 10);
});

test('complete ties after adding the final stay tied, including a valid zero final', () => {
  const a = [100, 100, 50, 100, 0, 100, 0, 0, 0, 0];
  const b = [100, 120, 50, 120, 0, 120, 0, 0, 0, 0];
  assert.deepEqual(rank(['B', b], ['A', a]).map((row) => row.rank), [1, 1]);
  assert.deepEqual(rank(['B', b.slice(0, 9)], ['A', a.slice(0, 9)]).map((row) => row.rank), [1, 2]);
});

test('pending or invalid values do not qualify, while real zero is accepted', () => {
  const incomplete = [...base, 1000];
  incomplete[8] = '';
  const rows = rank(['A', incomplete], ['B', base]);
  assert.equal(rows.some((row) => row.resgateFinalista), false);
  assert.equal(byId(rows, 'A').final, 160);
  const allZero = Array(9).fill('0');
  assert.equal(rank(['A', allZero])[0].resgateFinalista, true);
  assert.equal(rank(['A', allZero])[0].final, 0);
});

test('non-resgate tables still use the original Tournamenter calculator', () => {
  assert.equal(new Table([], 'obr2025').calculate(), 'legacy');
  assert.equal(new Table([], 'artistica2026nacional').calculate(), 'legacy');
});

test('launching the final does not collapse pre-existing non-finalist tie-break positions', () => {
  const teams = standings([100, 99, 98, 97, 96, 95, 94, 93, 92, 91, 90, 90]);
  teams[0][1][9] = 1;
  teams[11][1][5] = 100;
  const rows = rank(...teams);
  assert.equal(byId(rows, '12').rank, 11);
  assert.equal(byId(rows, '11').rank, 12);
});
