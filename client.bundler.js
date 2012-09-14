var requirejs = require('requirejs'),
	fs = require('fs');

var r = function(module) {
	var path = require.resolve(module);
	return path.slice(0, -3);
}

var config = {
    baseUrl: '.',
    name: 'client.dependencies',
    out: './build/client.bundle.js',
    paths: {
    	backbone: r('backbone')
    }
};

requirejs.optimize(config, function (buildResponse) {
    //buildResponse is just a text output of the modules
    //included. Load the built file for the contents.
    //Use config.out to get the optimized file contents.
    var contents = fs.readFileSync(config.out, 'utf8');
});