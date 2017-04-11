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
  $scope.selTable = null
  
  $scope.result = {}
  $scope.arenasRaw = '1, 2, 3'
  $scope.iniciosRaw = ['09:00', '13:00', '16:00']
  $scope.periodosRaw = '12:00-13:00'
  $scope.periodosRawValid = false
  
  // Used to hide tables when printing
  $scope.printTable = null

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
          // Arena 1, nível fácil (1)
          0: '1'
          // Arena 2, nível médio (2)
          1: '2'
          // Arena 3, nível médio (2)
          2: '2'
          // Arena 4, nível difícil (3)
          3: '3'
        } 
      }
     */
    uso: {
      '1': { 0: 1, 1: 2, 2: 3, 3: 1, 4: 2, 5: 3, },
      '2': { 0: 1, 1: 2, 2: 3, 3: 1, 4: 2, 5: 3, },
      '3': { 0: 1, 1: 2, 2: 3, 3: 1, 4: 2, 5: 3, },
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
  $scope.$watchCollection('iniciosRaw', function (value) {
    $scope.config.inicios = value.map(parseTime)
  })

  // Listen to raw Periodos and generate periods inside configs
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

  // Copy to markdown
  $scope.copyMarkdown = function (table, nivel, rodada) {
    var str = markdownTable(table)
    str = '# '+nivel + ': Rodada ' + rodada + '\n' + str
    window.prompt('Tecle `ctrl + c` para copiar a tabela abaixo. Depois, cole em uma "MessageView" para mostrar as equipes os horários.', str)
  }

  // Export CSV (Download)

  $scope.downloadCSV = function (table, nivel, rodada) {
    var BOM = "\uFEFF";
    var csvFile = BOM + exportToCsv(table)
    var filename = nivel + ': Rodada ' + rodada

    var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
  }

  // Calls the print method on browser
  $scope.print = function (table) {
    $scope.printTable = table

    // Give some time to scoppy be applied
    setTimeout(window.print, 100)

    // Reset print to all the pages (default)
    setTimeout(function (){
      $scope.printTable = null

      // Apply changes to scope if not in digest phase
      if(!$scope.$$phase)
        $scope.$apply();
    }, 2000)
  }


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

function exportToCsv(rows) {
    var processRow = function (row) {
        var finalVal = '';
        for (var j = 0; j < row.length; j++) {
            var innerValue = row[j] === null ? '' : row[j].toString();
            if (row[j] instanceof Date) {
                innerValue = row[j].toLocaleString();
            };
            var result = innerValue.replace(/"/g, '""');
            if (result.search(/("|,|\n)/g) >= 0)
                result = '"' + result + '"';
            if (j > 0)
                finalVal += ',';
            finalVal += result;
        }
        return finalVal + '\n';
    };

    var csvFile = '';
    for (var i = 0; i < rows.length; i++) {
        csvFile += processRow(rows[i]);
    }

    return csvFile
}