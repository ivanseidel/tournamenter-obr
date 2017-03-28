angular.module('app.importar', [])

.controller('ImportarCtrl', function($scope, Team, ExternalEventAPI, ExternalTeamAPI) {
  $scope.error = ''
  $scope.success = ''
  $scope.teams = Team.all()
  $scope.events = ExternalEventAPI.all()
  $scope.importEvent = null
  $scope.teamsToImport = null

  $scope.$watch('importEvent', function () {
    if (!$scope.importEvent) {
      return
    }

    $scope.teamsToImport = ExternalTeamAPI.all({event: $scope.importEvent})
  })

  $scope.actions = null
  $scope.progress = 0
  $scope.executing = false

  $scope.diffTeams = function () {
    $scope.error = ''
    $scope.success = ''
    $scope.actions = null
    $scope.progress = 0

    $scope.teams = Team.all({event: $scope.importEvent}, function (){
      // Generate commits
      $scope.actions = getCommits($scope.teams, $scope.teamsToImport, $scope.allowDelete)

      // Show message
      if ($scope.actions.length === 0) {
        $scope.success = 'Nenhuma diferença encontrada. Equipes já estão sincronizados'
      } else {
        $scope.success = 'Diferenças encontradas. Verifique e execute as mudanças (passo 2)'
      }

    }, function (err) {
      $scope.error = err
    })
  }


  function getCommits(teams, newTeams, allowDelete) {
    var actions = []

    newTeams.forEach(function (newTeam){
      var team = teams.find(function (t) {return newTeam.id == t.id})

      if (!team) {
        // Create
        return actions.push({action: 'create', msg: newTeam.name, team: team})
      }

      if (team.name != newTeam.name) {
        // Update
        var msg = team.name + ' -> ' + newTeam.name
        return actions.push({action: 'create', msg: msg, team: team})
      }
    })

    // Deletion? 
    if (allowDelete) {
      teams.forEach(function (oldTeam) {
        var team = teams.find(function (t) {return oldTeam.id == t.id})

        if (!team) {
          // Remove
          return actions.push({action: 'remove', msg: team.msg, team: team})
        }

      })
    }

    return actions
  }
})
