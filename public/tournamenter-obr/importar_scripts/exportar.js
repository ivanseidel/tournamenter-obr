const ObrConfigProps = ['url', 'sync', 'method', 'interval']

angular.module('app.exportar', [])

.controller('ExportarCtrl', function($scope, $interval, ObrConfig) {
  $scope.error = ''
  $scope.success = ''
  $scope.needsSave = false
  $scope.syncConfig = ObrConfig.get()

  $scope.$watchCollection('syncConfig', function(oldVal, newVal) {
    console.log('changed', oldVal.$resolved, newVal.$resolved)
    if (oldVal.$resolved && !newVal.$resolved) {
      $scope.needsSave = false  
    } else {
      $scope.needsSave = true  
    }
  })

  $scope.save = function (){
    $scope.error = ''
    $scope.success = ''
    $scope.needsSave = false
    // var newConfig = angular.toJson($scope.syncConfig)
    var config = _.pick($scope.syncConfig, ObrConfigProps)
    ObrConfig.save(config)
  }

  $scope.sync = function (){
    $scope.error = ''
    $scope.success = ''

    ObrConfig.get({now: true}, function () {
      $scope.success = 'Sincronizado com sucesso!'
    }, function (res){
      $scope.error = res.data
    })
  }
})
