/*
  Default view module
*/
var _ = require('lodash');
var path = require('path');

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
    {name: 'Pontuador', path: '/tournamenter-obr', order: 6},
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
     'Round 1, Tempo 1, Round 2, Tempo 3, Round 3, Tempo 3';

    // Set default to Portugese on columns
    TableModel.attributes.headerTeam.defaultsTo = 'Equipe';

    // Update Default Tournamenter Logo
    app.config.appLogo = path.join(__dirname, 'obr.png')
  },

  render: function(req, res, next, locals){
    var viewPath = __dirname+'/index';

    var relViewPath = path.relative(path.resolve(__dirname+'/../../views'), viewPath);

    res.render(relViewPath, _.extend(locals, {
      layout: path.join(__dirname, 'layout.ejs'),
    }));
  },
}
