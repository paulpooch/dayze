'use strict';

var requirejs = require('requirejs');

requirejs.config({
	baseUrl: __dirname,
	nodeRequire: require,
});

requirejs(['express', 'consolidate', 'underscore', 'backbone'], function(express, consolidate, _, Backbone) {

	var App = Backbone.Model.extend({

		defaults: {
			port: 3000
		},

		initialize: function() {
			var that = this;
			this.app = express();
			this.app.engine('dust', consolidate.dust);
			this.app.configure(function() {
			    that.app.set('view engine', 'dust');
			    that.app.set('views', __dirname + '/views');
			    that.app.use(express.static(__dirname + '/public', { redirect: false })); /*TODO: <-- wtf? */
			    that.app.use(express.bodyParser()); /*TODO: <-- wtf? */
			 });
			var numClients = 0;
			this.app.get('/', function(req, res) {
				res.render('index', { numClients: ++numClients });
			});
			this.app.listen(this.get('port'));
			console.log('Listening on port ' + this.get('port'));
		}

	});

	new App();

});