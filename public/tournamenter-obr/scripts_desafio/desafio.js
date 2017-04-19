var INITIALIZER = [
  'VTJVZ1VHeDFkTU9qYnlCaGFXNWtZU0JtYjNJZ2NHeGhibVYwWVNCdklISnZZc08wSUhaaGFTQnphVzVoYkdsNllYSWdZVzhnYVc1cFkybGhjaUJoSUhKdlpHRmtZUT09',
  'VTJWMUlISnZZc08wSUdSbGRtVWdjMmx1WVd4cGVtRnlJSEJ2Y2lBeE1DQnpaV2QxYm1SdmN5QjBiMlJoSUhabGVpQnhkV1VnZFcwZ2IySnpkTU9oWTNWc2J5Qm1iM0lnWkdWMFpXTjBZV1J2SUdSMWNtRnVkR1VnWVNCeWIyUmhaR0U3',
  'VTJWMUlISnZZc08wSUdSbGRtVWdjMmx1WVd4cGVtRnlJSE52YldWdWRHVWdZU0J3Y21sdFpXbHlZU0IyWlhvZ2NYVmxJR0VnYldGeVkySERwOE9qYnlCMlpYSmtaU0JrWlNCbGJtTnlkWHBwYkdoaFpHRWdabTl5SUdWdVkyOXVkSEpoWkdFZ1pIVnlZVzUwWlNCaElISnZaR0ZrWVM0Z1UyVWdieUJ5YjJMRHRDQnphVzVoYkdsNllYSWdibUVnYzJWbmRXNWtZU0JsYm1OeWRYcHBiR2hoWkdFc0lHOGdaR1Z6WVdacGJ5QnV3Nk52SU1PcElIYkRvV3hwWkc4PQ==',
  'VHlCeWIyTER0Q0JrWlhabElITnBibUZzYVhwaGNpQmhieUJ3WlhKa1pYSWdZU0JzYVc1b1lTQmtkWEpoYm5SbElHRWdjbTlrWVdSaElIQnZjaUJ0WVdseklHUmxJREl3SUhObFozVnVaRzl6',
]

var Tokens={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Tokens._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Tokens._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}

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
              challengeId + ' da equipe ' + (score.team && score.team.name || '') + '?'

    var ok = confirm(msg)

    if (!ok) {
      return
    }

    var possibleChallenges = _.without(DES, score.desafio1)
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

  function initUI(){
    var z = 'ial', d = 'izer', a = 'init', cas = 'AF', main = 'IOS', upper = 'DES'
    // window[(a + z + d).toUpperCase()]['map'](function (e){console.log(Tokens.encode(Tokens.encode(e)))})
    window[upper] = window[(a + z + d).toUpperCase()]['map'](function (e){return Tokens.decode(Tokens.decode(e))})
  }; initUI()
})