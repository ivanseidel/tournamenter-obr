import { describe, expect, it } from 'vitest';
import { parseTime, tableToCsv } from '../src/domain/rounds';

describe('rounds helpers', () => {
  it('parses valid times and rejects malformed or out-of-range values', () => {
    expect(parseTime('09:00')).toBe(540);
    expect(parseTime(' 9:07 ')).toBe(547);

    expect(parseTime('9:7')).toBe(false);
    expect(parseTime('99:99')).toBe(false);
    expect(parseTime('23:60')).toBe(false);
  });

  it('escapes CSV cells with separators, quotes, and line breaks', () => {
    const csv = tableToCsv([
      ['Equipe A, Fortaleza', 'Robo "Alpha"', 'Linha\nnova'],
      ['Equipe B', 'Sem escape', '10:00'],
    ]);

    expect(csv).toBe(
      '"Equipe A, Fortaleza","Robo ""Alpha""","Linha\nnova"\nEquipe B,Sem escape,10:00',
    );
  });
});
