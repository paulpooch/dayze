///////////////////////////////////////////////////////////////////////////////
// USER MODEL
///////////////////////////////////////////////////////////////////////////////
define(['jquery', 'underscore', 'backbone'], function(jQuery, _, Backbone) {

	var UserModel = Backbone.Model.extend({
		       
	    initialize: function (spec) {
	        
	        if (!spec || !spec.displayName) {
	            throw "InvalidConstructArgs";
	        }

	        // we may also want to store something else as an attribute
	        // for example a unique ID we can use in the HTML to identify this
	        // item's element. We can use the models 'cid' or 'client id for this'.
	        this.set({
	            htmlId: 'user_' + this.cid
	        })
	    },
	   
	    validate: function (attrs) {
	        if (attrs.displayName) {
	            if (!_.isString(attrs.displayName) || attrs.displayName.length === 0) {
	                return "displayName must be a string with a length";
	            }
	        }
	    },

	    login: function() {

	    },

	    logout: function() {

	    }

	});

	return UserModel;

});