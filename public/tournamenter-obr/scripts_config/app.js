moment.locale('pt-BR');

var app = angular.module('app', [
  'ngRoute',
  'ngAnimate',
  'ngResource',

  'ui.bootstrap',

  'app.api',
  'app.importar',
  'app.exportar',
])

.controller('AppCtrl', function ($scope, $timeout) {
  $scope.loaded = false

  $timeout(function (){
    $scope.loaded = true
  }, 500)
})