const { methodName, finalColumn } = require('./sorters/resgate2026nacional');
const { withScoreWrite } = require('./pontuador/score-writes');

module.exports = function saveResgateFinal(models) {
  const { Table, Scores } = models;

  return async function (req, res, next) {
    const { value, data, updatedAt } = req.body || {};
    const expectedUpdateTime = typeof updatedAt === 'string' ? Date.parse(updatedAt) : NaN;
    if (!Number.isSafeInteger(value) || value < 0 || !Number.isFinite(expectedUpdateTime) ||
        !data || typeof data !== 'object' || Array.isArray(data)) {
      return res.status(400).json({ error: 'Súmula ou pontuação inválida.' });
    }

    const { tableId, id } = req.params;
    return withScoreWrite(Scores, id, async () => {
      const [table, scores] = await Promise.all([
        Table.findOne(tableId),
        Scores.find({ tableId }),
      ]);
      if (!table) return res.status(404).json({ error: 'Tabela não encontrada.' });
      if (table.evaluateMethod !== methodName || table.columns <= finalColumn) {
        return res.status(409).json({ error: 'A tabela não tem uma final disponível.' });
      }

      table.scores = scores;
      const score = table.calculate().find((row) => String(row.id) === id);
      if (!score) return res.status(404).json({ error: 'Equipe não encontrada na tabela.' });
      if (!score.resgateFinalista) {
        return res.status(409).json({ error: 'A equipe não está classificada para a final.' });
      }

      if (new Date(score.updatedAt).getTime() === expectedUpdateTime) {
        const updatedScores = Object.assign({}, score.scores, { [finalColumn]: { value, data } });
        const [saved] = await Scores.update({ id: score.id, updatedAt: score.updatedAt }, { scores: updatedScores });
        if (saved) return res.json(saved);
      }
      return res.status(409).json({ error: 'A pontuação da equipe mudou.' });
    }).catch(next);
  };
};
