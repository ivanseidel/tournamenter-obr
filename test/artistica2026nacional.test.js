const test = require('node:test');
const assert = require('node:assert/strict');
const artistica2026nacional = require('../sorters/artistica2026nacional');

const sort = artistica2026nacional();

// Tournamenter sorts returned keys lexicographically, reversing for descending tables.
const compareDescending = (a, b) => {
  const left = sort(a);
  const right = sort(b);
  for (let i = 0; i < left.length; i++) {
    if (left[i] !== right[i]) return right[i] - left[i];
  }
  return 0;
};

test('national artistic columns are video, poster, stand, sustainability, interview, stages, deduction', () => {
  const expected = [[15, 0, 0], [15, 0, 0], [5, 0, 0], [10, 0, 0],
    [30, 0, 0], [40, 100, 0], [40, 100, 0], [0, 0, -100]];
  expected.forEach((result, index) => {
    const scores = Array(8).fill(0);
    scores[index] = 100;
    assert.deepEqual(sort(scores), result);
  });
});

test('national artistic score adds the bonuses after weighting evaluations', () => {
  assert.deepEqual(sort([80, 70, 5, 10, 90, 85, 75, 2]), [98.5, 160, -2]);
  assert.deepEqual(sort([100, 100, 5, 10, 100, 100, 100, 0]), [115, 200, 0]);
  assert.deepEqual(sort([0, 0, 5, 10]), [15, 0, 0]);
});

test('national artistic score uses only the better stage for the total', () => {
  assert.deepEqual(sort([80, 70, 5, 10, 90, 85, 75]), [98.5, 160, 0]);
  assert.deepEqual(sort([80, 70, 5, 10, 90, 75, 85]), [98.5, 160, 0]);
  assert.deepEqual(sort([80, 70, 5, 10, 90, 85, 85]), [98.5, 170, 0]);
  assert.deepEqual(sort([0, 0, 0, 0, 0, undefined, 50]), [20, 50, 0]);
  assert.deepEqual(sort([0, 0, 0, 0, 0, 50, undefined]), [20, 50, 0]);
});

test('national artistic bonuses stay between zero and their respective limits', () => {
  assert.deepEqual(sort([0, 0, 10, 20]), [15, 0, 0]);
  assert.deepEqual(sort([0, 0, -5, -10]), [0, 0, 0]);
  assert.deepEqual(sort([0, 0, 2.5, 4.5]), [7, 0, 0]);
});

test('national artistic score handles empty, missing, invalid and numeric string values', () => {
  assert.deepEqual(sort([]), [0, 0, 0]);
  assert.deepEqual(sort([undefined, '', null]), [0, 0, 0]);
  assert.deepEqual(sort(['80', '70', '5', '10', '90', '75', '85', '2']), [98.5, 160, -2]);
  assert.deepEqual(sort([0, 0, 0, '10']), [10, 0, 0]);
  assert.deepEqual(sort([NaN, 'invalid', Infinity, -Infinity, NaN, 'invalid', NaN, Infinity]), [0, 0, 0]);
});

test('national artistic score preserves decimal evaluations and the input array', () => {
  const scores = Object.freeze([80.5, 70.5, 2.5, 4.5, 90.5, 85.5, 75.5, 1.5]);
  assert.deepEqual(sort(scores), [91, 161, -1.5]);
  assert.deepEqual(scores, [80.5, 70.5, 2.5, 4.5, 90.5, 85.5, 75.5, 1.5]);
});

test('deduction never changes total and fewer deduction points break otherwise equal scores', () => {
  const fewer = [80, 70, 5, 10, 90, 85, 75, 1];
  const more = [80, 70, 5, 10, 90, 85, 75, 10];
  assert.equal(sort(fewer)[0], 98.5);
  assert.equal(sort(more)[0], 98.5);
  assert.ok(compareDescending(fewer, more) < 0);
  assert.ok(compareDescending(more, fewer) > 0);
  assert.equal(compareDescending(fewer, [...fewer]), 0);
});

test('stage sum breaks equal final scores before deduction', () => {
  const higherSum = [80, 70, 5, 10, 90, 85, 80, 10];
  const lowerSum = [80, 70, 5, 10, 90, 85, 75, 0];
  assert.equal(sort(higherSum)[0], sort(lowerSum)[0]);
  assert.ok(compareDescending(higherSum, lowerSum) < 0);
});

test('higher final score outranks stage sum and deduction', () => {
  const higherTotal = [100, 100, 5, 10, 100, 80, 0, 100];
  const lowerTotal = [80, 70, 5, 10, 90, 85, 85, 0];
  assert.ok(sort(higherTotal)[0] > sort(lowerTotal)[0]);
  assert.ok(sort(higherTotal)[1] < sort(lowerTotal)[1]);
  assert.ok(compareDescending(higherTotal, lowerTotal) < 0);
});
