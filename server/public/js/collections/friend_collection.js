///////////////////////////////////////////////////////////////////////////////
// FRIEND COLLECTION
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'underscore',
	'backbone',

	'models/friend_model'
], function(
	jQuery,
	_,
	Backbone,
	
	FriendModel
) {

	var that,
		_app,
		_appModel,
		_autoSuggestTrie;

	var FriendCollection = Backbone.Collection.extend({
	
		model: FriendModel,
		url: '/rest/friend',

/*
		test: function() {
			var s = 'abcdefg';
			_autoSuggestTrie.add(s, 'someVal');
log(_autoSuggestTrie);
		},
*/

		// EVENTS /////////////////////////////////////////////////////////////
		onAdd: function(friendModel) {
			
		},

		onChange: function() {

		},

		onReset: function() {

		},

		///////////////////////////////////////////////////////////////////////

		initialize: function() {
			_.bindAll(this);
			that = this;

			// BINDINGS
			_eventsByDay = {};
			that.on('add', that.onAdd);
			that.on('change', that.onChange);
			that.on('reset', that.onReset);
		}

	});

	return FriendCollection;

});