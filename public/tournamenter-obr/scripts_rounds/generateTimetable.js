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
  var teams = table.teams = table.teams || _.map(table.scores, function (team) {
    return {
      id: team.team && team.team.id || '?',
      name: team.team && team.team.name.replace(/^(1|2) - /gi, '') || '<Sem nome>',
    }
  })

  // Clear niveis
  teams.forEach(function (team) {
    team.niveis = [null, null, null]
  })

  // Pares de uso dos rounds (niveis) Cacheado
  var rodadasNiveis = {
    1: _.pairs(config.uso[1]),
    3: _.pairs(config.uso[2]),
    3: _.pairs(config.uso[3]),
  }

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
    var arenas = config.arenas.slice()

    // Carrega uma equipe
    var team = null
    while (team = toAllocate.shift()) {
      var allocatedArena = null

      // Tenta Distribuir entre arenas
      for (var relativeArena = 0; relativeArena < arenas.length; relativeArena++) {
        // Look forward 
        var localArenaIndex = (arenaIndex + relativeArena) % arenas.length
        var nivel = config.uso[rodada][localArenaIndex]
        // console.log('Rodada', rodada, 'Arena', localArenaIndex, 'Nivel', nivel, ' | ', team.name)

        // Tenta alocar na melhor arena deste nivel da rodada(com menos equipes)
        var bestArenaIndex = localArenaIndex
        var bestMinEquipes = _.size(allocations[rodada][localArenaIndex])
        for (var arena in config.uso[rodada]) {
          // É a mesma arena, pula...
          if (arena == bestArenaIndex)
            continue;
          var checkNivel = config.uso[rodada][arena]
          
          // Nivel diferente, pula...
          if (checkNivel != nivel)
            continue

          // Não possui menos equipes, pula...
          var checkEquipes = _.size(allocations[rodada][arena])
          // console.log('Check best', arena, checkNivel, checkEquipes, ' <= ', bestMinEquipes)
          if (bestMinEquipes <= checkEquipes)
            continue

          bestArenaIndex = arena
          bestMinEquipes = checkEquipes
        }


        // Pula se arena não puder ser usada
        if (!nivel)
          continue;

        // Checa se a equipe ainda não participou de uma rodada com este nivel
        if (team.niveis[nivel - 1] !== null)
          continue;

        // Aloca 
        allocatedArena = bestArenaIndex
        team.niveis[nivel - 1] = bestArenaIndex
        
        // Init array if none
        allocations[rodada][bestArenaIndex] = allocations[rodada][bestArenaIndex] || []
        allocations[rodada][bestArenaIndex].push(team)
        
        break;
      }

      if (allocatedArena === null) {
        result.errors.push(
          'Não foi possivel alocar equipes. O algoritmo não encontrou uma arena para a equipe ' +
          '"' + team.name + '" para a Rodada ' + rodada+ ' em nenhuma das arenas.'
        )
        console.log(team)
        return result
      }

      arenaIndex = (arenaIndex + 1) % arenas.length
    }
  }

  console.log(' ')
  console.log(' ')
  console.log(' ')
  console.log(' ')
  console.log(' ')
  console.log(' ')
  for(var rodada = 1; rodada <= 3; rodada++){
    console.log('======== Rodada', rodada, ' ========')
    for(var k = 0; k < arenas.length; k++) {
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
    result.finalRodadas[rodada] = _.last(horarios[rodada])
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