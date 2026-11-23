(function () {
  'use strict';
  angular.module('obrArtistica', []).controller('ArtisticaCtrl', function ($scope, $http, $window) {
    var forms = $window.Artistica;
    var volunteer = $window.location.pathname.replace(/\/$/, '') === '/tournamenter-obr/voluntario-artistica';
    var api = volunteer ? '/tournamenter-obr/voluntario-api/artistica' : '/obr-artistica-api';
    var original, revision, occupied;
    $scope.volunteer = volunteer;
    $scope.rescueUrl = volunteer ? '/tournamenter-obr/voluntario' : '/tournamenter-obr';
    $scope.loginUrl = volunteer ? '/tournamenter-obr/acesso?modalidade=artistica' : '/login';
    $scope.columns = forms.columns;
    $scope.icons = {
      video: 'glyphicon-film', poster: 'glyphicon-picture', entrevista: 'glyphicon-comment',
      apresentacao1: 'glyphicon-music', apresentacao2: 'glyphicon-music', stand: 'glyphicon-flag'
    };
    $scope.selection = {};

    function dirty() {
      return $scope.draft && !angular.equals(original, $scope.draft);
    }

    function leave() {
      return !$scope.busy && (!dirty() || $window.confirm('Descartar as alterações desta ficha?'));
    }

    function beforeUnload(event) {
      if (dirty()) event.returnValue = 'Esta ficha tem alterações sem salvar.';
    }
    $window.addEventListener('beforeunload', beforeUnload);
    $scope.$on('$destroy', function () { $window.removeEventListener('beforeunload', beforeUnload); });

    function clearSheet() {
      $scope.draft = $scope.saved = $scope.error = $scope.existingSummary = null;
      $scope.showErrors = $scope.sessionExpired = $scope.conflict = false;
      original = revision = null;
      occupied = false;
    }

    function failed(response) {
      $scope.sessionExpired = response.status === 401 ||
        (typeof response.data === 'string' && response.data.indexOf('<') !== -1);
      $scope.conflict = response.status === 409 && !!$scope.draft;
      $scope.error = $scope.sessionExpired ? 'Sua sessão expirou.' :
        (response.data && response.data.error || 'Não foi possível concluir. Verifique a conexão e tente novamente.');
    }

    $scope.loadTables = function () {
      $scope.busy = true;
      $scope.error = null;
      var previous = $scope.selection.table;
      $scope.selection = {};
      $scope.tables = null;
      return $http.get(api + '/tabelas').then(function (response) {
        if (!Array.isArray(response.data)) return failed(response);
        $scope.tables = response.data;
        $scope.selection.table = $scope.tables.filter(function (table) {
          return previous && previous.id === table.id;
        })[0] || ($scope.tables.length === 1 ? $scope.tables[0] : null);
      }, failed).finally(function () { $scope.busy = false; });
    };

    $scope.chooseColumn = function (column) {
      if ($scope.busy) return;
      clearSheet();
      $scope.column = column;
      $scope.loadTables();
    };
    $scope.changeColumn = function () {
      if (!leave()) return;
      clearSheet();
      $scope.column = null;
    };
    $scope.selectTable = function () {
      $scope.selection.team = null;
      $scope.error = null;
    };
    $scope.backToTeams = function () {
      if (!leave()) return;
      clearSheet();
      $scope.loadTables();
    };
    $scope.alreadySubmitted = function (row) {
      row = row || $scope.selection.team;
      return row && row.submittedColumns.indexOf($scope.column.id) !== -1;
    };
    $scope.teamLabel = function (row) {
      return (row.team.name || 'Equipe sem nome') + ($scope.alreadySubmitted(row) ? ' · já avaliada' : '');
    };
    function updateSubmissionStatus(hasScore) {
      var columns = $scope.selection.team.submittedColumns;
      var index = columns.indexOf($scope.column.id);
      if (hasScore && index === -1) columns.push($scope.column.id);
      if (!hasScore && index !== -1) columns.splice(index, 1);
    }

    function teamPath() {
      return encodeURIComponent($scope.selection.table.id) + '/' + encodeURIComponent($scope.selection.team.id);
    }
    $scope.reportUrl = function (columnId) {
      return api + '/relatorios/' + teamPath() + '/' + columnId;
    };
    function sheetUrl() {
      return api + '/sumulas/' + teamPath() + '/' + $scope.column.id;
    }

    $scope.openSheet = function () {
      if ($scope.busy || !$scope.selection.team || $scope.selection.table.locked || (volunteer && $scope.alreadySubmitted())) return;
      clearSheet();
      $scope.busy = true;
      var column = $scope.column;
      return $http.get(sheetUrl()).then(function (response) {
        var body = response.data;
        if (!body || !Array.isArray(body.cells) || !body.revision) return failed(response);
        revision = body.revision;
        occupied = body.cells.length > 0;
        updateSubmissionStatus(occupied);
        var main = body.cells.filter(function (cell) { return cell.index === column.index; })[0];
        var bonus = body.cells.filter(function (cell) { return cell.index === column.bonusIndex; })[0];
        var restored = forms.restore(column.id, (main || bonus || {}).data);
        var draft = restored || forms.createDraft(column.id);
        // An administrator may have entered the sustainability bonus directly in the table.
        if (bonus) draft.criteria.sustentabilidade.points = Number(bonus.value);
        if (occupied) {
          var values = body.cells.map(function (cell) {
            return (cell.index === column.bonusIndex ? 'Sustentabilidade' : column.label) + ' (' + cell.value + ' pontos)';
          });
          $scope.existingSummary = 'Nota registrada: ' + values.join(' e ') + '. ' +
            (restored ? 'Confira a ficha antes de salvar uma correção.' : 'Preencha os critérios para substituir a nota anterior.');
        }
        original = angular.copy(draft);
        $scope.draft = draft;
      }, function (response) {
        if (response.status === 409 && volunteer) {
          // The team or table may have become unavailable since the list was loaded.
          return $scope.loadTables().then(function () { failed(response); });
        }
        failed(response);
      }).finally(function () { $scope.busy = false; });
    };

    $scope.$watch('draft', function (draft) {
      $scope.result = draft ? forms.evaluate($scope.column.id, draft) : null;
    }, true);

    $scope.save = function () {
      if ($scope.busy || !$scope.draft || $scope.conflict) return;
      var result = forms.evaluate($scope.column.id, $scope.draft);
      $scope.showErrors = true;
      if (!result.valid) return;
      if (occupied && !$window.confirm('Substituir a nota registrada de ' + $scope.selection.team.team.name +
        ' em ' + $scope.column.label + '?')) return;
      $scope.error = null;
      $scope.busy = true;
      return $http.put(sheetUrl(), { revision: revision, data: $scope.draft },
        { headers: { 'X-OBR-Pontuador': '1' } }).then(function (response) {
        if (!response.data || !Array.isArray(response.data.cells) || !response.data.revision) return failed(response);
        updateSubmissionStatus(true);
        clearSheet();
        $scope.saved = result;
        $window.scrollTo(0, 0);
      }, failed).finally(function () { $scope.busy = false; });
    };
  });
}());
