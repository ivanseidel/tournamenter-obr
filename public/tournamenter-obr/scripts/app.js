// v1.01
var TOURNAMENTER_URL = '';

(function() {

	_.mixin({ deepClone: function (p_object) { return JSON.parse(JSON.stringify(p_object)); } });

	var app = angular.module('app', [
		'ngRoute',
		'ngAnimate',
		'ngResource',

		'ui.bootstrap',

		'app.controllers',
		// 'app.directives',

	])

	.config(['$routeProvider', function($routeProvider) {

		return $routeProvider

		.when('/score', {
			templateUrl: 'views/scorer.html'
		})
		.otherwise({
			redirectTo: '/score'
			// templateUrl: 'views/participar/'
		});

	}])

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
			saveScore: {
				url: TOURNAMENTER_URL + '/scores/:id/:number',
			},
			get: {
				url: TOURNAMENTER_URL + '/scores/:id',
			}
		});

	}])

	.factory('RescueAScorer', function (){

		var model = {
			rooms: {
				'first': 0,
				'secc': 0,
				'last': 0,
			},
			corridors: {
				'ramp': 0,
				'hallway': 0,
			},
			gaps: {

			},
			obstacles: {

			},
			speedbump: {

			},
			intersection: {

			},
			victim: {
				raise: 0,
				touch: 0,
			}
		};

		var scorings ={
			rooms: [0, 60, 40, 20, 0],
			corridors: [0,30,20,10,0],
			gaps: [0,10],

			obstacles: [0,10],
			speedbump: [0, 5],
			intersection: [0,10],

			victim: [0, 20],
		}

		return {
			view: 'views/rescue_scorer_2014.html?r='+Math.random(),
			model: model,
			scorings: scorings,
			score: function (model){
				var scored = {
					total: 0,
				};

				for(var k in model){
					scored[k] = {};
					var group = model[k];

					for(var i in group){
						var mission = group[i];
						if(mission === false) mission = 0;
						if(mission === true) mission = 1;

						var points = scorings[k][mission];

						scored[k][i] = points
						scored.total += points || 0;
					}
				}

				return scored;
			}
		}

	})

	.factory('RescueScorer2015Regional', function (){

		var model = {
			rooms: {
				'first': 0,
				'secc': 0,
			},
			corridors: {
				'ramp': 0,
			},
			gaps: {

			},
			obstacles: {

			},
			speedbump: {

			},
			intersection: {

			},
			passage: {

			},

			victims: {
				'1a': 0,
				'2a': 0,
				'3a': 0,
			},
		};

		var scorings ={
			rooms: [0, 60, 40, 20, 0],
			corridors: [0,30,20,10,0],
			gaps: [0,10],

			obstacles: [0,10],
			speedbump: [0, 5],
			intersection: [0,10],
			passage: [0, 10],

			victims: [0, 60, 40, 20, 0],
		}

		return {
			view: 'views/rescue_scorer_2016_regional.html?r='+Math.random(),
			model: model,
			scorings: scorings,
			score: function (model){
				var scored = {
					total: 0,
				};

				for(var k in model){
					scored[k] = {};
					var group = model[k];

					for(var i in group){
						var mission = group[i];
						if(mission === false) mission = 0;
						if(mission === true) mission = 1;

						var points = scorings[k][mission];

						scored[k][i] = points
						scored.total += points || 0;
					}
				}

				return scored;
			}
		}

	})

	.factory('FLLWorldClassScorer', function (){

		/*
			// m-door
		TotalScore += (data['m-door'] == 1 ? 0 : 15);
		door: [0,15],
		cloud: [0,30],
		collective: [0,25],
		insert: [0,25]
		insertLoop: special, if insert, then [0,30]
		sense: [0,40],
		outbox: [0,25,40],
		remote: [0,40],
		search: [0,15],
		searchLoops: special, if search, then [0,45]
		sports: [0,30,60],
		reverseBasker: [0,30],
		reverseReplicate: special, if reverseBasker, [0,15]
		adapt: [0,15],
		learnBound: [0,20],
		learnTouch: special, if learnBound, [0,15],
		projects: [0,20,30,40,50,60,70,80,90],
		penalties: [0,-10,-20,-30,-40,-50,-60,-70,-80],
		engage: [0,20],
		gyros: special, if engage, then crazy calculus



		// m-cloud
		TotalScore += (data['m-cloud'] == 1 ? 0 : 30);

		// m-collective
		TotalScore += (data['m-collective'] == 1 ? 0 : 25);

		// m-insert
		// m-insert-loop
		var mInsert = (data['m-insert'] == 1 ? 0 : 25);
		if(mInsert)
			mInsert += (data['m-insert-loop'] == 1 ? 0 : 30);
		TotalScore += mInsert;

		// m-sense
		TotalScore += (data['m-sense'] == 1 ? 0 : 40);

		// m-outbox
		TotalScore += [40, 25, 0][data['m-outbox']];

		// m-remote
		TotalScore += (data['m-remote'] == 1 ? 0 : 40);

		// m-search
		// m-search-loops
		var mSearch = (data['m-search'] == 1 ? 0 : 15);
		var didSearch = false;
		if(mSearch){
			didSearch = data['m-search-loops'] == 1 ? false : true;
			mSearch += (didSearch ? 45 : 0);
		}
		TotalScore += mSearch;

		// m-sports
		TotalScore += [60, 30, 0][data['m-sports']];

		// m-reverse-basket
		// m-reverse-replicate
		var mReverse = (data['m-reverse-basket'] == 1 ? 0 : 30);
		if(mReverse)
			mReverse += (data['m-reverse-replicate'] == 1 ? 0 : 15);
		TotalScore += mReverse;

		// m-adapt
		TotalScore += (data['m-adapt'] == 1 ? 0 : 15);

		// m-learn-bound
		// m-learn-touch
		var mLearn = (data['m-learn-bound'] == 1 ? 0 : 20);
		if(mLearn)
			mLearn += (data['m-learn-touch'] == 1 ? 0 : 15);
		TotalScore += mLearn;

		// m-projects
		TotalScore += [0,20,30,40,50,60,70,80,90][8 - data['m-projects']];

		// m-penalties
		TotalScore += (8 - data['m-penalties']) * -10;

		// m-engage
		// m-gyros
		var engagement = (data['m-engage'] == 1 ? 0 : 20);
		if(engagement){
			var percentage = (data['m-gyros'] > 0 ? data['m-gyros']*1 + 9 : 0) / 100.0;
			percentage = Math.min(percentage, 0.58);
			engagement += TotalScore * percentage;
		}
		TotalScore += engagement;

		// Limit to zero the minimum score
		TotalScore = Math.max(0, Math.round(TotalScore));

		// Filtra missao da busca e Laços
		if(didSearch && (8 - data['m-projects']) > 6)
			return null;

		return TotalScore;
		*/

		var model = {
			door:0,
			cloud:0,
			collective:0,
			insert:0,
			insertLoop:0,
			sense:0,
			outbox:0,
			remote:0,
			search:0,
			searchLoops:0,
			sports:0,
			reverseBasker:0,
			reverseReplicate:0,
			adapt:0,
			learnBound:0,
			learnTouch:0,
			projects:0,
			engage:0,
			gyros: 0,
			penalties:0,
		};

		var scorings ={
			door: [0,15],
			cloud: [0,30],
			collective: [0,25],
			insert: [0,25],
			// insertLoop: special, if insert, then [0,30]
			sense: [0,40],
			outbox: [0,25,40],
			remote: [0,40],
			search: [0,15],
			// searchLoops: special, if search, then [0,45]
			sports: [0,30,60],
			reverseBasker: [0,30],
			// reverseReplicate: special, if reverseBasker, [0,15]
			adapt: [0,15],
			learnBound: [0,20],
			// learnTouch: special, if learnBound, [0,15],
			projects: [0,20,30,40,50,60,70,80,90],
			penalties: [0,-10,-20,-30,-40,-50,-60,-70,-80],
			// engage: [0,20],
			// gyros: special, if engage, then crazy calculus
		}

		return {
			view: 'views/fll_scorer_world_class.html',
			model: model,
			scorings: scorings,
			score: function (model){
				var scored = {
					total: 0,
				};
				// Usual scoring, based on a table data
				for(var mission in model){
					// console.log(mission);
					if(!scorings[mission]) continue;
					var score = model[mission];
					if(score === false) score = 0;
					if(score === true) score = 1;

					var points = scorings[mission][score];
					scored[mission] = points
					scored.total += points || 0;
				}

				// Special cases
				scored.insertLoop = [0,30][model.insertLoop * model.insert];
				scored.total += scored.insertLoop;

				scored.searchLoops = [0,45][model.searchLoops * model.search];
				scored.total += scored.searchLoops;

				scored.reverseReplicate = [0,15][model.reverseReplicate * model.reverseBasker];
				scored.total += scored.reverseReplicate;

				scored.learnTouch = [0,15][model.learnTouch * model.learnBound];
				scored.total += scored.learnTouch;

				scored.engage = [0,20][model.engage];
				scored.gyros = 0;
				if(model.engage){
					var percentage = (model.gyros ? model.gyros*1 + 9 : 0) / 100.0;
					percentage = Math.min(percentage, 0.58);
					scored.gyros = scored.total * percentage;
				}
				scored.total += scored.engage
				scored.total += scored.gyros;

				// Limit to zero the minimum score
				scored.total = Math.max(0, Math.round(scored.total));

				// Invalidate score
				if(scored.searchLoops && model.projects > 6)
					scored.total = null;

				return scored;
			}
		}

	})

	.constant('SW_DELAI', 100)
	.factory('stopwatch', function (SW_DELAI, $timeout) {
	    var data = {
	            value: 0,
	            laps: [],
	            state: 'STOPPED',
	        },
	        stopwatch = null;

	    var start = function () {;
	    	data.state = 'RUNNING';
	    	if(stopwatch) $timeout.cancel(stopwatch);
	        stopwatch = $timeout(function() {
	            data.value++;
	            start();
	        }, SW_DELAI);
	    };

	    var stop = function () {
	    	data.state = 'STOPPED';
	        $timeout.cancel(stopwatch);
	        stopwatch = null;
	    };

	    var reset = function () {
	        stop()
	        data.value = 0;
	        data.laps = [];
	    };

	    var lap = function () {
	        data.laps.push(data.value);
	    };

	    var increment = function (secs){
	    	data.value += (secs * SW_DELAI) / 10;
	    }

	    return {
	        data: data,
	        start: start,
	        stop: stop,
	        reset: reset,
	        lap: lap,
	        increment: increment
	    };
	});
	;

	// .factory('Event', ['$resource', function ($resource) {
	// 	return $resource('/events/:id.json', {id: '@id', tagName: '@tagName'}, {
	// 		participate: {url: '/events/:id/participate/:tagName'},
	// 	});
	// }])

	// .directive('cloudImage', function() {
	// 	return {

	// 		link: function(scope, element, attrs) {
	// 			console.log(attrs);
	// 			var publicId = attrs.publicId;
	// 			var width = attrs.width;
	// 			var height = attrs.height;
	// 			var crop = attrs.crop;
	// 			var src = $.cloudinary.url(publicId, {
	// 				width: width || 100,
	// 				height: height || 100,
	// 				crop: crop || 'fill'
	// 			}) || 'https://docs.angularjs.org/img/angularjs-for-header-only.svg';

	// 			element.attr('src', src);
	// 		}
	// 	}
	// });

	// Initialize Cloudinary
	// $.cloudinary.config({cloud_name: 'wisepix'});

}).call(this);
