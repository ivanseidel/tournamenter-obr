import { describe, expect, it } from 'vitest';
import { cloneModel, SCORERS } from '../src/domain/scorers';

describe('modern Rescue scorers', () => {
  it('keeps the active regional 2026 base configuration', () => {
    const scorer = SCORERS.RescueScorer2026Regional;

    expect(scorer.totalTime).toBe(300);
    expect(scorer.version).toBe('Regional 2026.1.5');
  });

  it('returns zero score and neutral multiplier for an untouched regional 2026 model', () => {
    const scorer = SCORERS.RescueScorer2026Regional;
    const model = cloneModel(scorer.model);

    const result = scorer.score(model);

    expect(result.total).toBe(0);
    expect(model.multiplier.value).toBe(1);
  });

  it('computes the existing mixed regional 2026 scenario', () => {
    const scorer = SCORERS.RescueScorer2026Regional;
    const model = cloneModel(scorer.model);

    model.squares.initial = 1;
    model.squares['1'] = 2;
    model.tentativa['1'] = 1;
    model.obstacles['11'] = true;
    model.victims_alive.total = 1;
    model.desafio_surpresa.completed = 1;

    const result = scorer.score(model);

    expect(result.squares).toMatchObject({ initial: 5, '1': 10 });
    expect(result.obstacles).toMatchObject({ '11': 20 });
    expect(model.multiplier.value).toBe(1.95);
    expect(result.total).toBe(68);
  });

  it('keeps 2025 regional rescue victim multiplier behavior', () => {
    const scorer = SCORERS.RescueScorer2025Regional;
    const model = cloneModel(scorer.model);

    model.squares.initial = 1;
    model.victims_alive.total = 2;
    model.victims_dead.total = 1;
    model.victims_switched.total = 1;

    const result = scorer.score(model);

    expect(model.multiplier.value).toBeCloseTo(2.417, 3);
    expect(result.total).toBe(12);
  });

  it('keeps 2025 nacional dead victim multiplier rule after two live victims', () => {
    const scorer = SCORERS.RescueScorer2025Nacional;
    const model = cloneModel(scorer.model);

    model.squares.initial = 1;
    model.victims_alive.total = 2;
    model.victims_dead.total = 1;
    model.desafio_surpresa.completed = 1;

    const result = scorer.score(model);

    expect(model.multiplier.value).toBeCloseTo(3.296, 3);
    expect(result.total).toBe(16);
  });
});
