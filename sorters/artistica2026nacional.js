module.exports = function () {
  return function (scores) {
    // Columns: Vídeo, Pôster, Stand, Sustentabilidade, Entrevista, Palco 1, Palco 2, Dedução.
    const [video, poster, stand, sustentabilidade, entrevista, apresentacao1, apresentacao2, deducao] =
      Array.from({ length: 8 }, (_, index) => {
        const value = Number(scores[index] || 0);
        return Number.isFinite(value) ? value : 0;
      });

    const apresentacao = Math.max(apresentacao1, apresentacao2);
    const bonusSustentabilidade = Math.max(0, Math.min(sustentabilidade, 10));
    const bonusStand = Math.max(0, Math.min(stand, 5));
    const total = video * 0.15 + poster * 0.15 + entrevista * 0.3 +
      apresentacao * 0.4 + bonusSustentabilidade + bonusStand;

    // Tournamenter displays only the first value; subsequent values break ties.
    // Descending order: higher stage sum first, then fewer deduction points.
    return [total, apresentacao1 + apresentacao2, deducao === 0 ? 0 : -deducao];
  };
};
