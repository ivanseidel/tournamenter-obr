const methodName = 'resgate2026nacional';
const preliminaryColumns = 9;
const finalColumn = 9;
const finalistCount = 10;
const scoreScale = 2880;

function readNumber(row, index, max = Infinity) {
  const value = row.scores && row.scores[index] && row.scores[index].value;
  if ((typeof value !== 'number' && typeof value !== 'string') ||
      (typeof value === 'string' && !value.trim())) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= max ? number : null;
}

function readTeam(row) {
  const scores = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) =>
    readNumber(row, index, ({ 1: 480, 3: 480, 5: 480, 7: 36, 8: 96 })[index]));
  const [r1, t1, r2, t2, r3, t3, challenge, poster, report] = scores;
  const points = [r1 ?? 0, r2 ?? 0, r3 ?? 0];
  const times = [t1 ?? 480, t2 ?? 480, t3 ?? 480];
  const discarded = Math.min(...points);
  const maxRound = Math.max(...points);
  const fastestTopRound = Math.min(...times.filter((_, index) => points[index] === maxRound));

  return {
    row,
    complete: scores.slice(0, preliminaryColumns).every((value) => value !== null),
    arena: points.reduce((sum, value) => sum + value, 0) - discarded + (challenge ?? 0),
    poster: poster ?? 0,
    report: report ?? 0,
    tieBreak: [-times.reduce((sum, value) => sum + value, 0), -fastestTopRound, discarded, ...points],
    finalPoints: readNumber(row, finalColumn),
  };
}

function compareKeys(left, right) {
  for (let i = 0; i < left.length; i++) {
    if (left[i] !== right[i]) return right[i] - left[i];
  }
  return 0;
}

function calculate(table) {
  const teams = (table.scores || []).map(readTeam);
  const maxArena = teams.reduce((max, team) => Math.max(max, team.arena), 0);

  for (const team of teams) {
    // Equivalent to arena * .8 + maxArena * (.1 * poster / 36 + .1 * report / 96).
    // Keep the common denominator until display to preserve exact ties for integer inputs.
    team.preliminary = 2304 * team.arena + maxArena * (8 * team.poster + 3 * team.report);
    team.preliminaryKeys = [team.preliminary, ...team.tieBreak];
  }
  teams.sort((a, b) => compareKeys(a.preliminaryKeys, b.preliminaryKeys));

  const boundaryTie = teams.length > finalistCount &&
    compareKeys(teams[finalistCount - 1].preliminaryKeys, teams[finalistCount].preliminaryKeys) === 0;
  const qualifyingCutoff = teams[finalistCount - 1];
  const preliminariesComplete = teams.every((team) => team.complete);
  teams.forEach((team, index) => {
    // A tie across the cutoff must be resolved by the organization. Do not pick
    // one of the tied teams based on the incoming database order.
    team.qualifies = preliminariesComplete && index < finalistCount &&
      (!boundaryTie || compareKeys(team.preliminaryKeys, qualifyingCutoff.preliminaryKeys) !== 0);
    team.row.resgateFinalista = team.qualifies;
    team.total = team.preliminary + (team.qualifies ? (team.finalPoints ?? 0) * scoreScale : 0);
  });

  // Rank by the original preliminary criteria until a finalist has a final
  // result. After that, do not invent a new tie-break absent an official ruling.
  const finalStarted = teams.some((team) => team.qualifies && team.finalPoints !== null);
  const keys = (team) => {
    if (!finalStarted) return team.preliminaryKeys;
    // Teams outside the final keep their preliminary order.
    return [team.total, team.qualifies ? 1 : 0, ...(team.qualifies ? [] : team.tieBreak)];
  };
  if (finalStarted) teams.sort((a, b) => compareKeys(keys(a), keys(b)));

  let rank = 0;
  teams.forEach((team, index) => {
    if (index === 0 || compareKeys(keys(teams[index - 1]), keys(team)) !== 0) rank = index + 1;
    team.row.final = team.total / scoreScale;
    team.row.rank = rank;
  });
  return teams.map((team) => team.row);
}

function register(tableCollection) {
  // The plugin initializes after Waterline has built the model instances.
  const prototype = tableCollection._model.prototype;
  const legacyCalculate = prototype.calculate;
  prototype.calculate = function (table) {
    if ((table || this).evaluateMethod !== methodName) return legacyCalculate.apply(this, arguments);
    this.scores = calculate(table || this);
    return this.scores;
  };
}

module.exports = { register };
