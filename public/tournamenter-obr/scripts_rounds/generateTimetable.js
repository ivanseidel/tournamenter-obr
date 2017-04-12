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
  window.config = config
  window.table = table

  var result = {
    errors: [],
    tables: [],
    finalRodadas: {},
  }

  // Valida se tabela foi selecionada
  if (!table) {
    result.errors.push('Nenhuma tabela foi selecionada.')
    return result
  }

  // Valida se possui equipes
  if (!table.scores || table.scores.length <= 0) {
    result.errors.push('A tabela selecionada deve conter equipes')
    return result
  }

  // Valida se todos os níveis de dificuldade estão em pelo menos 1 dos rounds
  var faltando = nivelFaltando(config.uso)
  if (faltando) {
    result.errors.push(
      'O nível ' + ['', 'Fácil', 'Médio', 'Difícil'][faltando] + 
      ' não foi alocado para nenhuma rodada.' +
      ' Todos os níveis devem ser alocados em pelo menos uma rodada.'
    )
    return result
  }

  // Gera equipes e salve em tabela (cache)
  var k = 1
  var teams = table.teams = table.teams || _.map(table.scores, function (team) {
    return {
      id: team.team && team.team.id || '?',
      name: (team.team && team.team.name.replace(/^(1|2) - /gi, '') || '<Sem nome>'),
    }
  })

  // Clear niveis
  teams.forEach(function (team) {
    team.niveis = [null, null, null]
    team.startOfSearch = 0
    // Equipe que precede
    team.before = null
  })

  // Start basic allocation and distribution
  var allocations = {
    // Rodada 1
    1: {},
    // Rodada 2
    2: {},
    // Rodada 3
    3: {},
  }

  // Aloca primariamente por nivel de cada rodada
  for (var rodada = 1; rodada <= 3; rodada++) {
    var toAllocate = teams.slice()
    var arenaIndex = 0
    var arenas = config.arenas.length

    // Inicializa allocations 
    for (var arena = 0; arena < arenas; arena++) {
      allocations[rodada][arena] = []
    }

    /*
     * Transforma o map table da tabela de uso em 
     * um array de níveis das arenas desta rodada.
     * Remove nível `0`: "Arena vazia"
     * Subtrai 1 de todos, de modo que:
     * 'facil' = 0, 'medio' = 1, 'dificil' = 2
     */
    function subtract1(val) {return val - 1}
    var niveisDaRodada = 
      _.chain(config.uso[rodada])
       .values()
       .slice(0, arenas)
       .without(0)
       .map(subtract1)
       .value()

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
    var firstTeams = toAllocate.splice(0, niveisDaRodada.length)
    // console.log(_.pluck(firstTeams, 'name'))
    firstTeams = _.sortBy(firstTeams, function compare(team) {
      var niveis = missingNiveis(team.niveis, niveisDaRodada)
      // console.log(team.name, niveis)
      return niveis.length
    })
    // console.log(_.pluck(firstTeams, 'name'))

    // Coloca equipes de volta no array, desta vez organizadas
    toAllocate = firstTeams.concat(toAllocate)

    // Carrega uma equipe
    var team = null
    while (team = toAllocate.shift()) {
      // Dos níveis que a equipe ainda não participou, qual dos disponíveis pode participar?
      var niveisDisponiveis = missingNiveis(team.niveis, niveisDaRodada)
      
      if (niveisDisponiveis.length <= 0) {
        // Nenhum nivel disponível para competir. Não pode prosseguir...
        result.errors.push(
          '#1 Não foi possivel alocar equipe. O algoritmo não encontrou uma arena para a equipe ' +
          '"' + team.name + '" em nenhuma das arenas da Rodada ' + rodada+ '.')
        return result
      }

      // Encontra melhor nível para atribuir equipe
      // Euristica: Arena rodando nível com menos equipes
      var allocatedArena = null
      var allocatedArenaTeams = Infinity

      for (var k = 0; k < arenas; k++) {
        var arena = (k + team.startOfSearch) % arenas
        // var arena = sortedArenas[k] * 1
        var nivelDaArena = config.uso[rodada][arena]

        // Arena não deve ser utilizada. Pule...
        if (nivelDaArena == 0)
          continue;

        // Checa se o nível da arena está em niveisDisponiveis
        if (niveisDisponiveis.indexOf(nivelDaArena - 1) < 0)
          continue
        
        // Número de equipes alocadas na arena que estamos verificando
        var equipes = allocations[rodada][arena].length

        // Ultima equipe alocada para esta rodada na arena que estamos verificando
        var ultimaEquipe = _.last(allocations[rodada][arena]) || null
        
        // Verifica se a equipe anterior é a equipe de de fila indiana da equipe atual
        if (ultimaEquipe === team.before) {
          allocatedArena = arena
          break
        }

        // Uma das primeiras equipes sendo alocadas, escolhe a primeira arena
        if (ultimaEquipe === null && team.before === null){
          allocatedArena = arena
          break
        }

        // Verifica se é uma opção melhor (menos equipes)...
        if (equipes < allocatedArenaTeams) {
          // Salva opção
          allocatedArena = arena
          allocatedArenaTeams = equipes
        }
      }

      // Nenhuma arena pode ser alocada para a equipe. É erro nela!
      if (allocatedArena === null) {
        // Nenhum nivel disponível para competir. Não pode prosseguir...
        result.errors.push(
          '#2 Não foi possivel alocar equipe. O algoritmo não encontrou uma arena para a equipe ' +
          '"' + team.name + '" em nenhuma das arenas da Rodada ' + rodada+ '.')
        return result
      }

      // Atribui arena à equipe no nivel especificado
      var nivel = config.uso[rodada][allocatedArena] - 1
      team.startOfSearch = allocatedArena
      team.niveis[nivel] = allocatedArena
      team.before = _.last(allocations[rodada][allocatedArena]) || null
      allocations[rodada][allocatedArena].push(team)
    }
  }

  console.log(' ')
  console.log('======== Estatisticas ========')
  for(var rodada = 1; rodada <= 3; rodada++){
    console.log('======== Rodada', rodada, ' ========')
    for(var k = 0; k < arenas; k++) {
      var equipes = allocations[rodada][k] || []
      console.log('Arena:', k, 'Equipes:', equipes.length)
      
    }
  }

  
  // Nós temos neste momento a divisão das equipes por arena e rodada.
  // Basta Serializarmos as equipes e criar a tabela de cada Arena
  // E contabilizar o tempo total
  var horarios = generateTimeForAllocations(config, allocations)
  window.horarios = horarios

  // Salva horário de término de cada rodada
  for (var rodada = 1; rodada <= 3; rodada++){
    // Soma com uma duração, pois eles representam inicios
    result.finalRodadas[rodada] = _.last(horarios[rodada]) + config.duration
  }

  // Verifica conflitos de horários
  result.finalRodadasErrors = {}
  for (var rodada = 2; rodada <= 3; rodada++){
    if (result.finalRodadas[rodada-1] > _.first(horarios[rodada])){
      result.errors.push('Conflito de horários. O horário inicial da Rodada ' + 
        rodada + ' é anterior ao término da Rodada ' + (rodada - 1))
      result.finalRodadasErrors[rodada] = true
    }
  }

  // Gerar a tabela baseado em `allocations` e `horarios`
  var tables = []

  for (var rodada = 1; rodada <= 3; rodada++) {
    var allocation = allocations[rodada]
    var table = []

    // Cria Header (Primeira coluna para horário)
    table.push([''].concat(config.arenas))
    
    // Descobre quantidade de linhas
    var rows = horarios[rodada].length

    for (var row = 0; row < rows; row++) {
      var horario = minuteToTime(horarios[rodada][row])
      var line = [horario]

      // Cria linhas de conteudos (para cada coluna)
      for (var arena = 0; arena < config.arenas.length; arena++) {
        if (allocation[arena] && allocation[arena][row]) {
          line.push(allocation[arena][row].name)
        }else {
          line.push('-')
        }
      }
      table.push(line)
    }
    tables.push(table)
  }
  result.tables = tables

  window.result = result
  return result
}

/*
  Converte de minutos para horario no tipo "hh:mm"
 */
function minuteToTime(value) {
  var h = Math.floor(value / 60)
  var m = value % 60
  var t = (h < 10 ? '0'+h : h) + ':' + (m < 10 ? '0'+m : m)
  return t
}


/*
  Retorna a lista de níveis do qual uma equipe ainda precisa participar.
  Recebe um map list com os níveis feitos (valor != null == feito) "[null, 0, 1]" 
  E também uma lista de níveis que a rodada atual oferece (não mapeada)
 */
function missingNiveis(teamNiveis, niveisDaRodada) {
  var niveisFeitos = [
    _.isNumber(teamNiveis[0]) ? 0 : null,
    _.isNumber(teamNiveis[1]) ? 1 : null,
    _.isNumber(teamNiveis[2]) ? 2 : null,
  ]
  return _.difference(niveisDaRodada, niveisFeitos)
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
  var arenas = config.arenas.length
  var intervalos = config.periodos
  var tempoDeRound = config.duration

  var horarios = {
    1: [],
    2: [],
    3: [],
  }

  for (var rodada = 1; rodada <= 3; rodada++) {
    var allocation = allocations[rodada]
    var tempoInicial = config.inicios[rodada - 1] // Inicios começa em 0, e não em 1
    var tempoAtual = tempoInicial

    // Encontra o maior numero de rounds de qualquer arena
    var maxMatches = _.chain(allocations[rodada]).values().pluck('length').max().value()
    // console.log('MaxRounds: ', maxMatches)

    // Faz um rodizio para cada horário nas esquipes das arenas
    // ex: arena0.equipe0, arena1.equipe0, arena2.equipe0, ...
    //     arena0.equipe1, arena1.equipe1, arena2.equipe1, ...
    for (var match = 0; match < maxMatches; match++) {
      // Encontra próximo horário livre
      tempoAtual = nextAvailableTime(tempoAtual, intervalos)

      // Registra horário
      horarios[rodada].push(tempoAtual)
      
      // Incrementa próximo horário
      tempoAtual += tempoDeRound
    }
  }

  return horarios
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
  for (var k in intervalos) {
    var intervalo = intervalos[k]
    if (startTime >= intervalo[0] && startTime < intervalo[1]) {
      startTime = intervalo[1]
    }
  }
  return startTime
}


/*
  Dado uma tabela de uso {<rodada>: {<arena>: <0|1|2|3>, ...}, ...}
  Retorna se possui pelo menos 1 de cada dificuldade nelas
 */
function nivelFaltando(uso) {
  var niveis = 
    _.values(uso[1])
     .concat(_.values(uso[2]))
     .concat(_.values(uso[3]))

  for (var k = 1; k <= 3; k++) {
    if (niveis.indexOf(k) >= 0)
      continue;
    return k
  }

  return false
}