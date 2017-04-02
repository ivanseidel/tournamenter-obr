moment.locale('pt-BR');
const TOURNAMENTER_URL = ''

var app = angular.module('app', [
  'ngRoute',
  'ngAnimate',
  'ngResource',

  'ui.bootstrap',

  'Desafio',
])

.controller('AppCtrl', function ($scope, $timeout) {
  $scope.loaded = false

  $timeout(function (){
    $scope.loaded = true
  }, 500)
})

.factory('Table', ['$resource', function ($resource) {

  return $resource(TOURNAMENTER_URL + '/tables/:id', {id: '@id'}, {
    all: {
      url: TOURNAMENTER_URL + '/tables',
      isArray: true,
    },
  });

}])

.factory('Score', ['$resource', function ($resource) {

  return $resource(TOURNAMENTER_URL + '/scores/:id', {id: '@id', number: '@number'}, {
    update: {
      url: TOURNAMENTER_URL + '/scores/:id',
      method: 'PUT',
      hasBody: true,
    },
    get: {
      url: TOURNAMENTER_URL + '/scores/:id',
    }
  });

}])