const _ = require('lodash');
const endpoint = 'https://olimpo.robocup.org.br/api/events/steps/score';
const defaults = { url: null, sync: false, method: 'POST', interval: 600 };

function createSync(host, statusMenu) {
  const { Config } = host.models;
  let timer;
  let pending;
  let current = defaults;
  let failed = false;

  function updateBadge() {
    statusMenu.badge = 'Sincronização OBR: ' + (!current.sync ? '😴️ Desligado' : failed ? '👎 Falhou' : '👌 Ligado');
  }
  async function transmit() {
    const tables = await new Promise((resolve, reject) => {
      const query = host.controllers.Table._findAssociated(null, resolve, { isView: true });
      query?.catch?.(reject);
    });
    const steps = tables.map(ConvertTableToMatrix).filter(Boolean);
    const response = await fetch(endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ steps }), signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error('Falha na sincronização. Retorno: ' + response.status);
    await Config.update('obr-last-sync', { value: Date.now() });
  }
  function sync() {
    if (!pending) {
      pending = transmit().then(() => { failed = false; }, error => { failed = true; throw error; })
        .finally(() => { pending = null; updateBadge(); });
    }
    return pending;
  }
  function schedule(config) {
    clearInterval(timer);
    current = _.pick(config, Object.keys(defaults));
    updateBadge();
    if (!current.sync) return;
    const run = () => sync().catch(error => console.warn('[OBR]', error.message));
    timer = setInterval(run, Math.min(1800, Math.max(60, Number(current.interval) || 600)) * 1000);
    timer.unref?.();
    run();
  }

  async function initialize() {
    await Config.findOrCreate({ id: 'obr-last-sync' }, { id: 'obr-last-sync' });
    const config = await Config.findOrCreate({ id: 'obr-sync' }, { id: 'obr-sync', ...defaults });
    schedule(config);
  }
  async function updateConfig(req, res, next) {
    try {
      const params = { ...req.query, ...req.body };
      if ('now' in params) {
        await sync();
        return res.json({ ok: true });
      }
      if (!Object.keys(params).some(key => Object.hasOwn(defaults, key))) return res.json(current);
      const config = { ...current, ..._.pick(params, Object.keys(defaults)) };
      config.sync = [true, 'true', 'on', '1'].includes(config.sync);
      config.interval = Number(config.interval);
      if (!Number.isInteger(config.interval) || config.interval < 60 || config.interval > 1800) {
        return res.status(400).json({ error: 'Informe um intervalo entre 60 e 1800 segundos.' });
      }
      const [stored] = await Config.update('obr-sync', config);
      schedule(stored);
      res.json(current);
    } catch (error) { next(error); }
  }
  async function getLastSync(req, res, next) {
    try { res.json({ timestamp: (await Config.findOne('obr-last-sync'))?.value || null }); }
    catch (error) { next(error); }
  }
  return { initialize, updateConfig, getLastSync, close: () => clearInterval(timer) };
}

module.exports = { createSync };

function ConvertTableToMatrix(table) {
  if (!table || !table.scores || !table.scores[0] || !table.scores[0].team)
    return null;

  var scores = table.scores
  var headers = table.headers
  var scoreColumns = parseInt(table.columns)
  const stepId = scores[0].team.stepId;
  const token = scores[0].team.token;
  var header = _.flatten([headers.rank, headers.scores, headers.final])
  const scoresData = scores.map((line) => {
    const dataMap = {};
    const headersMap = {};
    headersMap[headers.rank] = line.rank;
    _.times(scoreColumns, function (n) {
      if(line.scores && line.scores[n]){
        dataMap[headers.scores[n]] = line.scores[n].data;
        headersMap[headers.scores[n]] = line.scores[n].value;
      }
      else{
        dataMap[headers.scores[n]] = '';
        headersMap[headers.scores[n]] = 0;
      }
    })
    headersMap[headers.final] = line.final;
    return {
      id: line.team.olimpoId,
      dataMap,
      headersMap
    }
  })

  const step = {
    id: stepId, 
    token: token,
    headers: header,
    scores: scoresData,
  }

  return step;
}