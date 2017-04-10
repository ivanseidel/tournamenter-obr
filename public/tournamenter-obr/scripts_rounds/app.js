moment.locale('pt-BR');

var app = angular.module('app', [
  'ngRoute',
  'ngAnimate',
  'ngResource',

  'ui.bootstrap',

  'app.api',
])

.controller('AppCtrl', function ($scope, $timeout) {
  $scope.loaded = false

  $timeout(function (){
    $scope.loaded = true
  }, 500)
})

.filter('minuteToTime', function () {
  return function (value, invalid) {
    if(!value)
      return invalid || 'Horário Inválido'

    // Converts an absolute minutes time into hh:mm
    var h = Math.floor(value / 60)
    var m = value % 60
    var t = (h < 10 ? '0'+h : h) + ':' + (m < 10 ? '0'+m : m)
    return t
  }
})

.controller('RoundsCtrl', function ($scope, Table) {
  $scope.tables = Table.all()
  $scope.selTable = 0
  
  $scope.config = {
    arenas: [],
    /*
      Map table do round.indexArena.dificuldade 
      Sendo que dificuldade é:
      [0: Não utilizado] [1: Fácil] [2: Médio] [3: Difícil]

      Ex: 
      {
        // Rodada 1
        1: {
          // Arena 1
          0: '1'
          // Arena 2
          1: '2'
          // Arena 3
          1: '2'
        } 
      }
     */
    uso: {
      '1': {
        // 0: 1,
        // 1: 1,
        // 2: 1,
      },
      '2': {
        // 0: 2,
        // 1: 2,
        // 2: 2,
      },
      '3': {
        // 0: 3,
        // 1: 2,
        // 2: 3,
      },
    },

    /*
      Lista de periodos de PAUSAS, no formato [minStart, minEnd]
     */
    periodos: [],

    /*
      Lista de periodos INICIAIS de cada rodada
     */
    inicios: [],

    duration: 10,
  }

  $scope.result = {}

  // Watches config for change and update results with generated timetable
  $scope.generateTimetable = _.throttle(function (){
    // Generate timetable on config change
    var timeStart = Date.now()
    $scope.result = generateTimetable($scope.config, $scope.tables[$scope.selTable])
    var timeEnd = Date.now()
    console.log('generateTimetable took', timeEnd - timeStart, 'ms')

    // Apply changes to scope if not in digest phase
    if(!$scope.$$phase)
      $scope.$apply();
  }, 400, {leading: false, trailing: true})

  // Trigger timetable generation on configs and selTable
  $scope.$watch('selTable', $scope.generateTimetable)
  $scope.$watchCollection('config', $scope.generateTimetable)


  // Listen to raw arenas names and generate arenas names in configs
  $scope.arenasRaw = '1, 2, 3'
  $scope.$watch('arenasRaw', function (value) {
    var arenas = value.split(',')

    // Filter empty ones
    arenas = arenas.filter(function (txt) {
      return txt
    })

    arenas = arenas.map(function (txt) {
      return 'Arena ' + txt.trim()
    })

    $scope.config.arenas = arenas
  })

  // Listen to raw inicios (Inicios de rodadas)
  $scope.iniciosRaw = ['09:00', '13:00', '16:00']
  $scope.$watchCollection('iniciosRaw', function (value) {
    $scope.config.inicios = value.map(parseTime)
  })

  // Listen to raw Periodos and generate periods inside configs
  $scope.periodosRaw = '12:00-13:00'
  $scope.periodosRawValid = false
  $scope.$watch('periodosRaw', function (value) {
    var periodos = value.split(',')

    // Filter empty ones
    periodos = periodos.filter(function (txt) {
      return txt
    })

    // Parse periods
    periodos = periodos.map(function (periodo) {
      return parsePeriod(periodo.trim())
    })

    // Validate all periods
    $scope.periodosRawValid = true
    periodos.forEach(function (periodo) {
      if (periodo === false)
        $scope.periodosRawValid = false;
    })

    // Save periodos
    $scope.config.periodos = periodos
  })


  // Parses a period in form of 'hh:mm-hh-mm'
  function parsePeriod (periodo) {
    // Check has something
    if (!periodo)
      return false;

    // Checks if has two parts
    var times = periodo.split('-')
    if (times.length != 2)
      return false;

    // Parse both times
    times[0] = parseTime(times[0])
    times[1] = parseTime(times[1])

    // Check both parts are times
    if (!_.isNumber(times[0]) || !_.isNumber(times[1]))
      return false

    // Check one is after the other
    if (times[0] >= times[1])
      return false

    return times
  }

  // Parses a given time string like `hh:mm` returning the integer minute from 00:00 or false
  function parseTime (str) {
    if (!str)
      return false

    // Matches regex
    var matched = /^(\d\d):(\d\d)$/.exec(str)

    // Check it has two parts
    if (!matched)
      return false;

    parts = [parseInt(matched[1]), parseInt(matched[2])]

    // Check that it's a number
    if (!_.isNumber(parts[0]) || !_.isNumber(parts[1]))
      return false

    // Parses back to relative minutes
    return parts[0] * 60 + parts[1]
  }
})