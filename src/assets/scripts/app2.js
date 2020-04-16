// moment.locale('pt-BR');

const app = angular
  .module('app', [
    'ngRoute',
    'ngAnimate',
    'ngResource',

    'ui.bootstrap',

    'app.api',
    'Desafio',
  ])

  .controller('AppCtrl', function ($scope, $timeout) {
    $scope.loaded = false;

    $timeout(function () {
      $scope.loaded = true;
    }, 500);
  });
