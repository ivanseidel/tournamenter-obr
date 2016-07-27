/*
	Default view module
*/
var _ = require('lodash');
var path = require('path');

module.exports = {
	type: 'view',

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

	initialize: function(app){
    // app.
	},

	render: function(req, res, next, locals){
		var viewPath = __dirname+'/index';

		var relViewPath = path.relative(path.resolve(__dirname+'/../../views'), viewPath);

		res.render(relViewPath, _.extend(locals, {
			layout: path.join(__dirname, 'layout.ejs'),
		}));
	},
}
