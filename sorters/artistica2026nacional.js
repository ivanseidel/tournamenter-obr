module.exports = function () {
  return function (scores) {
    // Columns: Vídeo, Pôster, Entrevista, Palco 1, Palco 2, Sustentabilidade, Stand.
    const [video, poster, entrevista, apresentacao1, apresentacao2, sustentabilidade, stand] =
      Array.from({ length: 7 }, (_, index) => {
        const value = Number(scores[index] || 0);
        return Number.isFinite(value) ? value : 0;
      });

    const apresentacao = Math.max(apresentacao1, apresentacao2);
    const bonusSustentabilidade = Math.max(0, Math.min(sustentabilidade, 10));
    const bonusStand = Math.max(0, Math.min(stand, 5));
    const total = video * 0.15 + poster * 0.15 + entrevista * 0.3 +
      apresentacao * 0.4 + bonusSustentabilidade + bonusStand;

    return [total];
  };
};
