/*
A promise is like a placeholder....

So a function returns a promise, which will then be fulfilled later.

The Q framework let's you wait on promises to be fulfilled before continuing.

Let's say you had an async function:
*/

function doSomethingAsync() {
  setTimeout(function() {
    return 1;
  }, 500);
}

// We'd want to wait for this value before continuing.... something like

doSomethingAsync.then(function(result) { 
	// do something with result of doSomethingAsync
});

// If doSomethingAsync returns a promise instead of a value, we can use Q's .then feature with it.


function doSomethingAsync() {
  var deferred = q.defer();
  setTimeout(function() {
    deferred.resolve('hello world');
  }, 500);

  return deferred.promise;
}

// No we can do:

doSomethingAsync.then(function(result) { 
	// do something with result of doSomethingAsync
});

// Also, let's say you're using some node library.... that uses typical node style callbacks.

fs.readFile = function(filename, callback) { // where callback = function(err, result) { }

};

// You would wrap it like this:

function promisedReadFile = function(filename) {
	var deferred = q.defer();
	fs.readFile(filename, function(err, result) {
		if (err) {
			deferred.reject(new Error(err));
		} else {
			deferred.resolve(result);
		}
	});
	return deferred.promise;
};

// But that's kind of a pain in the ass, so Q has a shortcut call ncall, think "node-call"

function promisedReadFile = function(filename) {
	return Q.ncall(
		fs.readFile // 1st param = function
		this, // 2nd param = the context of the call (i think this rarely matters),
		filename, // n params afterward....  just becomes 'arguments'.
	);
};

// See much easier.

// Q also has tons more shit...
// Like instead of a linear flow of:

somePromiseFn().then().then()...

// You can do stuff in parallel using 'all'

// You can wrap fn's that may be normal fns or may be promises using 'when'

// You can make a normal fn a promise by wrapping it with fcall, think "function-call"

Q.fcall(function() {
	return 10;
});

// Etc. Etc. Etc.


// In summary:

// Q provides ways to control flow of async shit.. i.e. waiting on stuff to finish either in sequence, in parallel, etc.
// But that shit only works on promises... so you gotta wrap all the stuff you're doing to be a promise.
// The end.





