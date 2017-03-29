var TAG = _TAG('SyncModule')

var request = require('request')

exports.default = {
  url: null, 
  sync: false,
  method: 'PUT',
  interval: 600,
}

/*
 * Initializes deamon based on database configuration
 */
exports.init = function (app) {
  // Generate 'obr-sync' config in database
  app.models.Config.findOrCreate(_.defaults({
    id:'obr-sync',
  }, exports.default), function (err, config){
    if (err) {
      return console.log('Falha ao criar configuração da `obr-sync`!');
    }

    exports.updateDeamon(config)
  })

  app.models.Config.findOrCreate(_.defaults({
    id:'obr-last-sync',
  }, {}), function (err, config){
    if (err) {
      return console.log('Falha ao criar configuração da `obr-last-sync`!');
    }
  })
}

/*
 * Handles the route /obr-sync
 * Saves configs in the database, and update deamon to reflect new config
 */
exports.updateConfig = function (req, res) {

  // Save to database
  app.models.Config.findOne('obr-sync', function (err, model) {
    var config = _.defaults(req.query, model, exports.default)
    config = _.pick(config, _.keys(exports.default))
    
    // Fix for boolean flags like 'sync'
    var falses = ['false', '0', 'off', false]
    config.sync = falses.includes(config.sync) ? false : true

    // Convert time to number
    config.interval = parseInt(config.interval)
    
    // Update deamon
    exports.updateDeamon(config)

    // Persist do db if 'now' is not set
    if ('now' in req.query) {
      exports.sync(config, function (err, data) {
        if (err) {
          return res.status(500).send(err)
        }

        return res.send('now')
      })
    } else {
      app.models.Config.update('obr-sync', config, function (err, model){
        return res.send(_.pick(model[0], _.keys(exports.default)))
      })
    }
  })
}

/*
 * Controls the menu badge with the Sync status
 */
exports.statusMenu = {
  path: '/obr-config',
  name: '',
  badge: 'Sync: Inicializando...'
}

exports.updateBadge = function () {
  var on = '<span style="color: #33EE30">Ligado</span>'
  var off = '<span style="color: #ff687d">Desligada</span>'
  var badge = 'Syncronização: ' + (exports.config.sync ? on : off)

  exports.statusMenu.badge = badge
}

/*
 * Returns the last successfull sync
 */
exports.getLastSync = function getLastSync(req, res) {
  app.models.Config.findOne('obr-last-sync', function (err, config) {
    if (err) {
      return res.status(500).send(err)
    }

    var lastSync = config && config.value
    res.send({timestamp: lastSync || null,  })
  })
}

/*
 * Updates the timestamp of the last success on sync (config: obr-last-sync)
 */
exports.didSync = function didSync() {
  app.models.Config.update('obr-last-sync', {
    value: Date.now()
  }, function (err, model) {
    console.log(TAG, 'didSync', err ? err : 'OK')
  })
}

exports.config = null
exports.interval = null

/*
 * Updates the deamon responsible for triggering sync
 */
exports.updateDeamon = function (config) {
  exports.config = config
  clearInterval(exports.interval)
  exports.interval = null

  exports.updateBadge()

  if (!config.sync) {
    return
  }
  // Limit interval period
  var period = exports.config.interval * 1000 || 0
  period = Math.max(period,  1 * 60 * 1000) // 1 minute minimum
  period = Math.min(period, 30 * 60 * 1000) // 30 minutes maximum
  
  // Update interval
  exports.interval = setInterval(exports.sync, period)
  console.log(TAG, 'Deamon updated. ')
}

/*
 * Fetches table data and sends as a post to the defined URL
 */
exports.sync = function (config, next) {
  config = config || exports.config

  // Sync
  console.log(TAG, 'Sync data...')

  // Get tables
  app.controllers.Table._findAssociated(null, function (tables) {
    request({
      url: config.url, 
      json: tables,
      method: config.method
    }, function (err, httpResponse, body) {
      if (err) {
        console.log(TAG, 'Failed to sync: ' + err)
        return next && next((err || '').toString() || body)
      }
      // Update timestamp
      exports.didSync()

      // Push to url as post
      next && next(null, body)
    })
  })
}