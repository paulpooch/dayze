define([
	'underscore',
	'c',
	'collections/friend_collection',
	'text!templates/auto_suggest_item_template.html',
], function(
	_,
	C,
	FriendCollection,
	AutoSuggestItemTemplate
) {

	var Trie = function() {
		this.root = new TrieNode(null);
	};

	var TrieNode = function(char) {
		this.char = char;
		this.children = {};
		this.items = [];
	};

	Trie.prototype.add = function(key, val) {
		var len = key.length;
		var currNode = this.root;
		if (len > 0) {

			for (var i = 0; i < len; i++) {
				var char = key[i];
				var nextNode = currNode.children[char];
				if (!nextNode) {
					nextNode = new TrieNode(char);
				}
				if (i == len - 1) {
					nextNode.items.push(val);
				}
				currNode.children[char] = nextNode;
				currNode = nextNode;
			}

		} else {
			currNode.items.push(val);
		}
	};

	// Strict for now.  Maybe find techniques to be more forgiving later.
	Trie.prototype.search = function(term) {
		var len = term.length;
		var currNode = this.root;
		var results = [];
		for (var i = 0; i < len; i++) {
			var char = term[i];
			var nextNode = currNode.children[char];
			if (nextNode) {
				if (i == len - 1) {
					results.push(nextNode.items);
					
					var stack = [];
					stack.push(nextNode);
					while (stack.length) {
						var currNode = stack.pop();
						stack = stack.concat(currNode.children);
						results.push(currNode.items);
					}

					break;
				} else {
					currNode = nextNode;
				}
			} else {
				break;
			}
		}
		return results;
	};

	var AutoSuggest = function(collection, type) {
		_.bindAll(this);
		this.trie = new Trie();
		this.resultSet = [];
		this.selectedIndex;
		this.newItemHtml;
		this.itemTemplate = _.template(AutoSuggestItemTemplate);
		this.$inputText;
		this.$resultsBox;

		if (type == 'friend') {

			var onCollectionAdd = function(friendModel) {
				var email = friendModel.get('email');
				var displayName = friendModel.get('displayName');
				this.trie.add(email, friendModel);
				this.trie.add(displayName, friendModel);
				var spaceChunks = displayName.split(' ');
				var dotChunks = displayName.split('.');
				var useChunks = spaceChunks;
				if (dotChunks.length > spaceChunks) {
					useChunks = dotChunks;
				}
				if (useChunks.length > 1) {
					var lastName = useChunks[1];
					this.trie.add(lastName, friendModel); 
				}
			};

			this.newItemHtml = function(term) {
				return html = [
					'<div class="auto_suggest_item">',
					'	<div class="row-fluid"><strong>New Friend</strong></div>',
					'	<div class="row-fluid">', term, '</div>',
					'</div>'
				].join('');
			};

		}

		collection.on('add', onCollectionAdd);
	};

	AutoSuggest.prototype.updateEls = function(els) {log('els', els);
		this.$inputText = els.inputText;
		this.$resultsBox = els.resultsBox;
		this.$inputText.on('keyup', this.onTextChange);
	};

	AutoSuggest.prototype.search = function(term) {
		return this.trie.search(term);
	};

	AutoSuggest.prototype.onTextChange = function(e) {
		var code = e.which;
		if (code == C.KEY_ENTER) {
			this.onEnter();
		} else {
log('this', this);
			var term = $(e.target).val();
			this.$resultsBox.empty();

			var html = this.newItemHtml(term);
			this.$resultsBox.append(html);
			this.resultSet = [ term ];

			var matches = this.search(term);
log('matches', matches);
			for (var i = 0; i < matches.length; i++) {
				var html = this.itemTemplate(matches[i]);
				this.$resultsBox.append(html);
			}
			this.resultSet = this.resultSet.concat(matches);
			this.select(0);

		}
	};

	AutoSuggest.prototype.select = function(index) {
		this.selectedIndex = index;
		this.$resultsBox.find('.highlight').removeClass('highlight');
		this.$resultsBox.children().eq(this.selectedIndex).addClass('highlight');
	};

	AutoSuggest.prototype.onEnter = function() {
		//that.model.addToInvited(val);
	};

	return AutoSuggest;

});