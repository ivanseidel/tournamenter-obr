import { countBy } from './utils';

angular
  .module('app.importar', [])

  .controller(
    'ImportarCtrl',
    ($scope, Team, ExternalEventAPI, ExternalTeamAPI) => {
      $scope.error = '';
      $scope.success = '';
      $scope.teams = Team.all();
      $scope.events = ExternalEventAPI.all();
      $scope.importEvent = null;
      $scope.teamsToImport = null;

      $scope.$watch('importEvent', () => {
        if (!$scope.importEvent) {
          return;
        }

        $scope.teamsToImport = ExternalTeamAPI.all({
          event: $scope.importEvent,
        });
      });

      $scope.actions = null;
      $scope.progress = 0;
      $scope.canCommit = false;

      $scope.diffTeams = () => {
        $scope.error = '';
        $scope.success = '';
        $scope.actions = null;

        $scope.teams = Team.all(
          () => {
            // Generate commits
            $scope.actions = getCommits(
              $scope.teams,
              $scope.teamsToImport,
              $scope.allowDelete
            );
            $scope.actionsStats = countBy($scope.actions, 'action');

            // Show message
            if ($scope.actions.length === 0) {
              $scope.success =
                'Nenhuma diferença encontrada. Equipes já estão sincronizados';
            } else {
              $scope.success =
                'Diferenças encontradas. Verifique e execute as mudanças (passo 2)';
              $scope.canCommit = true;
            }
          },
          err => {
            $scope.error = err;
          }
        );
      };

      $scope.executing = false;

      $scope.executeCommits = () => {
        if ($scope.executing) {
          return;
        }

        $scope.error = '';
        $scope.success = '';
        $scope.progress = 0;
        $scope.executing = true;
        $scope.canCommit = false;

        async.forEachSeries($scope.actions, applyCommit, err => {
          $scope.progress = 0;
          $scope.executing = false;
          if (err) {
            $scope.error = `Falha ao executar commit: ${err}`;
          }

          $scope.success = 'Importação finalizada com sucesso!';

          updateCommits();
        });
      };

      function getCommits(teams, newTeams, allowDelete) {
        const actions = [];

        newTeams.forEach(newTeam => {
          const team = teams.find(t => newTeam.id == t.id);

          if (!team) {
            // Create
            return actions.push({
              action: 'create',
              msg: newTeam.name,
              team: newTeam,
            });
          }

          if (isDifferent(newTeam, team)) {
            // Update
            const msg = team.name + ' -> ' + newTeam.name;
            return actions.push({ action: 'update', msg, team: newTeam });
          }
        });

        // Deletion?
        if (allowDelete) {
          teams.forEach(oldTeam => {
            const team = newTeams.find(t => oldTeam.id == t.id);

            if (!team) {
              // Remove
              return actions.push({
                action: 'remove',
                msg: oldTeam.name,
                team: oldTeam,
              });
            }
          });
        }

        return actions;
      }

      function applyCommit(commit, next) {
        const { action, team } = commit;
        const { id, name } = team;

        function onFinish() {
          commit.status = 'success';
          updateCommits();
          setTimeout(() => {
            next();
          }, 50);
        }

        function onError() {
          commit.status = 'error';
          updateCommits();
          next(
            `Falha ao executar commit: ${action} { id: ${id}, name: ${name} }`
          );
        }

        Team[action](team, onFinish, onError);
      }

      function isDifferent(a, b) {
        for (const k in a) {
          if (typeof a[k] !== 'string' || typeof a[k] !== 'number') {
            continue;
          }

          if (a[k] != b[k]) {
            console.log(a[k], b[k], 'differ');
            return true;
          }
        }
        return false;
      }

      function updateCommits() {
        // Update progress
        const total = $scope.actions.length;
        const progress = countBy($scope.actions, 'status')['success'] || 0;
        $scope.progress = Math.round((progress / total) * 100);

        // Apply changes to scope if not in digest phase
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      }
    }
  );
