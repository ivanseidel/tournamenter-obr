module.exports = function () {
  return function (scores) {
    const castedScores = scores.map((score) => parseInt(score || 0, 10));
    const pointsScores = castedScores.filter((_, index) => index % 2 === 0);
    const timeScores = castedScores.filter((_, index) => index % 2 !== 0);
    const sumPoints = pointsScores.reduce((acc, score) => acc + score, 0);
    const minPointsScore = Math.min(...pointsScores);
    const maxPointsScore = Math.max(...pointsScores);
    const maxPointsIndex = pointsScores.indexOf(maxPointsScore);

    const sumWithoutMin = sumPoints - minPointsScore;
    const sumTimes = timeScores.reduce((acc, score) => acc + score, 0);
    const timeOfMaxPointRound = timeScores[maxPointsIndex];

    return [sumWithoutMin, -sumTimes, -timeOfMaxPointRound, minPointsScore, pointsScores[0], pointsScores[1], pointsScores[2]];
  };
};
