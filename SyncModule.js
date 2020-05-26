const request = require('request');

const { flatArray, pick } = require('./src/assets/scripts/utils');

const TAG = _TAG('SyncModule');

const default = {
  url: null, 
  sync: false,
  method: 'POST',
  interval: 600,
}

exports = {
  default,
}

/*
 * Initializes deamon based on database configuration
 */
exports.init = (app) => {
  // Generate 'obr-sync' config in database
  // app.models.Config.destroy({id: 'obr-sync'}, console.log)
  app.models.Config.findOrCreate({ id: 'obr-sync' }, {
    ...default,
    id:'obr-sync',
  }, (err, config) => {
    if (err) {
      return console.error('Falha ao criar configuração da `obr-sync`!');
    }

    console.log(TAG, 'init:', config.sync ? 'Ligado' : 'Desligado');
    exports.updateDeamon(config);
  });

  app.models.Config.findOrCreate({ id:'obr-last-sync' }, (err, config) => {
    if (err) {
      return console.error('Falha ao criar configuração da `obr-last-sync`!');
    }
  });
}

/*
 * Handles the route /obr-sync
 * Saves configs in the database, and update deamon to reflect new config
 */
exports.updateConfig = (req, res) => {

  // Save to database
  app.models.Config.findOne('obr-sync', (err, model) => {
    let config = pick({...default, ...model, ...req.query }, Object.keys(default)); 

    // Fix for boolean flags like 'sync'
    const falses = ['false', '0', 'off', false];
    config.sync = falses.includes(config.sync) ? false : true;

    // Convert time to number
    config.interval = parseInt(config.interval);
    
    // Update deamon
    exports.updateDeamon(config);

    // Persist do db if 'now' is not set
    if ('now' in req.query) {
      exports.sync(config, (err, data) => {
        if (err) {
          return res.status(500).send(err);
        }

        return res.send('now');
      })
    } else {
      app.models.Config.update('obr-sync', config, (err, model) => {
        return res.send(pick(model[0], Object.keys(default)));
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
  badge: 'Sync: Inicializando...',
}

exports.updateBadge = () => {
  var badge = 'Sincronização OBR: <span style="color: ';

  if (!exports.config.sync) {
    badge += '#DDD"> 😴️ Desligado';
  } else if (exports.error) {
    badge += '#ff687d"> 👎 Falhou';
  } else {
    badge += '#33EE30"> 👌 Ligado';
  }

  badge += '</span>';

  exports.statusMenu.badge = badge;
}

/*
 * Returns the last successfull sync
 */
exports.getLastSync = (req, res) => {
  app.models.Config.findOne('obr-last-sync', (err, config) => {
    if (err) {
      return res.status(500).send(err);
    }

    var lastSync = config && config.value;
    res.send({ timestamp: lastSync || null });
  })
}

/*
 * Updates the timestamp of the last success on sync (config: obr-last-sync)
 */
exports.didSync = () => {
  app.models.Config.update('obr-last-sync', {
    value: Date.now()
  }, (err, model) => {
    console.log(TAG, 'didSync', err || 'OK');
  })
}

exports.error = null
exports.config = null
exports.interval = null

/*
 * Updates the deamon responsible for triggering sync
 */
exports.updateDeamon = (config) => {
  exports.config = config;
  clearInterval(exports.interval);
  exports.interval = null;

  exports.updateBadge();

  if (!config.sync) {
    return;
  }
  // Limit interval period
  var period = exports.config.interval * 1000 || 0;
  period = Math.max(period,  1 * 60 * 1000); // 1 minute minimum
  period = Math.min(period, 30 * 60 * 1000); // 30 minutes maximum

  // Update interval
  exports.interval = setInterval(exports.sync, period);

  // Call on change
  exports.sync();

  console.log(TAG, 'Deamon updated. ');
}

/*
 * Fetches table data and sends as a post to the defined URL
 */
exports.sync = (config, next) => {
  config = config || exports.config;

  // Check tournamenter is compatible...
  if (!('ConvertTableToMatrix' in app.helpers))
    return next('A versão do TournamenterApp precisa estar acima de 1.7.0');

  // Sync
  console.log(TAG, 'Sync data...');

  // Get tables
  app.controllers.Table._findAssociated(null, (tables) => {

    const matrixTables = tables.map(ConvertTableToMatrix);

    const data = {
      tables: matrixTables,
      blobs: tables,
    }

    request({
      url: config.url, 
      json: data,
      method: 'POST'
    }, (err, httpResponse, body) => {
      if (err) {
        console.error(TAG, 'Failed to sync: ' + err);
        exports.error = true;
        exports.updateBadge();
        return next && next((err || '').toString() || body);
      }

      let { statusCode } = httpResponse;

      if (statusCode >= 400) {
        console.log(TAG, 'Failed to sync', statusCode)
        exports.error = true; exports.updateBadge();
        return next && next('Falha na sincronização. Retorno: ' + statusCode + ': ' + body);
      }

      // Update badge
      exports.error = false;
      exports.updateBadge();

      // Update timestamp
      exports.didSync();

      // Push to url as post
      next && next(null, body);
    })
  }, {
    isView: true,
  })
}

/*
 * Convert table to matrix
 */
function ConvertTableToMatrix(table) {
  if (!table) return null;

  const { scores, headers } = table
  const { rank, team, scores, final } = headers;
  const scoreColumns = parseInt(table.columns)
  const headerColumns = 3 // RANK, NAME and FINAL

  // Generate rows
  let rows = []

  // Push Header
  const header = flatArray([rank, team, scores, final])
  console.log(header);
  rows.push(header);

  // Push data
  scores.forEach((line) => {
    const { rank, team, scores, final } = line;
    var row = [rank, team || null];

    // Add scores (Makes sure the size is fixed)
    Array.from({ length: scoreColumns }).map((v,n) => {
      row.push(n in scores ? scores[n].value : '-');
    });

    // Add final score
    row.push(final);

    // Add to rows
    rows.push(row);
  })

  return rows;
}
