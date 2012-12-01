requirejs.config({
    baseUrl: __dirname,
    nodeRequire: require,   // tell requirejs to use node's 'require()'
});

requirejs([

    'jQuery',
    'underscore',
    'backbone'

    ], function(jQuery, _, Backbone) {

        // don't need to do anything here

    }
);