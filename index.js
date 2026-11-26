const path = require('node:path');
const pkg = require('./package.json');
const { createSync } = require('./SyncModule');
const saveResgateFinal = require('./save-resgate-final');
const pontuadorAccess = require('./pontuador/routes');
const { installAdminScoreWrites } = require('./pontuador/score-writes');
const publicDir = path.join(__dirname, 'public');
const statusMenu = { path: '/obr-config', name: '', badge: 'Sync: Inicializando...' };

module.exports = {
  type: ['menu'],
  getAssets(host = global.app) {
    installAdminScoreWrites(host);
    pontuadorAccess.install(host, host.helpers.isAuthenticated);
    return { css: [], js: [], jst: [], serve: [publicDir] };
  },
  menus: [
    {
      name: 'Plugin OBR',
      childs: [
        {
          path: '/tournamenter-obr',
          name: 'Pontuador',
        },
        {
          path: '/obr-artistica',
          name: 'Pontuador Artística',
        },
        {
          path: '/obr-config',
          name: 'Configurar (Importar/Exportar)',
        },
        {
          path: '/obr-desafio',
          name: 'Desafio Surpresa',
        },
        {
          path: '/obr-rounds',
          name: 'Gerar Tabela de Horários',
        },
        {
          path: '/ManualOBRTournamenter.pdf',
          name: 'Manual (.pdf)',
        },
      ],
      order: 6
    },
    // Realtime badge for Sincronization with Sistema Olimpo
    statusMenu
    // {name: 'Pontuador', path: '/tournamenter-obr', order: 6},
    // {name: 'Importador Sistema Olimpo', path: '/tournamenter-obr/importar.html', order: 7},
  ],

  async initialize(host) {
    const { config, models, server, helpers } = host;
    const TableModel = require(path.join(config.root, 'models', 'Table'));
    for (const method of ['obr2017', 'obr2018nacional', 'obr2024', 'obr2025', 'artistica2025', 'artistica2026', 'artistica2026nacional']) {
      TableModel.evaluateMethods[method] = require('./sorters/' + method);
    }
    require('./sorters/resgate2026nacional').register(models.Table);
    models.Table.attributes.headerTeam.defaultsTo = 'Equipe';
    if (!config.appLogo || path.resolve(config.appLogo) === path.join(config.root, 'public/img/branding.png')) {
      config.appLogo = path.join(publicDir, 'tournamenter-obr', 'obr.png');
    }
    const auth = helpers.isAuthenticated;
    const sync = createSync(host, statusMenu);
    server.all('/obr-sync', auth, sync.updateConfig);
    server.all('/obr-last-sync', auth, sync.getLastSync);
    server.post('/obr-resgate-final/:tableId/:id', auth, saveResgateFinal(models));
    for (const route of ['/', '/obr-config', '/obr-desafio', '/obr-rounds']) {
      server.get(route, auth, (req, res) => res.sendFile('admin.html', { root: path.join(__dirname, 'pontuador') }));
    }
    let newestVersion = null;
    // Keep the update notice optional on isolated competition networks.
    fetch('https://registry.npmjs.org/' + pkg.name + '/latest', { signal: AbortSignal.timeout(3000) })
      .then(response => response.ok ? response.json() : null)
      .then(info => {
        if (info?.version && info.version.localeCompare(pkg.version, 'en', { numeric: true }) > 0) newestVersion = info.version;
      }).catch(() => {});
    server.get('/obr-versao', auth, (req, res) => res.json({ newestVersion }));
    await sync.initialize();
    if (host.close) {
      const close = host.close.bind(host);
      host.close = async () => { sync.close(); await close(); };
    }
  },
};
