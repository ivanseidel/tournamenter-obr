angular.module('app.importar', [])

.controller('ImportarCtrl', function($scope, Team, ExternalEventAPI, ExternalTeamAPI) {
  $scope.error = ''
  $scope.success = ''
  $scope.teams = Team.all()
  $scope.events = ExternalEventAPI.all()
  $scope.importEventToken = null
  $scope.teamsToImport = null

  $scope.$watch('importEventToken', function () {
    if (!$scope.importEventToken) {
      return
    }

    $scope.teamsToImport = ExternalTeamAPI.all({token: $scope.importEventToken})
    $scope.teamsToImport.$promise.then(teams => console.log(teams))
  })

  $scope.actions = null
  $scope.progress = 0
  $scope.canCommit = false

  $scope.diffTeams = function () {
    $scope.error = ''
    $scope.success = ''
    $scope.actions = null

    $scope.teams = Team.all(function (){
      // Generate commits
      const lastDigitMatch = $scope.teamsToImport && $scope.teamsToImport.name && $scope.teamsToImport.name.join(' ').split('').reverse().join('').match(/(\d)/);
      const lastDigit = lastDigitMatch ? lastDigitMatch[1] : "?";
      $scope.actions = getCommits($scope.teams, $scope.teamsToImport.teams,  lastDigit, $scope.importEventToken, $scope.teamsToImport.id)
      $scope.actionsStats = _.countBy($scope.actions, 'action')

      // Show message
      if ($scope.actions.length === 0) {
        $scope.success = 'Nenhuma diferença encontrada. Equipes já estão sincronizados'
      } else {
        $scope.success = 'Diferenças encontradas. Verifique e execute as mudanças (passo 2)'
        $scope.canCommit = true
      }

    }, function (err) {
      $scope.error = err
    })
  }

  $scope.executing = false

  $scope.executeCommits = function (){
    if ($scope.executing)
      return

    $scope.error = ''
    $scope.success = ''
    $scope.progress = 0
    $scope.executing = true
    $scope.canCommit = false

    async.forEachSeries($scope.actions, applyCommit, function (err) {
      $scope.progress = 0
      $scope.executing = false
      if (err) {
        $scope.error = 'Falha ao executar commit: ' + err
      }

      $scope.success = 'Importação finalizada com sucesso!'

      updateCommits()
    })
  }

  function getCommits(teams, newTeams, level, token, stepId) {
    var actions = []

    newTeams.forEach(function (newTeam){
      var team = teams.find(function (t) {return newTeam.id == t.olimpoId})

      const teamObj = {...newTeam, id: undefined, olimpoId: newTeam.id, stepId, token: token, name: `${level} - ${newTeam.name}` , country: `${newTeam.city} - ${newTeam.state}`}
      if (!team) {
        // Create
        return actions.push({action: 'create', msg: newTeam.name, team: teamObj })
      }

      if (isDifferent(newTeam, team)) {
        // Update
        var msg = team.name + ' -> ' + `${level} - ${newTeam.name}`
        return actions.push({action: 'update', msg: msg, team: teamObj})
      }
    })

    return actions
  }

  function applyCommit(commit, next) {
    if (commit.action == 'create') {
      Team.create(commit.team, onFinish, onError)
    } else if (commit.action == 'update') {
      Team.update(commit.team, onFinish, onError)
    } else if (commit.action == 'remove') {
      Team.remove(commit.team, onFinish, onError)
    }

    function onFinish(){
      commit.status = 'success'
      updateCommits()
      setTimeout(function (){
        next()
      }, 50);
    }

    function onError(){
      commit.status = 'error'
      updateCommits()
      next('Falha ao executar commit: ' + 
        commit.action + ' {id: ' + commit.team.id + ', name: ' + commit.team.name + '}')
    }
  }

  function isDifferent(a, b) {
    for (var k in a) {
      if (!_.isString(a[k]) || !_.isNumber(a[k]))
        continue;
      
      if (a[k] != b[k]) {
        console.log(a[k], b[k], 'differ')
        return true
      }
    }
    return false
  }

  function updateCommits() {
    // Update progress
    var total = $scope.actions.length
    var progress = _.countBy($scope.actions, 'status')['success'] || 0
    $scope.progress = Math.round(progress / total * 100)

    // Apply changes to scope if not in digest phase
    if(!$scope.$$phase)
      $scope.$apply();
  }
})
