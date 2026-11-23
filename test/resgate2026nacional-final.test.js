const test = require('node:test');
const assert = require('node:assert/strict');
const { methodName, finalColumn, register } = require('../sorters/resgate2026nacional');
const saveResgateFinal = require('../save-resgate-final');

class Table {
  constructor() {
    this.columns = 10;
    this.evaluateMethod = methodName;
  }

  calculate() { throw new Error('Unexpected legacy calculator'); }
}

register({ _model: Table, attributes: { evaluateMethod: {}, columns: {}, headerScore: {} } });

function makeScores() {
  return Array.from({ length: 11 }, (_, i) => ({
    id: i + 1,
    updatedAt: new Date(0),
    scores: Object.fromEntries([110 - i, 150, 80, 120, 50, 90, 10, 0, 0]
      .map((value, column) => [column, { value }])),
  }));
}

function setup({ changedDuringWrite = false } = {}) {
  const rows = makeScores();
  const updates = [];
  const route = saveResgateFinal({
    Table: { findOne: async (tableId) => tableId === 'table' ? new Table() : null },
    Scores: {
      find: async ({ tableId }) => tableId === 'table' ? rows : [],
      async update(criteria, fields) {
        updates.push({ criteria, fields });
        if (changedDuringWrite) return [];
        return [{ id: criteria.id, ...fields }];
      },
    },
  });

  async function submit(id, value = 42) {
    const response = { status: 200 };
    await route({
      params: { tableId: 'table', id: String(id) },
      body: { value, data: { completed: true }, updatedAt: new Date(0).toISOString() },
    }, {
      status(code) {
        response.status = code;
        return this;
      },
      json(body) { response.body = body; },
    }, (error) => { throw error; });
    return response;
  }

  return { rows, updates, submit };
}

test('final write confirms eligibility from the current table and preserves all preliminary cells', async () => {
  const { rows, updates, submit } = setup();
  const response = await submit(10, 0);

  assert.equal(response.status, 200);
  assert.equal(response.body.id, 10);
  assert.deepEqual(response.body.scores[finalColumn], { value: 0, data: { completed: true } });
  assert.deepEqual(updates, [{
    criteria: { id: 10, updatedAt: rows[9].updatedAt },
    fields: { scores: { ...rows[9].scores, [finalColumn]: response.body.scores[finalColumn] } },
  }]);
});

test('final write rejects a finalist displaced by a preliminary correction before saving', async () => {
  const { rows, updates, submit } = setup();
  const earlierTable = new Table();
  earlierTable.scores = rows;
  assert.equal(earlierTable.calculate().find((row) => row.id === 10).resgateFinalista, true);
  rows[10].scores[0].value = 120;

  const response = await submit(10);

  assert.equal(response.status, 409);
  assert.match(response.body.error, /não está classificada/);
  assert.deepEqual(updates, []);
});

test('final write rejects missing rows and invalid scores before updating', async () => {
  const { updates, submit } = setup();

  assert.equal((await submit(12)).status, 404);
  assert.equal((await submit(1, -1)).status, 400);
  assert.deepEqual(updates, []);
});

test('final write rejects a stale score after another tablet has saved the final', async () => {
  const { rows, updates, submit } = setup();
  rows[9].updatedAt = new Date(1);
  rows[9].scores[finalColumn] = { value: 17 };

  const response = await submit(10);

  assert.equal(response.status, 409);
  assert.match(response.body.error, /pontuação da equipe mudou/);
  assert.deepEqual(updates, []);
});

test('final write reports a conflict if the same row changed before the update', async () => {
  const { submit } = setup({ changedDuringWrite: true });

  const response = await submit(10);

  assert.equal(response.status, 409);
  assert.match(response.body.error, /pontuação da equipe mudou/);
});
