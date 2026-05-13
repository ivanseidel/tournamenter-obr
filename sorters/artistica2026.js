module.exports = function () {
  return function (scores) {
    const castedScores = scores.map((score) => Number(score || 0));

    const entrevista = castedScores[0];
    const sustentabilidade = castedScores[1];
    const apresentacao1 = castedScores[2];
    const apresentacao2 = castedScores[3] || 0;
    const penalidades = castedScores[4] || 0;

    const maxApresentacao =
      apresentacao1 > apresentacao2 ? apresentacao1 : apresentacao2;

    const score = entrevista * 0.4 + maxApresentacao * 0.6 + sustentabilidade;

    const sum_palco = apresentacao1 + apresentacao2;

    return [score, sum_palco, penalidades * -1];
  };
};
