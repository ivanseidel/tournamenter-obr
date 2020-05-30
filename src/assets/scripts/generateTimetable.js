import { without } from './utils';

/*
  Given the configurations, and an array of Teams, generates a timetable object like:
  {
    errors: ['Error strings here', 'And here', ...],
    tabelas: [
      // Rodada 1
      [
        ['Horário', ', 'Arena X', 'Arena ...'],
        ['09:00',   'Equipe XXX', 'Equipe YY'],
        ['09:00',   'Equipe XXX', 'Equipe YY'],
      ]
    ],
    // Tempo Final das rodadas
    finalRodadas: [
      <minutes>,
      <minutes>,
      <minutes>,
    ]
  }
 */
function generateTimetable(config, table) {
  window.config = config;
  window.table = table;

  const result = {
    errors: [],
    tables: [],
    finalRodadas: {},
  };

  // Valida se tabela foi selecionada
  if (!table) {
    result.errors.push('Nenhuma tabela foi selecionada.');
    return result;
  }

  // Valida se possui equipes
  if (!table.scores || table.scores.length <= 0) {
    result.errors.push('A tabela selecionada deve conter equipes');
    return result;
  }

  // Valida se todos os níveis de dificuldade estão em pelo menos 1 dos rounds
  const faltando = nivelFaltando(config.uso);

  if (faltando) {
    result.errors.push(
      `O nível ${
        ['', 'Fácil', 'Médio', 'Difícil'][faltando]
      } não foi alocado para nenhuma rodada. Todos os níveis devem ser alocados em pelo menos uma rodada.`
    );
    return result;
  }

  // Gera equipes e salve em tabela (cache)
  const teams = (table.teams =
    table.teams ||
    table.scores.map(team => {
      const { id, name } = team.team;
      return {
        id: (team.team && id) || '?',
        name: (team.team && name.replace(/^(1|2) - /gi, '')) || '<Sem nome>',
      };
    }));

  // Clear niveis
  teams.forEach(team => {
    team.niveis = [null, null, null];
    team.startOfSearch = 0;
    // Equipe que precede
    team.before = null;
  });

  // Start basic allocation and distribution
  const allocations = {
    // Rodada 1
    1: {},
    // Rodada 2
    2: {},
    // Rodada 3
    3: {},
  };

  // Aloca primariamente por nivel de cada rodada
  const { arenas, uso } = config;
  const { length } = arenas;

  Array.from({ length: 2 }).map((v, rodada) => {
    rodada++;
    let toAllocate = teams.slice();

    // Inicializa allocations
    Array.from({ length }).map((v, arenaIndex) => {
      allocations[rodada][arenaIndex] = [];
    });

    /*
     * Transforma o map table da tabela de uso em
     * um array de níveis das arenas desta rodada.
     * Remove nível `0`: "Arena vazia"
     * Subtrai 1 de todos, de modo que:
     * 'facil' = 0, 'medio' = 1, 'dificil' = 2
     */

    const niveisDaRodada = without(uso[rodada].slice(0, length), 0).map(
      value => value--
    );

    // var niveisDaRodada =
    //   _.chain(uso[rodada])
    //    .values()
    //    .slice(0, length)
    //    .without(0)
    //    .map(value => value--)
    //    .value()

    /*
     * Para garantir que as colunas se movimentem integralmente, precisamos
     * garantir que nenhuma coluna irá utilizar uma arena em que uma outra
     * coluna precise prioritariamente. Ex:
     * - Temos arenas 1, 2, 3 e 4.
     *
     * - Temos os níveis [Rodada 1]:
     *                1, 2, 3 e 1
     *
     * - Temos os níveis [Rodada 2]:
     *                1, 2, 3 e 2
     *
     * - Temos grupos A, B, C e D (colunas)
     * = Rodada 1:    1:A   2:B   3:C   4:D
     * = Rodada 2:
     *    Passo 1:    1:?   2:A   3:?   4:?
     *    Passo 2:    1:?   2:A   3:B   4:?
     *    Passo 3:    1:?   2:A   3:B   4:C
     *    Passo 4:    1:!   2:A   3:B   4:C
     *    Haverá um problema em inserir o grupo, pois o grupo D já
     *    participou em uma arena fácil, e apenas sobrou ela.
     *
     * Para resolver, precisamos dar prioridade às primeiras equipes
     * (equipes cabeças do grupo) com "menos" opções.
     */
    const firstTeams = toAllocate
      .splice(0, niveisDaRodada.length)
      .concat()
      .sort(team => missingNiveis(team.niveis, niveisDaRodada).length);

    // console.log(_.pluck(firstTeams, 'name'))
    // firstTeams = _.sortBy(firstTeams, function compare(team) {
    // var niveis = missingNiveis(team.niveis, niveisDaRodada);
    // console.log(team.name, niveis)
    // return niveis.length;
    // })
    // console.log(_.pluck(firstTeams, 'name'))

    // Coloca equipes de volta no array, desta vez organizadas
    toAllocate = firstTeams.concat(toAllocate);

    // Carrega uma equipe
    const team = null;
    while (toAllocate.length > 0) {
      const team = toAllocate.shift();
      // Dos níveis que a equipe ainda não participou, qual dos disponíveis pode participar?
      const niveisDisponiveis = missingNiveis(team.niveis, niveisDaRodada);

      if (niveisDisponiveis.length <= 0) {
        // Nenhum nivel disponível para competir. Não pode prosseguir...
        result.errors.push(
          `#1 Não foi possivel alocar equipe. O algoritmo não encontrou uma arena para a equipe "${team.name}" em nenhuma das arenas da Rodada ${rodada}.`
        );
        return result;
      }

      // Encontra melhor nível para atribuir equipe
      // Euristica: Arena rodando nível com menos equipes
      let allocatedArena = null;
      let allocatedArenaTeams = Infinity;

      Array.from({ length }).map((v, k) => {
        const arena = (k + team.startOfSearch) % length;
        // var arena = sortedArenas[k] * 1
        const nivelDaArena = uso[rodada][arena];

        // Arena não deve ser utilizada. Pule...
        // if (nivelDaArena == 0) continue;

        // Checa se o nível da arena está em niveisDisponiveis
        // if (niveisDisponiveis.indexOf(nivelDaArena - 1) < 0) continue;

        // Número de equipes alocadas na arena que estamos verificando
        const equipes = allocations[rodada][arena].length;

        // Ultima equipe alocada para esta rodada na arena que estamos verificando
        const ultimaEquipe = allocations[rodada][arena].slice(-1) || null;

        if (
          (ultimaEquipe === null && team.before === null) || // Uma das primeiras equipes sendo alocadas, escolhe a primeira arena
          ultimaEquipe === team.before // Verifica se a equipe anterior é a equipe de de fila indiana da equipe atual
        ) {
          allocatedArena = arena;
        } else {
          // Verifica se é uma opção melhor (menos equipes)...
          if (equipes < allocatedArenaTeams) {
            // Salva opção
            allocatedArena = arena;
            allocatedArenaTeams = equipes;
          }
        }
      });

      // Nenhuma arena pode ser alocada para a equipe. É erro nela!
      if (allocatedArena === null) {
        // Nenhum nivel disponível para competir. Não pode prosseguir...
        result.errors.push(
          `#2 Não foi possivel alocar equipe. O algoritmo não encontrou uma arena para a equipe "${team.name}" em nenhuma das arenas da Rodada ${rodada}.`
        );
        return result;
      }

      // Atribui arena à equipe no nivel especificado
      const nivel = config.uso[rodada][allocatedArena] - 1;
      team.startOfSearch = allocatedArena;
      team.niveis[nivel] = allocatedArena;
      team.before = allocations[rodada][allocatedArena].slice(-1) || null;
      allocations[rodada][allocatedArena].push(team);
    }
  });

  console.log(' ');
  console.log('======== Estatisticas ========');

  Array.from({ length: 3 }).map((v, rodada) => {
    console.log(`======== Rodada ${rodada + 1} ========`);
    Array.from({ length }).map((v, k) => {
      console.log(`Arena: ${k} Equipes: ${allocations[rodada][k].length || 0}`);
    });
  });

  // Nós temos neste momento a divisão das equipes por arena e rodada.
  // Basta Serializarmos as equipes e criar a tabela de cada Arena
  // E contabilizar o tempo total
  const horarios = generateTimeForAllocations(config, allocations);
  window.horarios = horarios;

  // Salva horário de término de cada rodada
  result.finalRodadasErrors = {};
  Array.from({ length: 3 }).map((v, rodada) => {
    rodada++;
    result.finalRodadas[rodada] = horarios[rodada].slice(-1) + config.duration;

    // Verifica conflitos de horários
    if (rodada > 1) {
      if (result.finalRodadas[rodada - 1] > horarios[rodada][0]) {
        result.errors.push(
          `Conflito de horários. O horário inicial da Rodada ${rodada} é anterior ao término da Rodada ${
            rodada - 1
          }`
        );
        result.finalRodadasErrors[rodada] = true;
      }
    }
  });

  // Gerar a tabela baseado em `allocations` e `horarios`
  const tables = [];

  Array.from({ length: 3 }).map((v, rodada) => {
    rodada++;
    const allocation = allocations[rodada];
    const table = [];

    // Cria Header (Primeira coluna para horário)
    table.push([''].concat(config.arenas));

    // Descobre quantidade de linhas
    const rows = horarios[rodada].length;

    Array.from({ length: rows }).map((v, row) => {
      const horario = minuteToTime(horarios[rodada][row]);
      const line = [horario];

      // Cria linhas de conteudos (para cada coluna)
      Array.from({ length: length }).map((v, arena) => {
        line.push(
          allocation[arena] && allocation[arena][row]
            ? allocation[arena][row].name
            : '-'
        );
      });

      table.push(line);
    });

    tables.push(table);
  });

  result.tables = tables;
  window.result = result;
  return result;
}

/*
 * Converte de minutos para horario no tipo "hh:mm"
 */
const minuteToTime = value =>
  `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(
    value % 60
  ).padStart(2, '0')}`;

/*
  Retorna a lista de níveis do qual uma equipe ainda precisa participar.
  Recebe um map list com os níveis feitos (valor != null == feito) "[null, 0, 1]" 
  E também uma lista de níveis que a rodada atual oferece (não mapeada)
 */
function missingNiveis(teamNiveis, niveisDaRodada) {
  const niveisFeitos = [];

  Array.from({ length: 3 }).map((v, k) => {
    niveisFeitos.push(typeof teamNiveis[k] === 'number' ? k : null);
  });

  return niveisDaRodada.filter(nivel => !niveisFeitos.includes(nivel));
}

/*
  Dada uma lista de allocations:
  {
    1: {
      // Arena
      0: [Equipe, Equipe, Equipe, Equipe],
      1: [Equipe, Equipe, ...],
    },
    2: {...},
    3: {...},
  }

  Retorna uma tabela como allocations, porem apenas com um array
  contendo todos os horários (Pega a arena com mais matches)
  {
    1: [<minutes>, <minutes>, <minutes>, <minutes>],
    2: [...],
    3: [...],
  }
 */
function generateTimeForAllocations(config, allocations) {
  const intervalos = config.periodos;
  const tempoDeRound = config.duration;

  const horarios = {
    1: [],
    2: [],
    3: [],
  };

  Array.from({ length: 3 }).map((v, rodada) => {
    rodada++;
    const tempoInicial = config.inicios[rodada - 1]; // Inicios começa em 0, e não em 1
    let tempoAtual = tempoInicial;

    // Encontra o maior numero de rounds de qualquer arena
    const maxMatches = allocations[rodada]
      .map(x => x.length)
      .sort((a, b) => b - a)[0];
    // var maxMatches = _.chain(allocations[rodada]).values().pluck('length').max().value();
    // console.log('MaxRounds: ', maxMatches)

    // Faz um rodizio para cada horário nas esquipes das arenas
    // ex: arena0.equipe0, arena1.equipe0, arena2.equipe0, ...
    //     arena0.equipe1, arena1.equipe1, arena2.equipe1, ...
    Array.from({ length: maxMatches }).map((v, match) => {
      // Encontra próximo horário livre
      tempoAtual = nextAvailableTime(tempoAtual, intervalos);
      // Registra horário
      horarios[rodada].push(tempoAtual);
      // Incrementa próximo horário
      tempoAtual += tempoDeRound;
    });
  });

  return horarios;
}

/*
  Dado um tempo inicial, retorna o proximo horário fora de um intervalo.
  Ex:
    Se passar 0, e existir um intervalo de 0-60, irá retornar 60
    como próximo horario disponível.
  
  Não considera o tempo final, por razões de 
  "VOCÊ DEVE PENSAR NISSO ANTES DE INPUTAR OS VALORES", porque sim.
 */
function nextAvailableTime(startTime, intervalos) {
  // Checa se está dentro de algum intervalo
  intervalos.forEach(intervalo => {
    if (startTime >= intervalo[0] && startTime < intervalo[1]) {
      startTime = intervalo[1];
    }
  });
  return startTime;
}

/*
  Dado uma tabela de uso {<rodada>: {<arena>: <0|1|2|3>, ...}, ...}
  Retorna se possui pelo menos 1 de cada dificuldade nelas
 */
function nivelFaltando(uso) {
  const niveis = [].concat(
    Object.values(uso[1]),
    Object.values(uso[2]),
    Object.values(uso[3])
  );

  Array.from({ length: 3 }).map((v, k) => {
    k++;
    // if (niveis.indexOf(k) >= 0) continue;
    return k;
  });

  return false;
}
