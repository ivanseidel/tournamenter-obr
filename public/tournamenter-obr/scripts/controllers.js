// v1.01
(function() {

	/*
		Configurations
	*/
	var GlobalScorerName = 'RescueScorer2026Nacional';
	var SCORE_WITH_TIME = true;
	var PRELIMINARY_ROUNDS = ['Round 1', 'Round 2', 'Round 3'];

	function isNationalRescue(table) {
		return table && table.evaluateMethod === 'resgate2026nacional';
	}

	function isNationalFinal(selected) {
		return isNationalRescue(selected.table) && selected.round === 3;
	}

	function scoreColumn(selected) {
		return isNationalFinal(selected) ? 9 : (SCORE_WITH_TIME ? selected.round * 2 : selected.round);
	}

	function savesTime(selected) {
		return SCORE_WITH_TIME && !isNationalFinal(selected);
	}

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
				maxTime: extra.maxTime,
			};

			$scope.tables = Table.all(
				function (){},
				function (){
					$modalInstance.dismiss('cancel');
					window.alert('FALHA AO BAIXAR EQUIPES E TABELAS. REFAÇA A OPERAÇÃO.');
				});

			$scope.selectTable = function (table){
				$scope.selected.table = table;
				$scope.selected.round = null;
				$scope.selected.score = null;
			}

			$scope.selectRound = function (round){
				$scope.selected.round = round;
				$scope.selected.score = null;
			}

			$scope.scoreColumn = scoreColumn;
			$scope.savesTime = savesTime;
			$scope.rounds = function (table) {
				if (!isNationalRescue(table)) return ['Round 1', 'Round 2', 'Round 3 ou Final'];
				return table.columns >= 10 && table.scores && table.scores.some(function (row) {
					return row.resgateFinalista;
				}) ? PRELIMINARY_ROUNDS.concat('Final') : PRELIMINARY_ROUNDS;
			};
			$scope.teamAvailable = function (row) {
				return !isNationalFinal($scope.selected) || row.resgateFinalista;
			};

			$scope.selectScore = function (score){
				$scope.selected.score = score;
			}

			$scope.ok = function () {

				var selected = $scope.selected;
				if (!selected.table || selected.round === null || !selected.score || !$scope.teamAvailable(selected.score)) return;
				var score = selected.score.scores;

				var index1 = scoreColumn(selected);
				var isScoredAlready = score[index1] || (savesTime(selected) && score[index1 + 1])
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
								maxTime: Scorer.totalTime,
								doNotSave: doNotSave,
							}
						}
					}
				});

				modalInstance.result.then(function (selected) {
					if(doNotSave && selected && selected.score.id){
						console.log(selected)
						var score = selected.score;
						var index = scoreColumn(selected)
						var scoreData = score.scores[index];
						var scoreTime = 0;

						// Load time if SCORE_WITH_TIME is true
						if (savesTime(selected)) {
							scoreTime = score.scores[index + 1] && score.scores[index + 1].value || 0
						}
						console.log(scoreData, selected.round, scoreTime)
						// var scoreTime = score.scores[(selected.round - 1) * 2 + 1];

						if (!scoreData || !scoreData.data) return window.alert('Não há uma súmula salva para esta rodada.');
						var parsedData = typeof scoreData.data === 'string' ? JSON.parse(scoreData.data) : scoreData.data;
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

						if(savesTime(selected)){
							if(!selected.completeMission)
								selected.time = Scorer.totalTime;
						}

						var number1 = scoreColumn(selected);
						var number2 = number1 + 1;

						if (isNationalFinal(selected)) {
							Score.saveFinal({
								tableId: selected.table.id,
								id: selected.score.id,
							}, {
								data: $scope.scoreData,
								value: selected.total,
								updatedAt: selected.score.updatedAt,
							}, checkScore, function (response) {
								if (response.status === 409 && response.data && response.data.error) {
									return window.alert(response.data.error + ' Abra o pontuador novamente para atualizar a seleção.');
								}
								window.alert('FALHA AO SALVAR #1. REFAÇA A OPERAÇÃO.');
							});
							return;
						}

						// Save Data
						Score.saveScore({
							number: number1,
							id: selected.score.id,
							data: $scope.scoreData,
							value: selected.total,
						}, function (){

							if(savesTime(selected)){
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
								if(!score.scores[number1] || score.scores[number1].value != selected.total){
									window.alert('FALHA AO SALVAR #3. REFAÇA A OPERAÇÃO.');
								}else if(savesTime(selected) && (!score.scores[number2] || score.scores[number2].value != Math.floor(selected.time))){
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
