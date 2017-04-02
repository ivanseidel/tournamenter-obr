// v1.01
var TOURNAMENTER_URL    = '';
var EXTERNAL_API_BASE   = 'http://www.sistemaolimpo.org/webservice/tournamenter';
var EXTERNAL_API_EVENTS = '/eventos.php';
var EXTERNAL_API_TEAMS  = '/equipes.php';

moment.locale('pt-BR');
console.log(moment.locale());

var app = angular.module('app', [
  'ngRoute',
  'ngAnimate',
  'ngResource',

  'ui.bootstrap',

  'app.importar',
  'app.exportar',
])

.controller('AppCtrl', function ($scope, $timeout) {
  $scope.loaded = false

  $timeout(function (){
    $scope.loaded = true
  }, 500)
})

.factory('ExternalEventAPI', ['$resource', function ($resource) {

  return $resource(EXTERNAL_API_BASE + EXTERNAL_API_EVENTS, {id: '@id'}, {
    all: {
      url: EXTERNAL_API_BASE + EXTERNAL_API_EVENTS,
      isArray: true,
    },
  });

}])

.factory('ExternalTeamAPI', ['$resource', function ($resource) {

  return $resource(EXTERNAL_API_BASE + EXTERNAL_API_TEAMS, {event: '@event'}, {
    all: {
      url: EXTERNAL_API_BASE + EXTERNAL_API_TEAMS,// + '/:event',
      isArray: true,
    },
  });

}])

.factory('Team', ['$resource', function ($resource) {

  return $resource(TOURNAMENTER_URL + '/teams', {id: '@id'}, {
    all: {
      url: TOURNAMENTER_URL + '/teams?limit=10000',
      isArray: true,
    },
    create: {
      url: TOURNAMENTER_URL + '/teams',
      method: 'POST'
    },
    update: {
      url: TOURNAMENTER_URL + '/teams/:id',
      method: 'PUT'
    },
    remove: {
      url: TOURNAMENTER_URL + '/teams/:id',
      method: 'DELETE'
    },
  });

}])

.factory('ObrConfig', ['$resource', function ($resource) {

  return $resource(TOURNAMENTER_URL + '/obr-sync', {}, {
    save: {
      url: TOURNAMENTER_URL + '/obr-sync',
    },
    lastSync: {
      url: TOURNAMENTER_URL + '/obr-last-sync',
    }
  });

}])