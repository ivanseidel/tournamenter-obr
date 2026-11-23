const test = require('node:test');
const assert = require('node:assert/strict');
const Art = require('../public/tournamenter-obr/scripts/artistica');

function complete(id) {
  const draft = Art.createDraft(id);
  const column = Art.columns.find(item => item.id === id);
  for (const criterion of column.criteria) {
    draft.criteria[criterion.id].points = criterion.max || 0;
  }
  return draft;
}

test('each consensus sheet matches the tournament column and the published criterion maxima', () => {
  const expected = {
    video: [0, [30, 30, 20, 20]],
    poster: [1, [40, 40, 20]],
    entrevista: [4, [20, 30, 10, 20, 8, 3, 3, 3, 3, null, 10]],
    apresentacao1: [5, [30, 30, 10, 10, 10, 10, null, null, null]],
    apresentacao2: [6, [30, 30, 10, 10, 10, 10, null, null, null]],
    stand: [2, [5]]
  };
  assert.equal(Art.columns.length, 6);
  for (const column of Art.columns) {
    assert.deepEqual([column.index, column.criteria.map(c => c.max)], expected[column.id]);
    const max = Art.evaluate(column.id, complete(column.id));
    assert.equal(max.valid, true);
    assert.equal(max.total, column.max);
    assert.equal(max.bonus, column.id === 'entrevista' ? 10 : 0);
    assert.equal(Art.evaluate(column.id, Art.createDraft(column.id)).valid, false);
  }
});

test('criteria accept an explicit zero, reject missing, fractional, negative, unsafe and out-of-range marks', () => {
  const draft = complete('video');
  for (const entry of Object.values(draft.criteria)) entry.points = 0;
  assert.equal(Art.evaluate('video', draft).valid, true);
  assert.equal(Art.evaluate('video', draft).total, 0);
  for (const value of [null, undefined, '', '0', false, 1.1, -1, 31, NaN, Infinity]) {
    draft.criteria.robotica.points = value;
    assert.equal(Art.evaluate('video', draft).valid, false);
  }
  const interview = complete('entrevista');
  interview.criteria.deducao.points = Number.MAX_SAFE_INTEGER + 1;
  assert.equal(Art.evaluate('entrevista', interview).valid, false);
});

test('interview deducts the specified number of points and reports sustainability separately', () => {
  const draft = complete('entrevista');
  draft.criteria.deducao.points = 11;
  draft.criteria.sustentabilidade.points = 7;
  const {total, subtotal, deduction, bonus, valid} = Art.evaluate('entrevista', draft);
  assert.deepEqual({total, subtotal, deduction, bonus, valid},
    {total: 89, subtotal: 100, deduction: 11, bonus: 7, valid: true});
});

test('both performances deduct three per occurrence and award zero for a short performance', () => {
  for (const id of ['apresentacao1', 'apresentacao2']) {
    const draft = complete(id);
    draft.criteria.intervencoes.points = 2;
    draft.criteria.reinicios.points = 1;
    draft.criteria.excessoTempo.points = 3;
    assert.equal(Art.evaluate(id, draft).deduction, 18);
    assert.equal(Art.evaluate(id, draft).total, 82);
    draft.belowMinimum = true;
    assert.equal(Art.evaluate(id, draft).total, 0);
    draft.criteria.excessoTempo.points = 1.5;
    assert.equal(Art.evaluate(id, draft).valid, false);
  }
});

test('stand awards five points for participation and presentation', () => {
  const draft = complete('stand');
  for (const value of [0, 5]) {
    draft.criteria.participacao.points = value;
    assert.equal(Art.evaluate('stand', draft).valid, true);
    assert.equal(Art.evaluate('stand', draft).total, value);
  }
  draft.criteria.participacao.points = 3;
  assert.equal(Art.evaluate('stand', draft).valid, false);
});

test('stored sheets restore every criterion and justification for the selected column only', () => {
  const draft = complete('apresentacao2');
  draft.criteria.recurso1.justification = 'Pinça do robô abriu no momento previsto.';
  draft.justification = 'Nota acordada pela banca.\nReinício na troca de cenário.';
  draft.criteria.reinicios.points = 1;
  const restored = Art.restore('apresentacao2', JSON.stringify(draft));
  assert.deepEqual(restored, draft);
  assert.notEqual(restored.criteria.recurso1, draft.criteria.recurso1);
  assert.equal(Art.restore('apresentacao1', draft), null);
  for (const legacy of [null, '', 72, {}, '99', 'não é JSON']) {
    assert.equal(Art.restore('apresentacao2', legacy), null);
  }
  draft.criteria.recurso1.justification = {};
  assert.equal(Art.restore('apresentacao2', draft), null);
});
