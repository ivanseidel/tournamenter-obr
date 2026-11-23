const scorer = require('../public/tournamenter-obr/scripts/scorers')();
const { finalColumn } = require('../sorters/resgate2026nacional');
const { isNationalRescue, roundPointsIndex } = require('../public/tournamenter-obr/scripts/resgate-columns');

const legacyRescueMethods = new Set(['obr2025', 'obr2024', 'obr2018nacional', 'obr2017']);
const features = { passage: 14, obstacles: 16, seesaw: 16, speedbump: 25,
  intersection: 30, gaps: 20, becos: 16, rampas: 30 };
const filled = (row, index) => Boolean(row.scores && Object.prototype.hasOwnProperty.call(row.scores, index));
const record = (value) => value && typeof value === 'object' && !Array.isArray(value);

function number(value, max) {
  if (typeof value !== 'number' && (typeof value !== 'string' || !/^\d{1,2}$/.test(value))) {
    throw new Error('Campo inválido');
  }
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > max) throw new Error('Valor inválido');
  return n;
}

function roundScore(input) {
  if (!record(input)) throw new Error('Súmula inválida');
  const model = JSON.parse(JSON.stringify(scorer.model));
  for (const [key, values] of Object.entries(input)) {
    if (!Object.prototype.hasOwnProperty.call(model, key) || !record(values)) {
      throw new Error('Campo da súmula inválido');
    }
    for (const [index, value] of Object.entries(values)) {
      if (Object.prototype.hasOwnProperty.call(features, key)) {
        if (!/^\d{2}$/.test(index) || +index < 11 || +index > features[key] || typeof value !== 'boolean') {
          throw new Error('Obstáculo inválido');
        }
        model[key][index] = value;
      } else {
        if (!Object.prototype.hasOwnProperty.call(model[key], index)) throw new Error('Campo inválido');
        if (key === 'multiplier') continue; // Always derived by the scorer, not accepted from the client.
        const max = key === 'squares' ? (index === 'initial' ? 1 : 50) :
          key === 'tentativa' || key === 'victims' ? 50 :
          key === 'victims_alive' || key === 'rescue_kit' ? 2 : 1;
        model[key][index] = number(value, max);
      }
    }
  }
  const value = scorer.score(model).total;
  if (!Number.isSafeInteger(value) || value < 0) throw new Error('Pontuação inválida');
  return { value, data: model };
}

function eligibleTable(table) {
  return table && table.locked !== 'yes' && (isNationalRescue(table) || legacyRescueMethods.has(table.evaluateMethod)) &&
    Number(table.columns) > roundPointsIndex(table, 2) + 1;
}

function roundColumns(table, round, row) {
  if (round >= 0 && round <= 2 && Number.isInteger(round)) {
    const index = roundPointsIndex(table, round);
    return { index, time: index + 1 };
  }
  if (round === 3 && isNationalRescue(table) && Number(table.columns) > finalColumn &&
      row.resgateFinalista) return { index: finalColumn };
  return null;
}

function addFinalists(table, rows) {
  if (isNationalRescue(table) && Number(table.columns) > finalColumn) {
    table.scores = rows;
    table.calculate();
  }
  return rows;
}

module.exports = { eligibleTable, roundColumns, addFinalists, roundScore, filled };
