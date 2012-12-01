var requirejs = require('requirejs');

requirejs.config({
    baseUrl: __dirname,
    nodeRequire: require,   // tell requirejs to use node's 'require()'
});

var optimizeConfig = {
    baseUrl: '.',
    name: 'client.dependencies',
    out: './client.bundle.js'
};

requirejs.optimize(optimizeConfig, function (buildResponse) {
    //buildResponse is just a text output of the modules
    //included. Load the built file for the contents.
    //Use config.out to get the optimized file contents.
    var contents = fs.readFileSync(optimizeConfig.out, 'utf8');
});