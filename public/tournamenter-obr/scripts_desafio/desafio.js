const DESAFIOS = [
  'Desafio A',
  'Desafio B',
  'Desafio C',
  'Desafio D',
  'Desafio E',
  'Desafio F',
  'Desafio G',
  'Desafio H',
  'Desafio I',
  'Desafio J',
  'Desafio K',
  'Desafio L',
]

angular.module('Desafio', [])

.controller('DesafioCtrl', function ($scope, Table, Score) {
  $scope.tables = Table.all()
  $scope.selectedTable = null
  $scope.selectedScore = null
  $scope.tableScores = null

  $scope.error = null
  $scope.search = ''

  $scope.selectTable = function selectTable(table) {
    $scope.error = ''
    $scope.selectedTable = table
    $scope.selectedScore = null
  }

  $scope.selectScore = function selectScore(score) {
    $scope.error = ''
    $scope.selectedScore = score
  }

  $scope.generateChallenge = function generateChallenge(score, challengeId) {
    $scope.error = ''
    var msg = 'Tem certeza de que deseja gerar o desafio ' + 
              challengeId + ' da equipe ' + (score.team.name || '') + '?'

    var ok = confirm(msg)

    if (!ok) {
      return
    }

    var possibleChallenges = _.without(DESAFIOS, score.desafio1)
    var challenge = _.sample(possibleChallenges)

    var newChallenges = {
      id: score.id,
    }

    newChallenges['desafio'+challengeId] = challenge

    Score.update(newChallenges, function (score){ 
      $scope.selectedScore.desafio1 = score.desafio1
      $scope.selectedScore.desafio2 = score.desafio2
    }, function () {
      $scope.error = 'Falha ao gerar scores'
    })

    console.log(challenge)
  }
})