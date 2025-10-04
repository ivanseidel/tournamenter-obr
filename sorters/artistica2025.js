module.exports = function () {
  return function (scores) {
    const castedScores = scores.map((score) => Number(score || 0));
    const max =
      castedScores[1] > castedScores[2] ? castedScores[1] : castedScores[2];
    const score = castedScores[0] + max;
    const sum_palco = castedScores[1] + castedScores[2];

    return [score, sum_palco, castedScores[3] * -1];
  };
};
