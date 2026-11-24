(function () {
  'use strict';

  const methodName = 'resgate2026nacional';
  const scoreHeaders = [
    'Pôster', 'Relatório', 'Pontos R1', 'Tempo R1', 'Pontos R2', 'Tempo R2',
    'Pontos R3', 'Tempo R3', 'Desafio Técnico', 'Pontos da Final',
  ];
  const current = { poster: 0, report: 1, roundPoints: [2, 4, 6], challenge: 8 };
  const legacy = { poster: 7, report: 8, roundPoints: [0, 2, 4], challenge: 6 };

  function isNationalRescue(table) {
    return table && (table.evaluateMethod === methodName || table.evaluateMethod === 'resgate2026obr');
  }

  function layoutFor(table) {
    if (!isNationalRescue(table)) return legacy;
    const labels = typeof table.headerScore === 'string'
      ? table.headerScore.split(',').map(label => label.trim())
      : (table.headers && table.headers.scores) || [];
    // Existing tables store score sheets by index along with their original headers.
    if (labels[0] === 'Pontos R1' || (labels[7] === 'Pôster' && labels[8] === 'Relatório')) return legacy;
    return current;
  }

  function roundPointsIndex(table, round) {
    return layoutFor(table).roundPoints[round];
  }

  const api = { methodName, scoreHeaders, isNationalRescue, layoutFor, roundPointsIndex };
  if (typeof window !== 'undefined') window.ResgateColumns = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
