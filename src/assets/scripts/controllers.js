// v1.01
const { pick } = require('./utils');

(function () {
  /*
		Configurations
	*/
  const GlobalScorerName = 'RescueScorer2018Nacional';
  const SCORE_WITH_TIME = true;

  angular
    .module('app.controllers', [])

    .controller('AppCtrl', [
      '$scope',
      '$location',
      ($scope, $location) => {
        $scope.go = path => {
          $location.path(path);
        };

        $scope.isActive = pt => {
          // console.log('check: '+ pt);
          return $location.path().indexOf(pt) > -1;
        };
      },
    ])

    .controller(
      'SaveScoreController',
      ($scope, $modalInstance, extra, Table) => {
        // $scope.scoreId = scoreId;

        $scope.page = 'selectTable';
        $scope.selected = {
          table: null,
          round: null,
          score: null,
          // Extras
          time: extra.time,
          total: extra.total,
          doNotSave: extra.doNotSave,
        };

        $scope.tables = Table.all(
          () => {},
          () => {
            $modalInstance.dismiss('cancel');
            window.alert(
              'FALHA AO BAIXAR EQUIPES E TABELAS. REFAÇA A OPERAÇÃO.'
            );
          }
        );

        $scope.selectTable = table => {
          $scope.selected.table = table;
          $scope.selected.score = null;
        };

        $scope.selectRound = round => {
          $scope.selected.round = round;
        };

        $scope.selectScore = score => {
          $scope.selected.score = score;
        };

        $scope.ok = () => {
          const { selected } = $scope;
          const index1 = SCORE_WITH_TIME ? selected.round * 2 : selected.round;
          const index2 = SCORE_WITH_TIME
            ? selected.round * 2 + 1
            : selected.round;
          const isScoredAlready =
            score[index1] || (SCORE_WITH_TIME && score[index2]);
          const isLoading = extra.doNotSave;

          if (!isLoading && isScoredAlready) {
            // Score already exist. Confirm that
            const key = prompt(`Parece que esta equipe já possui uma pontuação neste round.
					Confirme com o código para substituir.`);
            if (key != '1235') {
              return alert('Código incorreto.');
            }
          }

          $modalInstance.close($scope.selected, $scope.extra);
        };

        $scope.cancel = () => {
          $modalInstance.dismiss('cancel');
        };
      }
    )

    .controller('RescueScorer', [
      '$scope',
      GlobalScorerName,
      'stopwatch',
      '$modal',
      'Score',
      ($scope, Scorer, stopwatch, $modal, Score) => {
        const scp = $scope;

        $scope.scorer = Scorer;
        $scope.timer = stopwatch;
        $scope.team = null;

        $scope.scorings = {};
        $scope.scoreData = {};

        $scope.newScore = (substitute, conf) => {
          if (conf && !confirm('Are you sure you want to delete this?')) {
            return;
          }

          $scope.scoreData = JSON.parse(
            JSON.stringify(substitute || Scorer.model)
          );
          $scope.timer.reset();
          $scope.team = null;
          $scope.compute();
        };

        $scope.compute = () => {
          console.log('Computing score');
          $scope.scorings = $scope.scorer.score($scope.scoreData);
        };
        $scope.newScore();
        $scope.$watch(
          'scoreData',
          () => {
            console.log('Mudou');
            $scope.compute();
          },
          true
        );

        $scope.sumSpecial = (obj, keys) => {
          if (keys) {
            obj = pick(obj, keys);
          }
          return Object.values(obj).reduce((memo, num) => memo + num, 0);
        };

        $scope.selectScoredTeam = doNotSave => {
          let finalTime = 0;

          if (SCORE_WITH_TIME) {
            finalTime = $scope.timer.data.value / 10;
            if (
              $scope.scorings.saiu_salvamento['final'] <= 0 ||
              finalTime > Scorer.totalTime
            ) {
              finalTime = Scorer.totalTime;
            }
          }

          const modalInstance = $modal.open({
            templateUrl: `views/modal_select_team.html?r=${Math.random()}`,
            controller: 'SaveScoreController',
            size: 'lg',
            // windowTemplateUrl: '/views/window.html',
            // backdrop: false,
            resolve: {
              extra: () => {
                return {
                  total: $scope.scorings.total,
                  time: finalTime,
                  doNotSave: doNotSave,
                };
              },
            },
          });

          modalInstance.result.then(
            selected => {
              if (doNotSave && selected && selected.score.id) {
                console.log(selected);
                const { score, round } = selected;
                const index = SCORE_WITH_TIME ? round * 2 : round;
                const scoreData = score.scores[index];
                let scoreTime = 0;

                // Load time if SCORE_WITH_TIME is true
                if (SCORE_WITH_TIME) {
                  scoreTime =
                    (score.scores[index + 1] &&
                      score.scores[index + 1].value) ||
                    0;
                }
                console.log(scoreData, round, scoreTime);
                // var scoreTime = score.scores[(selected.round - 1) * 2 + 1];

                const parsedData = JSON.parse(scoreData.data);
                console.log(parsedData);

                setTimeout(() => {
                  scp.scoreData = parsedData;
                  scp.timer.data.value = scoreTime * 10;
                  scp.team =
                    (score.team && score.team.name) || '<Equipe sem nome>';
                  scp.$apply();
                }, 50);
                return;
              }

              // Saves if doNotSave flag is false
              if (!doNotSave && selected && selected.score.id) {
                const { round, total, time, score } = selected;

                const number1 = SCORE_WITH_TIME ? round * 2 : round;
                const number2 = SCORE_WITH_TIME ? round * 2 + 1 : round;

                // Save Data
                Score.saveScore(
                  {
                    number: number1,
                    id: score.id,
                    data: $scope.scoreData,
                    value: total,
                  },
                  () => {
                    if (SCORE_WITH_TIME) {
                      // Save Time
                      Score.saveScore(
                        {
                          number: number2,
                          id: score.id,
                          data: $scope.scoreData,
                          value: time,
                        },
                        () => {
                          checkScore();
                        },
                        () => {
                          window.alert(
                            'FALHA AO SALVAR #2. REFAÇA A OPERAÇÃO.'
                          );
                        }
                      );
                    } else {
                      checkScore();
                    }
                  },
                  () => {
                    window.alert('FALHA AO SALVAR #1. REFAÇA A OPERAÇÃO.');
                  }
                );

                function checkScore() {
                  const { id } = score;
                  Score.get(
                    {
                      id,
                    },
                    score => {
                      console.log(score);
                      console.log(total, score.scores[number1]);
                      console.log(
                        score.scores[number2].value,
                        Math.round(time)
                      );
                      if (score.scores[number1].value != total) {
                        window.alert('FALHA AO SALVAR #3. REFAÇA A OPERAÇÃO.');
                      } else if (
                        SCORE_WITH_TIME &&
                        score.scores[number2].value != Math.floor(time)
                      ) {
                        window.alert('FALHA AO SALVAR #4. REFAÇA A OPERAÇÃO.');
                      } else {
                        window.alert('OK! Salvo com sucesso.');
                      }
                    },
                    () => {
                      window.alert('FALHA AO SALVAR #6. REFAÇA A OPERAÇÃO.');
                    }
                  );
                }
              }
            },
            () => {}
          );
        };
      },
    ]);
}.call(this));
