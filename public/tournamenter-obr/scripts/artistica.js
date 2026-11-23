/* Rubricas da artística nacional. Compartilhadas pela tela e pela gravação da nota. */
(function () {
  'use strict';

  function criterion(id, label, max, help, kind) {
    return {id: id, label: label, max: max, help: help, kind: kind || 'score'};
  }

  function resources(max, help) {
    return [1, 2, 3, 4].map(function (n) {
      return criterion('recurso' + n, 'Recurso ' + n, max, help);
    });
  }

  var stageCriteria = [
    criterion('impactoVisual', 'Impacto visual e qualidade do conjunto', 30,
      'Avalie a clareza do tema ao longo da apresentação, a resposta emocional do público e o uso do palco, cenários, figurinos e adereços dos robôs.'),
    criterion('interacao', 'Interação robótica e integração do sistema', 30,
      'Observe a complexidade dos movimentos e sua relação com o tema. Considere a fluidez das interações, a participação humana a serviço da ação dos robôs e o uso integrado de sensores, motores e adereços interativos.')
  ].concat(resources(10, 'Avalie execução, visibilidade e impacto deste recurso. Ele funciona como previsto e contribui para a apresentação?'), [
    criterion('intervencoes', 'Intervenções humanas não planejadas', null,
      'Cada intervenção atribuível à equipe na área demarcada do palco desconta 3 pontos. Inclua as ações sob controle humano ou remoto.', 'occurrences'),
    criterion('reinicios', 'Reinícios', null,
      'Conte os reinícios atribuíveis à equipe. Cada reinício desconta 3 pontos.', 'occurrences'),
    criterion('excessoTempo', 'Blocos completos de 10 segundos excedentes', null,
      'Cada bloco completo de 10 segundos além do tempo alocado no palco ou na apresentação desconta 3 pontos. Desconsidere atrasos que não sejam atribuíveis à equipe.', 'occurrences')
  ]);

  var columns = [
    {
      id: 'video', label: 'Vídeo', index: 0, max: 100, source: 'https://forms.gle/3pWsZGaWPwuZUdwY8',
      criteria: [
        criterion('robotica', 'Robótica, demonstração e recursos', 30,
          'Verifique o sistema em funcionamento. Para cada um dos quatro recursos, avalie a explicação de como funciona, quando é usado na apresentação, por que foi escolhido e o que acrescenta ao desempenho.'),
        criterion('design', 'Processo de design', 30,
          'Avalie as escolhas de eletromecânica, sensores, energia, comunicação, software e uso de IA. Observe como a equipe resolveu os desafios e qual foi a contribuição de cada integrante.'),
        criterion('apresentacao', 'Apresentação', 20,
          'Considere a clareza da demonstração, o uso de gráficos e materiais de apoio e a comunicação das capacidades do robô, inclusive dos conceitos mais incomuns, criativos ou ambiciosos.'),
        criterion('inovacao', 'Inovação', 20,
          'Identifique a tecnologia nova ou inovadora nos quatro recursos e as evidências de testes e pesquisas que sustentam essa inovação.')
      ]
    },
    {
      id: 'poster', label: 'Pôster', index: 1, max: 100, source: 'https://forms.gle/tqcVf34P5riMGnH7A',
      criteria: [
        criterion('descricao', 'Descrição, resumo e desempenho', 40,
          'Avalie se o pôster apresenta a ideia da performance, explica os recursos escolhidos e traz evidências da autoria do projeto e da apresentação.'),
        criterion('tecnologia', 'Tecnologia da inovação', 40,
          'Considere como textos, fluxogramas, diagramas e imagens explicam as escolhas eletromecânicas, os sensores, a comunicação e o software. Procure evidências do domínio dos quatro recursos, de sua contribuição para o desempenho e do aprendizado entre versões do projeto.'),
        criterion('design', 'Design do pôster', 20,
          'Verifique o formato A3 horizontal e o estilo de pôster de pesquisa. Avalie legibilidade, organização, contraste e equilíbrio entre texto e imagens.')
      ]
    },
    {
      id: 'entrevista', label: 'Entrevista', index: 4, bonusIndex: 3, max: 100, source: 'https://forms.gle/JkmDMpzM8fZMWTDr6',
      criteria: [
        criterion('software', 'Habilidades técnicas em software', 20,
          'Avalie como a equipe explica o programa, a escolha da linguagem e a criação ou adaptação de modelos, dados e bibliotecas. Observe eficiência, otimização, documentação e controle de versões.'),
        criterion('hardware', 'Habilidades técnicas em hardware', 30,
          'Considere materiais, eletrônica e peças próprias, mecânica, estabilidade, energia, mobilidade e sustentabilidade. Avalie como sensores e atuadores integram percepção, orientação e resposta a imprevistos, incluindo a comunicação entre sistemas e a interação com robôs e pessoas.'),
        criterion('complexidade', 'Dificuldade e escolha da tecnologia', 10,
          'Considere a complexidade do software e do hardware, as escolhas que dão confiabilidade e durabilidade ao projeto e o uso de sistemas de alta precisão.'),
        criterion('engenharia', 'Engenharia e processo de design', 20,
          'Investigue como a equipe colaborou nas iterações do robô e do código, resolveu problemas entre software e hardware e usou IA, quando aplicável. Considere evidências de calibração, testes, depuração e habilidades adquiridas.'),
        criterion('equipe', 'Trabalho em equipe', 8,
          'Considere as contribuições dos integrantes para o trabalho e as evidências de que resolveram problemas em conjunto.')
      ].concat(resources(3, 'Avalie a demonstração ao vivo desta funcionalidade em pleno funcionamento.'), [
        criterion('deducao', 'Dedução a critério dos juízes', null,
          'Informe os pontos a descontar se os juízes questionarem a autoria do trabalho ou se os integrantes não conseguirem explicar sua participação técnica no robô.', 'deduction'),
        criterion('sustentabilidade', 'Nota extra de sustentabilidade', 10,
          'Avalie a explicação das práticas sustentáveis adotadas durante o desenvolvimento do projeto. Este bônus é registrado na coluna de sustentabilidade.', 'bonus')
      ])
    },
    {id: 'apresentacao1', label: 'Apresentação 1', index: 5, max: 100, stage: true,
      source: 'https://forms.gle/pFpi7madYb6EkK9r6', criteria: stageCriteria},
    {id: 'apresentacao2', label: 'Apresentação 2', index: 6, max: 100, stage: true,
      source: 'https://forms.gle/tD6pghhyCCiVcVbr8', criteria: stageCriteria},
    {
      id: 'stand', label: 'Stand', index: 2, max: 5, source: 'https://forms.gle/3BLh545zvkpefdmm9',
      criteria: [{
        id: 'participacao', label: 'Participação e apresentação no stand', max: 5, choices: [0, 5], kind: 'score',
        help: 'A equipe recebe 5 pontos pela participação e apresentação no stand.'
      }]
    }
  ];

  function getColumn(id) {
    return columns.filter(function (column) { return column.id === id; })[0];
  }

  function createDraft(id) {
    var column = getColumn(id);
    if (!column) return null;
    var draft = {version: 1, column: id, criteria: {}, justification: ''};
    column.criteria.forEach(function (c) {
      var isPenalty = c.kind === 'deduction' || c.kind === 'occurrences';
      draft.criteria[c.id] = {points: isPenalty ? 0 : null, justification: ''};
    });
    if (column.stage) draft.belowMinimum = false;
    return draft;
  }

  function evaluate(id, draft) {
    var column = getColumn(id);
    var result = {valid: false, errors: [], subtotal: 0, deduction: 0, total: 0, bonus: 0};
    if (!column || !draft || draft.version !== 1 || draft.column !== id ||
        !draft.criteria || typeof draft.criteria !== 'object' || Array.isArray(draft.criteria)) {
      result.errors.push('A ficha não corresponde à coluna selecionada.');
      return result;
    }
    if (typeof draft.justification !== 'string') result.errors.push('A justificativa geral deve ser um texto.');
    if (column.stage && typeof draft.belowMinimum !== 'boolean') result.errors.push('Confira a duração da apresentação.');

    column.criteria.forEach(function (c) {
      var entry = draft.criteria[c.id];
      var points = entry && entry.points;
      if (!entry || typeof entry.justification !== 'string') {
        result.errors.push('Confira a justificativa de “' + c.label + '”.');
      }
      if (!Number.isSafeInteger(points) || points < 0 || (c.max !== null && points > c.max) ||
          (c.choices && c.choices.indexOf(points) < 0)) {
        result.errors.push('Confira o valor de “' + c.label + '”.');
        return;
      }
      switch (c.kind) {
        case 'deduction': result.deduction += points; break;
        case 'occurrences': result.deduction += 3 * points; break;
        case 'bonus': result.bonus += points; break;
        default: result.subtotal += points;
      }
    });
    if (!Number.isSafeInteger(result.deduction)) result.errors.push('A dedução excede o limite numérico.');
    result.total = column.stage && draft.belowMinimum ? 0 : result.subtotal - result.deduction;
    result.valid = !result.errors.length;
    return result;
  }

  // Older cells may contain only a value or unrelated score data. Restore complete artistic sheets only.
  function restore(id, data) {
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch (err) { return null; }
    }
    if (!evaluate(id, data).valid) return null;
    var draft = createDraft(id);
    draft.justification = data.justification;
    if (getColumn(id).stage) draft.belowMinimum = data.belowMinimum;
    Object.keys(draft.criteria).forEach(function (key) {
      var entry = data.criteria[key];
      draft.criteria[key] = {points: entry.points, justification: entry.justification};
    });
    return draft;
  }

  var artistica = {columns: columns, createDraft: createDraft, evaluate: evaluate, restore: restore};
  if (typeof window !== 'undefined') window.Artistica = artistica;
  if (typeof module !== 'undefined' && module.exports) module.exports = artistica;
})();
