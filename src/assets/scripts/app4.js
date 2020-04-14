// v1.01
const TOURNAMENTER_URL = '';

(function () {
  const app = angular
    .module('app', [
      'ngRoute',
      'ngAnimate',
      'ngResource',

      'ui.bootstrap',

      'app.controllers',
      'app.scorers',
      // 'app.directives',
    ])

    .config([
      '$routeProvider',
      function ($routeProvider) {
        return $routeProvider

          .when('/score', {
            templateUrl: 'views/scorer.html',
          })
          .otherwise({
            redirectTo: '/score',
            // templateUrl: 'views/participar/'
          });
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
            saveScore: {
              url: TOURNAMENTER_URL + '/scores/:id/:number',
            },
            get: {
              url: TOURNAMENTER_URL + '/scores/:id',
            },
          }
        );
      },
    ])

    .constant('SW_DELAI', 100)
    .factory('stopwatch', function (SW_DELAI, $timeout) {
      let data = {
          value: 0,
          laps: [],
          state: 'STOPPED',
        },
        stopwatch = null;

      const start = function () {
        data.state = 'RUNNING';
        if (stopwatch) {
          $timeout.cancel(stopwatch);
        }
        stopwatch = $timeout(function () {
          data.value++;
          start();
        }, SW_DELAI);
      };

      const stop = function () {
        data.state = 'STOPPED';
        $timeout.cancel(stopwatch);
        stopwatch = null;
      };

      const reset = function () {
        stop();
        data.value = 0;
        data.laps = [];
      };

      const lap = function () {
        data.laps.push(data.value);
      };

      const increment = function (secs) {
        data.value += (secs * SW_DELAI) / 10;
      };

      return {
        data: data,
        start: start,
        stop: stop,
        reset: reset,
        lap: lap,
        increment: increment,
      };
    });
}.call(this));
