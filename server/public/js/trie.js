define([], function() {

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

	return Trie;

});
	

	