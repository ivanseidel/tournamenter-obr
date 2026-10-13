module.exports = function () {
  return function (scores) {
    // Columns: Vídeo, Pôster, Entrevista, Palco, Sustentabilidade, Stand.
    const [video, poster, entrevista, apresentacao, sustentabilidade, stand] =
      Array.from({ length: 6 }, (_, index) => {
        const value = Number(scores[index] || 0);
        return Number.isFinite(value) ? value : 0;
      });

    const bonusSustentabilidade = Math.max(0, Math.min(sustentabilidade, 10));
    const bonusStand = Math.max(0, Math.min(stand, 5));
    const total = video * 0.15 + poster * 0.15 + entrevista * 0.3 +
      apresentacao * 0.4 + bonusSustentabilidade + bonusStand;

    return [total];
  };
};
