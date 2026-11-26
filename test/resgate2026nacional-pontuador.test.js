const test = require('node:test');
const assert = require('node:assert/strict');
const { rounds, available, loadRound, submitRound } = require('../client/rescue-round');

const finalist = { id: 'a', updatedAt: '2026-01-01T00:00:00.000Z', resgateFinalista: true, scores: {} };
const other = { id: 'b', resgateFinalista: false, scores: {} };
const table = {
  id: 'table',
  columns: 10,
  evaluateMethod: 'resgate2026nacional',
  scores: [finalist, other],
};
const base = { table, round: 3, row: finalist, data: {}, total: 42, time: 480, volunteer: false };

test('national final only saves column 10 for a finalist, and verifies the saved result', async () => {
  assert.deepEqual(rounds(table), ['Round 1', 'Round 2', 'Round 3', 'Final']);
  assert.equal(available(table, 3, other, false), false);
  await assert.rejects(submitRound(assert.fail, { ...base, row: other }), /disponível/);
  const calls = [];
  const request = async (url, options) => {
    calls.push([url, options]);
    return { scores: { 9: { value: 42 } } };
  };
  await submitRound(request, base);
  assert.deepEqual(calls, [
    [
      '/obr-resgate-final/table/a',
      { method: 'POST', body: { data: {}, value: 42, updatedAt: finalist.updatedAt } },
    ],
    ['/scores/a', undefined],
  ]);
  await assert.rejects(
    submitRound(async () => ({ scores: {} }), base),
    /difere da súmula/,
  );
});

test('national final surfaces a conflict when a team loses its place', async () => {
  const conflict = Object.assign(new Error('A equipe não está classificada para a final.'), {
    status: 409,
  });
  await assert.rejects(
    submitRound(async () => {
      throw conflict;
    }, base),
    (error) => error === conflict,
  );
});

test('loads old string and object score sheets from the national final', () => {
  for (const stored of ['{"completed":42}', { completed: 42 }]) {
    const row = { ...finalist, scores: { 9: { data: stored } } };
    assert.deepEqual(loadRound(table, 3, row), { data: { completed: 42 }, seconds: 0 });
  }
});

test('preliminary points and time are saved atomically in the slots for both layouts', async () => {
  const oldHeaders =
    'Pontos R1, Tempo R1, Pontos R2, Tempo R2, Pontos R3, Tempo R3, Desafio Técnico, Pôster, Relatório, Pontos da Final';
  for (const [mode, first] of [
    [table, 2],
    [{ ...table, evaluateMethod: 'resgate2026obr' }, 2],
    [{ ...table, headerScore: oldHeaders }, 0],
    [{ ...table, evaluateMethod: 'obr2025' }, 0],
  ]) {
    for (const round of [0, 1, 2]) {
      const index = first + round * 2;
      const row = { ...finalist, scores: { 8: { value: 11 } } };
      let writes = 0,
        scores;
      await submitRound(
        async (url, options) => {
          if (options) {
            writes++;
            assert.equal(options.method, 'PUT');
            assert.equal(options.body.updatedAt, row.updatedAt);
            scores = options.body.scores;
          }
          return { scores };
        },
        { ...base, table: mode, row, round },
      );
      assert.equal(writes, 1);
      assert.deepEqual(scores, {
        8: { value: 11 },
        [index]: { value: 42, data: {} },
        [index + 1]: { value: 480, data: {} },
      });
    }
  }
});

test('volunteers can submit explicit zero after correcting blank or invalid time', async () => {
  const args = { ...base, round: 0, volunteer: true, row: { ...finalist, submittedRounds: [] } };
  for (const time of ['', '  ', 'pendente', '-1', '481']) {
    await assert.rejects(submitRound(assert.fail, { ...args, time }), /Informe um tempo/);
  }
  let sent;
  await submitRound(
    async (url, options) => {
      sent = [url, options.body];
    },
    { ...args, time: '0' },
  );
  assert.deepEqual(sent, [
    '/tournamenter-obr/voluntario-api/sumulas/table/a',
    { data: {}, round: 0, time: 0 },
  ]);
});
