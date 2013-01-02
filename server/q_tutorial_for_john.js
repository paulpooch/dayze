	// Q for idiots like me: https://github.com/kriskowal/q
	// I'm using you're decent at js/node and just lost by the lack of proper Q docs.
	// IMPORTANT, This uses Q version 0.9.0 which had .end();
	// In Q version 1.0.0 .end() is now called .done();  Some thing tho.

	var runQTutorial = function() {

		// Let's say we have some assorted js functions.

		// Here's a normal synchronous function.
		var incrementSync = function(someVal) {
		return ++someVal;
		};

		// Here's an async function.
		// When it's done working it calls the callback.
		// The callback is of the form callback = function(error, returnVal) { ... }
		var incrementAsync = function(someVal, callback) {

		setTimeout(function() {
			callback(null, ++someVal); // Hooray success!
		}, 2000);

		};

		// Here's the same thing but this one fails.
		var incrementAsyncFail = function(someVal, callback) {

		setTimeout(function() {
			callback(
				// Oh noes!, 'error' in the callback is not null, but an actual Error object.
				new Error('incrementAsyncFail failed with someVal = ' + someVal) 
			);
		}, 2000);

		};

		// Now we want to use all these functions in nice sequential looking code.
		// We don't want a callback pyramid of doom like this:
		/*
		step1(function (value1) {
		step2(value1, function(value2) {
		    step3(value2, function(value3) {
		        step4(value3, function(value4) {
		            // Do something with value4
		        });
		    });
		});
		});

		That's ugly right?

		We want to do this:
		step1()
		.then(step2)
		.then(step3)
		.then(step4)
		.done();

		Well the best way is to make the functions return PROMISES.
		A function that returns a PROMISE is sometimes called a THENABLE
		Because when it returns a returns a PROMISE, we can use Q's .then() flow control on it.

		It would look something like:

		someThenable() // where someThenable returns a promise.
		.then(doMoreStuff);

		Ok so how do we do this?  There's a ton of ways but here's some simple ones.

		*/

		// Q.fcall makes synchronous functions thenable.
		var qIncrementSync = function(someVal) {
		return Q.fcall(incrementSync, someVal);
		};		

		// Q.ncall makes asynchronous functions thenable.
		// Well it actually is a wrapper for functions that use the common node callback form of
		// var someNodeStyleFunction = function(params, callback) { } 
		//	where callback is function(error, returnVal);
		// Like for example node's fs.readFile function.
		// fs.readFile('/doesnt/exist', 'utf8', function (err,data) {
		// That's what I'd call a 'node-style' function
		// So just think Q.ncall wraps node style. 
		// Q.fcall wraps normal function style.

		// Again, Q.ncall makes aschronous functions thenable.
		var qIncrementAsync = function(someVal) {
		return Q.ncall(incrementAsync, this, someVal);
		// The 'this' is the context to be used inside the incrementAsync function call.
		// It usually doesn't matter but I'm not going into a context tutorial.  Google it.
		};

		var qIncrementAsyncFail = function(someVal) {
		return Q.ncall(incrementAsyncFail, this, someVal);
		};

		// And for more complicated functions we can use Q.defer();

		var qFoo = function(someVal) {
		// deferred gives us a 'promise'.
		var deferred = Q.defer();

		var doMoreWork = function(someVal) {
			// Maybe we do more stuff in here.
			// Take as long as we want.

			// When we're done resolve the promise.
			deferred.resolve(someVal); // When it's done resolve the promise.
		};

		setTimeout(function() {
			someVal++;
			doMoreWork(someVal);
		}, 2000);

		// The promise gets returned right away.
		// Q will sit on it and wait for the promise to either be resolved or rejected.
		// Once that happens the next .then() step will be called 
		//	using the result passing in resolve() or reject().
		return deferred.promise;
		};

		// When using defer(). deferred.reject() is the way to return errors.

		var qFooFail = function(someVal) {
		var deferred = Q.defer();

		setTimeout(function() {
			someVal++;
			deferred.reject(new Error('qFooFail had an error'));
		}, 2000);

		return deferred.promise;
		};	

		var startingNum = 0;

		// Now we can use .then()
		qIncrementSync(startingNum)
		.then(qIncrementAsync) // This will call qIncrementAsync with the result of qIncrementSync.
		.then(qFoo) // This will call qFoo with the result of qIncrementAsync.
		.then(function(resultOfQFoo) {
		Log.l('This should be 3');
		Log.l(resultOfQFoo);
		})
		.end();


		// If you need to mess around with the return value of qIncrementSync before passing it to
		//	qIncrementAsync, feel free to do something like this:
		qIncrementSync(startingNum)
		.then(function(resultOfqIncrementSync) {

		var big = resultOfqIncrementSync * 10;
		// We gotta return another promise here.
		return qIncrementAsync(big);

		})
		.then(function(resultOfqIncrementAsync) {
		Log.l('This should be 11');
		Log.l(resultOfqIncrementAsync);
		})
		.end();

		// What NOT to do.
		qIncrementSync(startingNum)
		.then(function(resultOfqIncrementSync) {

		var big = resultOfqIncrementSync * 10;
		// This is missing the 'return' keyword.
		// If we don't return a promise here, it just calls this async function and the 
		//	.then() below is called immediately.
		// Because really it just triggers this function and then returns.
		// Whereas the correct version above returns a promise for .then() to wait for.
		qIncrementAsync(big); 

		})
		.then(function(resultOfqIncrementAsync) {
		// So now this is undefined.
		Log.l('This will be undefined since this THEN was called without waiting for qIncrementAsync to finish');
		Log.l(resultOfqIncrementAsync);
		})
		.end();

		// And we can catch errors using .fail()
		qIncrementAsyncFail(startingNum)
		.then(function(result) {
		Log.l('this worked');
		})
		.fail(function(err) {
		Log.l('this failed');
		Log.l(err);
		})
		.end();

		/* 
		And now... a quick lession called: WTF DOES .end() DO? 
		note: .end() = .done() in latest version of Q

		Very simply .end() stops errors from bubbling out beyond the code code block.
		*/

		var startingVal = 10;

		// What not to do.
		qFoo(startingVal)
		.then(function(resultOfQFoo) {

		return qFooFail()
		.then(function(resultOfQFooFail) {
			Log.l('This will never get called');
		})
		.end(); // If we put .end() here, the error from qFooFail can't bubble 
		//			out and is never caught by the below .fail() block.
		// Instead it just crashes node as an uncaught exception.
		// If we use .end() here there should be a .fail() block before it dealing with the error.

		})
		.fail(function(err) {
		Log.l('Failure caught in outer block');
		Log.l(err);
		})
		.end();


		// Proper way:
		qFoo(startingVal)
		.then(function(resultOfQFoo) {

		return qFooFail()
		.then(function(resultOfQFooFail) {
			Log.l('This will never get called');
		}); // Leave out .end() so the error falls through to the .fail() below.

		})
		.fail(function(err) {
		Log.l('Failure caught in outer block');
		Log.l(err);
		})
		.end();

		/* As a general rule of thumb

		.end() should always follow a .fail()

		If we want it to handle the error:

		qFoo()
		.then(function(result) {

		})
		.fail(function(err) {
		// handle err
		})
		.end();

		If we want to just let the error bubble out:

		qFoo()
		.then(function(result) {

		});

		The only time to use .end() without .fail() is if you WANT the error to
		crash and explode everything.
		(Principle of 'Fail Loudly').
		*/

	};






















	

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





