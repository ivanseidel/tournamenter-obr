const TOURNAMENTER_URL = '';
const EXTERNAL_API_BASE =
  'http://www.sistemaolimpo.org/webservice/tournamenter';
const EXTERNAL_API_EVENTS = '/eventos.php';
const EXTERNAL_API_TEAMS = '/equipes.php';

const app = angular
  .module('app.api', [])

  .factory('ExternalEventAPI', [
    '$resource',
    function ($resource) {
      return $resource(
        EXTERNAL_API_BASE + EXTERNAL_API_EVENTS,
        { id: '@id' },
        {
          all: {
            url: EXTERNAL_API_BASE + EXTERNAL_API_EVENTS,
            isArray: true,
          },
        }
      );
    },
  ])

  .factory('ExternalTeamAPI', [
    '$resource',
    function ($resource) {
      return $resource(
        EXTERNAL_API_BASE + EXTERNAL_API_TEAMS,
        { event: '@event' },
        {
          all: {
            url: EXTERNAL_API_BASE + EXTERNAL_API_TEAMS, // + '/:event',
            isArray: true,
          },
        }
      );
    },
  ])

  .factory('Table', [
    '$resource',
    function ($resource) {
      return $resource(
        TOURNAMENTER_URL + '/tables/:id',
        { id: '@id' },
        {
          all: {
            url: TOURNAMENTER_URL + '/tables',
            isArray: true,
          },
        }
      );
    },
  ])

  .factory('Score', [
    '$resource',
    function ($resource) {
      return $resource(
        TOURNAMENTER_URL + '/scores/:id',
        { id: '@id', number: '@number' },
        {
          update: {
            url: TOURNAMENTER_URL + '/scores/:id',
            method: 'PUT',
            hasBody: true,
          },
          get: {
            url: TOURNAMENTER_URL + '/scores/:id',
          },
        }
      );
    },
  ])

  .factory('Team', [
    '$resource',
    function ($resource) {
      return $resource(
        TOURNAMENTER_URL + '/teams',
        { id: '@id' },
        {
          all: {
            url: TOURNAMENTER_URL + '/teams?limit=10000',
            isArray: true,
          },
          create: {
            url: TOURNAMENTER_URL + '/teams',
            method: 'POST',
          },
          update: {
            url: TOURNAMENTER_URL + '/teams/:id',
            method: 'PUT',
          },
          remove: {
            url: TOURNAMENTER_URL + '/teams/:id',
            method: 'DELETE',
          },
        }
      );
    },
  ])

  .factory('ObrConfig', [
    '$resource',
    function ($resource) {
      return $resource(
        TOURNAMENTER_URL + '/obr-sync',
        {},
        {
          save: {
            url: TOURNAMENTER_URL + '/obr-sync',
          },
          lastSync: {
            url: TOURNAMENTER_URL + '/obr-last-sync',
          },
        }
      );
    },
  ]);
