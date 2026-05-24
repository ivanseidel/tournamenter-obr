export type RescueScoreModel = Record<string, Record<string, number | boolean>>;

export type ScoredModel = {
  total: number;
  [group: string]: number | Record<string, number>;
};

export type ScorerId =
  | 'RescueScorer2026Regional'
  | 'RescueScorer2025Regional'
  | 'RescueScorer2025Nacional';

export type ScorerDefinition = {
  id: ScorerId;
  label: string;
  version: string;
  totalTime: number;
  kind: 'regional' | 'nacional';
  model: RescueScoreModel;
  score(model: RescueScoreModel): ScoredModel;
};

export const ACTIVE_SCORER_ID: ScorerId = 'RescueScorer2026Regional';

function emptyModernModel(includeSwitched: boolean): RescueScoreModel {
  return {
    gaps: {},
    squares: {
      initial: 0,
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
      '6': 0,
    },
    tentativa: {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
      '6': 0,
    },
    obstacles: {},
    speedbump: {},
    intersection: {},
    passage: {},
    seesaw: {},
    becos: {},
    rampas: {},
    bonus_de_saida: { final: 0 },
    rescue_kit: { delivered: 0 },
    desafio_surpresa: { completed: 0 },
    victims: { total: 3, fails: 0 },
    victims_alive: { total: 0 },
    victims_dead: { total: 0 },
    ...(includeSwitched ? { victims_switched: { total: 0 } } : {}),
    multiplier: { value: 1 },
  };
}

type PointsGroup =
  | number
  | number[]
  | ((sub: string, val: number, model: RescueScoreModel) => number);

type ScoringTable = Record<string, PointsGroup>;

function numeric(value: number | boolean | undefined) {
  if (value === true) return 1;
  if (value === false || value === undefined) return 0;
  return Number(value) || 0;
}

function squarePoints(
  sub: string,
  val: number,
  model: RescueScoreModel,
  guardExtraAttempts = false,
) {
  const points = [0, 5, 3, 1];
  if (sub === 'initial') {
    return points[val] || 0;
  }
  const attempt = numeric(model.tentativa[sub]);
  const base = guardExtraAttempts ? points[attempt] || 0 : points[attempt];
  return (base || 0) * val;
}

function bonusDeSaida(model: RescueScoreModel, val: number, countAllAttemptsOverThree: boolean) {
  const totalLackOfProgress = Object.keys(model.tentativa)
    .map((index) => {
      const tentativa = numeric(model.tentativa[index]);
      const reduceOne = numeric(model.squares[index]) < 1 && tentativa === 3 ? 0 : 1;
      const shouldCountAllAttempts =
        countAllAttemptsOverThree && numeric(model.squares[index]) > 0 && tentativa > 3;
      return tentativa === 0 ? 0 : tentativa - (shouldCountAllAttempts ? 0 : reduceOne);
    })
    .reduce((prev, curr) => prev + curr, 0);
  const bonus = (60 - 5 * totalLackOfProgress) * val;
  return bonus > 0 ? bonus : 0;
}

function computeBaseScore(model: RescueScoreModel, scorings: ScoringTable) {
  const scored: ScoredModel = { total: 0 };

  Object.entries(model).forEach(([groupName, group]) => {
    const groupScore: Record<string, number> = {};
    Object.entries(group).forEach(([missionName, rawMission]) => {
      const mission = numeric(rawMission);
      const pointsGroup = scorings[groupName];
      let points = 0;
      if (typeof pointsGroup === 'function') {
        points = pointsGroup(missionName, mission, model);
      } else if (typeof pointsGroup === 'number') {
        points = pointsGroup * mission;
      } else if (Array.isArray(pointsGroup)) {
        points = pointsGroup[mission] || 0;
      }

      groupScore[missionName] = points;
      scored.total += points || 0;
    });
    scored[groupName] = groupScore;
  });

  return scored;
}

function regionalScorings(is2026: boolean): ScoringTable {
  return {
    becos: [0, 10],
    intersection: [0, 10],
    seesaw: [0, 20],
    obstacles: [0, 20],
    gaps: [0, 10],
    rampas: [0, 10],
    speedbump: [0, 10],
    tentativa: 0,
    passage: [0, 0],
    squares: (sub, val, model) => squarePoints(sub, val, model, is2026),
    rescue_kit: 0,
    desafio_surpresa: 0,
    bonus_de_saida: (_sub, val, model) => bonusDeSaida(model, val, is2026),
    multiplier: 0,
    victims: 0,
    victims_alive: 0,
    victims_dead: 0,
    victims_switched: 0,
  };
}

function nacionalScorings(): ScoringTable {
  return {
    gaps: [0, 10],
    tentativa: 0,
    obstacles: [0, 20],
    speedbump: [0, 10],
    intersection: [0, 10],
    passage: [0, 0],
    becos: [0, 10],
    rampas: [0, 10],
    seesaw: [0, 20],
    squares: (sub, val, model) => squarePoints(sub, val, model),
    rescue_kit: 0,
    desafio_surpresa: 0,
    bonus_de_saida: (_sub, val, model) => bonusDeSaida(model, val, false),
    multiplier: 0,
    victims: 0,
    victims_alive: 0,
    victims_dead: 0,
  };
}

function scoreRegional(model: RescueScoreModel, is2026: boolean) {
  const scored = computeBaseScore(model, regionalScorings(is2026));
  const victimSaveMultiplier = 1.3;
  const switchedSaveMultiplier = 1.1;
  const desafioMultipliers = [1, 1.5];

  const correctVictimsMultiplier = Math.pow(
    victimSaveMultiplier,
    numeric(model.victims_alive.total) + numeric(model.victims_dead.total),
  );
  const switchedVictimsMultiplier = Math.pow(
    switchedSaveMultiplier,
    numeric(model.victims_switched?.total),
  );
  const desafioMultiplier = desafioMultipliers[numeric(model.desafio_surpresa.completed)] || 1;
  const multiplier = Math.max(
    1,
    correctVictimsMultiplier * switchedVictimsMultiplier * desafioMultiplier,
  );

  model.multiplier.value = Math.round(multiplier * 1000) / 1000;
  scored.total = Math.round(scored.total * multiplier);
  return scored;
}

function scoreNacional(model: RescueScoreModel) {
  const scored = computeBaseScore(model, nacionalScorings());
  const victimSaveMultiplier = 1.3;
  const victimsLostPoints = 0.05;
  const rescueKitMultipliers = [1, 1, 1];
  const desafioMultipliers = [1, 1.5];

  let aliveMultiplier = Math.pow(
    victimSaveMultiplier - numeric(model.victims.fails) * victimsLostPoints,
    numeric(model.victims_alive.total),
  );
  if (aliveMultiplier < 1) {
    aliveMultiplier = 1;
  }
  if (numeric(model.victims_alive.total) === 2 && numeric(model.victims_dead.total) === 1) {
    let deadMultiplier = victimSaveMultiplier - numeric(model.victims.fails) * victimsLostPoints;
    if (deadMultiplier < 1) {
      deadMultiplier = 1;
    }
    aliveMultiplier *= deadMultiplier;
  }

  const multiplier = Math.max(
    1,
    aliveMultiplier *
      (rescueKitMultipliers[numeric(model.rescue_kit.delivered)] || 1) *
      (desafioMultipliers[numeric(model.desafio_surpresa.completed)] || 1),
  );

  model.multiplier.value = Math.round(multiplier * 1000) / 1000;
  scored.total = Math.round(scored.total * multiplier);
  return scored;
}

export const SCORERS: Record<ScorerId, ScorerDefinition> = {
  RescueScorer2026Regional: {
    id: 'RescueScorer2026Regional',
    label: 'Regional 2026.1.5',
    version: 'Regional 2026.1.5',
    totalTime: 300,
    kind: 'regional',
    model: emptyModernModel(true),
    score: (model) => scoreRegional(model, true),
  },
  RescueScorer2025Regional: {
    id: 'RescueScorer2025Regional',
    label: 'Regional 2025.1',
    version: 'Regional 2025.1',
    totalTime: 300,
    kind: 'regional',
    model: emptyModernModel(true),
    score: (model) => scoreRegional(model, false),
  },
  RescueScorer2025Nacional: {
    id: 'RescueScorer2025Nacional',
    label: 'Nacional 2025.2',
    version: 'Nacional 2025.2',
    totalTime: 480,
    kind: 'nacional',
    model: emptyModernModel(false),
    score: scoreNacional,
  },
};

export function cloneModel(model: RescueScoreModel) {
  return JSON.parse(JSON.stringify(model)) as RescueScoreModel;
}

export function activeScorer() {
  return SCORERS[ACTIVE_SCORER_ID];
}

export function sumSpecial(scored: ScoredModel, group: string, keys: Array<string | number>) {
  const groupScore = scored[group];
  if (!groupScore || typeof groupScore === 'number') {
    return 0;
  }
  return keys.reduce<number>((sum, key) => sum + (groupScore[String(key)] || 0), 0);
}
