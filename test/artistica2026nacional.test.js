const test = require('node:test');
const assert = require('node:assert/strict');
const artistica2026nacional = require('../sorters/artistica2026nacional');

const sort = artistica2026nacional();

test('national artistic score applies each evaluation weight independently', () => {
  const expected = [15, 15, 30, 40];
  expected.forEach((total, index) => {
    const scores = [0, 0, 0, 0, 0, 0];
    scores[index] = 100;
    assert.deepEqual(sort(scores), [total]);
  });
});

test('national artistic score adds the bonuses after weighting evaluations', () => {
  assert.deepEqual(sort([80, 70, 90, 85, 10, 5]), [98.5]);
  assert.deepEqual(sort([100, 100, 100, 100, 10, 5]), [115]);
  assert.deepEqual(sort([0, 0, 0, 0, 10, 5]), [15]);
});

test('national artistic bonuses stay between zero and their respective limits', () => {
  assert.deepEqual(sort([0, 0, 0, 0, 20, 10]), [15]);
  assert.deepEqual(sort([0, 0, 0, 0, -10, -5]), [0]);
  assert.deepEqual(sort([0, 0, 0, 0, 4.5, 2.5]), [7]);
});

test('national artistic score handles empty, missing and numeric string values', () => {
  assert.deepEqual(sort([]), [0]);
  assert.deepEqual(sort([undefined, '', null]), [0]);
  assert.deepEqual(sort(['80', '70', '90', '85', '10', '5']), [98.5]);
  assert.deepEqual(sort([0, 0, 0, 0, '10']), [10]);
  assert.deepEqual(sort([NaN, 'invalid', Infinity, -Infinity, NaN, 'invalid']), [0]);
});

test('national artistic score preserves decimal evaluations and the input array', () => {
  const scores = Object.freeze([80.5, 70.5, 90.5, 85.5, 4.5, 2.5]);
  assert.deepEqual(sort(scores), [91]);
  assert.deepEqual(scores, [80.5, 70.5, 90.5, 85.5, 4.5, 2.5]);
});
