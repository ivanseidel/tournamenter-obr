/*
  Default view module
*/
var _ = require('lodash');
var path = require('path');
var SyncModule = require('./SyncModule')
var auth = app.helpers.isAuthenticated

module.exports = {
  type: ['menu'],

  getAssets: function (app){
    return {
      css: [],

      js: [],

      jst: [],

      serve: [
        `${__dirname}/public`,
      ]
    }
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
          path: '/obr-desafio',
          name: 'Desafio Surpresa',
        },
        {
          path: '/obr-config',
          name: 'Configurar (Importar/Exportar)',
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
    SyncModule.statusMenu
    // {name: 'Pontuador', path: '/tournamenter-obr', order: 6},
    // {name: 'Importador Sistema Olimpo', path: '/tournamenter-obr/importar.html', order: 7},
  ],

  initialize: function(app){
    // Get 'Table' model from App
    var tournamenterRoot = app.config.root;
    var tableModelPath = path.join(tournamenterRoot, './models/Table');
    var TableModel = require(tableModelPath)
    
    // Inject OBR Scoring systems
    TableModel.evaluateMethods.obr2017 = require('./sorters/obr2017');

    // Set 'obr2017' as default sorting algorithm
    TableModel.attributes.evaluateMethod.defaultsTo = 'obr2017';
    
    // Set columns count to 6 as default, with names
    TableModel.attributes.columns.defaultsTo = 6;
    TableModel.attributes.headerScore.defaultsTo = 
     'Round 1, Tempo 1, Round 2, Tempo 2, Round 3, Tempo 3';

    // Set default to Portugese on columns
    TableModel.attributes.headerTeam.defaultsTo = 'Equipe';

    // Update Default Tournamenter Logo
    app.config.appLogo = path.join(__dirname, '/public/tournamenter-obr/obr.png')

    // Add views path to view engine
    var viewsFolder = path.join(__dirname, '/public/tournamenter-obr')
    var views = app.server.get('views').push(viewsFolder)

    // Add route to change configs/get
    app.server.all('/obr-sync',       auth, SyncModule.updateConfig)
    app.server.all('/obr-last-sync',  auth, SyncModule.getLastSync)

    // Render Configuration screen
    app.server.get('/obr-config',     auth, function (req, res) {
      return res.render('obr-config', { path: req.route.path });
    })

    // Render desafio screen
    app.server.get('/obr-desafio',    auth, function (req, res) {
      return res.render('obr-desafio', { path: req.route.path });
    })

    // Render Gerador de rounds screen
    app.server.get('/obr-rounds',    auth, function (req, res) {
      return res.render('obr-rounds', { path: req.route.path });
    })

    // Set home screen to show a big huge button to guide judges
    app.server.get('/',     auth, function (req, res) {
      return res.render('obr-home', { path: req.route.path });
    })

    // Init SyncModule
    SyncModule.init(app)
  },

  render: function(req, res, next, locals){
    var viewPath = __dirname+'/index';

    var relViewPath = path.relative(path.resolve(__dirname+'/../../views'), viewPath);

    res.render(relViewPath, _.extend(locals, {
      layout: path.join(__dirname, 'layout.ejs'),
    }));
  },
}
