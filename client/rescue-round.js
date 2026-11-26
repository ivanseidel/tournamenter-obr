const {
  isNationalRescue,
  roundPointsIndex,
} = require('../public/tournamenter-obr/scripts/resgate-columns');
const { current } = require('../public/tournamenter-obr/scripts/scorers');
const scorer = current();

function rounds(table) {
  if (!isNationalRescue(table)) return ['Round 1', 'Round 2', 'Round 3 ou Final'];
  const names = ['Round 1', 'Round 2', 'Round 3'];
  if (table.columns >= 10 && table.scores?.some((row) => row.resgateFinalista)) names.push('Final');
  return names;
}
function isFinal(table, round) {
  return isNationalRescue(table) && round === 3;
}
function column(table, round) {
  return isFinal(table, round) ? 9 : roundPointsIndex(table, round);
}
function available(table, round, row, volunteer) {
  return (
    (!isFinal(table, round) || row.resgateFinalista) && (!volunteer || !row.submittedRounds.includes(round))
  );
}
function loadRound(table, round, row) {
  const index = column(table, round);
  const stored = row.scores?.[index]?.data;
  if (!stored) throw new Error('Não há uma súmula salva para esta rodada.');
  return {
    data: typeof stored === 'string' ? JSON.parse(stored) : stored,
    seconds: isFinal(table, round) ? 0 : Number(row.scores[index + 1]?.value || 0),
  };
}
async function submitRound(request, { table, round, row, data, total, time, volunteer }) {
  if (!available(table, round, row, volunteer))
    throw new Error('Esta equipe não está disponível nesta rodada.');
  const final = isFinal(table, round);
  const index = column(table, round);
  const seconds = Number(time);
  if (
    !final &&
    (time == null ||
      String(time).trim() === '' ||
      !Number.isFinite(seconds) ||
      seconds < 0 ||
      seconds > scorer.totalTime)
  ) {
    throw new Error('Informe um tempo entre 0 e ' + scorer.totalTime + ' segundos.');
  }
  const ids = encodeURIComponent(table.id) + '/' + encodeURIComponent(row.id);
  if (volunteer) {
    return request('/tournamenter-obr/voluntario-api/sumulas/' + ids, {
      method: 'POST',
      body: { data, round, time: seconds },
    });
  }
  const scoreUrl = '/scores/' + encodeURIComponent(row.id);
  if (final) {
    await request('/obr-resgate-final/' + ids, {
      method: 'POST',
      body: { data, value: total, updatedAt: row.updatedAt },
    });
  } else {
    // The host compares updatedAt while replacing both cells in one persisted row.
    const scores = {
      ...row.scores,
      [index]: { value: total, data },
      [index + 1]: { value: Math.floor(seconds), data },
    };
    await request(scoreUrl, { method: 'PUT', body: { scores, updatedAt: row.updatedAt } });
  }
  const saved = await request(scoreUrl);
  if (
    Number(saved.scores?.[index]?.value) !== total ||
    (!final && Number(saved.scores?.[index + 1]?.value) !== Math.floor(seconds))
  ) {
    throw new Error('A pontuação lida da tabela difere da súmula enviada. Confira a tabela.');
  }
}
module.exports = { scorer, rounds, isFinal, column, available, loadRound, submitRound };
