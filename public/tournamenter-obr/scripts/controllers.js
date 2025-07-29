// v1.01
(function() {

	/*
		Configurations
	*/
	var GlobalScorerName = 'RescueScorer2025Regional';
	var SCORE_WITH_TIME = true;

	angular.module('app.controllers', [])

	.controller('AppCtrl', [
		'$scope', '$location', function($scope, $location) {

			$scope.go = function ( path ) {
				$location.path( path );
			};

			$scope.isActive = function (pt){
				// console.log('check: '+ pt);
				return $location.path().indexOf(pt) > -1;
			}

		}
	])

	.controller('SaveScoreController',
		function ($scope, $modalInstance, extra, Table){
			// $scope.scoreId = scoreId;

			$scope.page = 'selectTable';
			$scope.selected = {
				table: null,
				round: null,
				score: null,
				completeMission: 0,
				// Extras
				time: extra.time,
				total: extra.total,
				doNotSave: extra.doNotSave,
				maxTime: 300,
			};

			$scope.tables = Table.all(
				function (){},
				function (){
					$modalInstance.dismiss('cancel');
					window.alert('FALHA AO BAIXAR EQUIPES E TABELAS. REFAÇA A OPERAÇÃO.');
				});

			$scope.selectTable = function (table){
				$scope.selected.table = table;
				$scope.selected.score = null;
			}

			$scope.selectRound = function (round){
				$scope.selected.round = round;
			}

			$scope.selectScore = function (score){
				$scope.selected.score = score;
			}

			$scope.ok = function () {

				var selected = $scope.selected;
				var score = selected.score.scores;

				var index1 = (SCORE_WITH_TIME ? selected.round * 2 : selected.round);
				var index2 = (SCORE_WITH_TIME ? selected.round * 2 + 1 : selected.round);
				var isScoredAlready = score[index1] || (SCORE_WITH_TIME && score[index2])
				var isLoading = extra.doNotSave

				if(!isLoading && isScoredAlready){
					// Score already exist. Confirm that
					var key = prompt("Parece que esta equipe já possui uma pontuação neste round."+
						"\nConfirme com o código para substituir.");
					if(key != '1235')
						return alert('Código incorreto.');
				}

				$modalInstance.close($scope.selected, $scope.extra);
			};

			$scope.cancel = function () {
				$modalInstance.dismiss('cancel');
			};
		}
	)

	.controller('RescueScorer', ['$scope', GlobalScorerName, 'stopwatch', '$modal', 'Score',
		function ($scope, Scorer, stopwatch, $modal, Score){
			var scp = $scope;

			$scope.scorer = Scorer;
			$scope.timer = stopwatch;
			$scope.team = null;

			$scope.scorings = {};
			$scope.scoreData = {};

			$scope.newScore = function (substitute, conf){
				if(conf){
					if(!confirm('Are you sure you want to delete this?'))
						return;
				}
				$scope.scoreData = _.deepClone(substitute || Scorer.model);
				$scope.timer.reset();
				$scope.team = null
				$scope.compute();
			};


			$scope.compute = function (){
				console.log('Computing score');
				$scope.scorings = $scope.scorer.score($scope.scoreData);
			};
			$scope.newScore();
			$scope.$watch('scoreData', function (){
				$scope.compute();
			}, true);


			$scope.sumSpecial = function (obj, keys){
				if(keys)
					obj = _.pick(obj, keys);
				return _.reduce(_.values(obj), function(memo, num){ return memo + num; }, 0);
			};

			$scope.selectScoredTeam = function (doNotSave){

				var finalTime = 0;

				if(SCORE_WITH_TIME){
					finalTime = $scope.timer.data.value / 10;
					if(finalTime > Scorer.totalTime)
						finalTime = Scorer.totalTime;
				}

				var modalInstance = $modal.open({
					templateUrl: 'views/modal_select_team.html?r='+Math.random(),
					controller: 'SaveScoreController',
					size: 'lg',
					// windowTemplateUrl: '/views/window.html',
					// backdrop: false,
					resolve: {
						extra: function () {
							return {
								total: $scope.scorings.total,
								time: finalTime,
								doNotSave: doNotSave,
							}
						}
					}
				});

				modalInstance.result.then(function (selected) {
					if(doNotSave && selected && selected.score.id){
						console.log(selected)
						var score = selected.score;
						var index = SCORE_WITH_TIME ? selected.round * 2 : selected.round
						var scoreData = score.scores[index];
						var scoreTime = 0;

						// Load time if SCORE_WITH_TIME is true
						if (SCORE_WITH_TIME) {
							scoreTime = score.scores[index + 1] && score.scores[index + 1].value || 0
						}
						console.log(scoreData, selected.round, scoreTime)
						// var scoreTime = score.scores[(selected.round - 1) * 2 + 1];

						var parsedData = JSON.parse(scoreData.data);
						console.log(parsedData);

						setTimeout(function (){
							scp.scoreData = parsedData;
							scp.timer.data.value = scoreTime * 10
							scp.team = score.team && score.team.name || '<Equipe sem nome>'
							scp.$apply();

						}, 50);
						return;
					}

					// Saves if doNotSave flag is false
					if(!doNotSave && selected && selected.score.id){

						if(SCORE_WITH_TIME){
							if(!selected.completeMission)
								selected.time = Scorer.totalTime;
						}

						var number1 = (SCORE_WITH_TIME ? selected.round * 2 : selected.round);
						var number2 = (SCORE_WITH_TIME ? selected.round * 2 + 1 : selected.round);

						// Save Data
						Score.saveScore({
							number: number1,
							id: selected.score.id,
							data: $scope.scoreData,
							value: selected.total,
						}, function (){

							if(SCORE_WITH_TIME){
								// Save Time
								Score.saveScore({
									number: number2,
									id: selected.score.id,
									data: $scope.scoreData,
									value: selected.time,
								}, function (){

									checkScore();

								}, function (){window.alert('FALHA AO SALVAR #2. REFAÇA A OPERAÇÃO.')});
							}else{
								checkScore();
							}

						}, function (){window.alert('FALHA AO SALVAR #1. REFAÇA A OPERAÇÃO.')});

						function checkScore(){
							Score.get({
								id: selected.score.id
							}, function (score){
								console.log(score);
								console.log(selected.total, score.scores[number1]);
								console.log(score.scores[number2].value, Math.round(selected.time));
								if(score.scores[number1].value != selected.total){
									window.alert('FALHA AO SALVAR #3. REFAÇA A OPERAÇÃO.');
								}else if(SCORE_WITH_TIME && score.scores[number2].value != Math.floor(selected.time)){
									window.alert('FALHA AO SALVAR #4. REFAÇA A OPERAÇÃO.');
								}else{
									window.alert('OK! Salvo com sucesso.');
								}
							}, function (){
								window.alert('FALHA AO SALVAR #6. REFAÇA A OPERAÇÃO.');
							})
						}
					}


				}, function () {});
			};

		}
	]);

}).call(this);
