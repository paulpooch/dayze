////////////////////////////////////////////////////////////////////////////////
// 
// STORAGE
//
// https://github.com/teleportd/node-dynamodb/blob/master/lib/ddb.js
//
////////////////////////////////////////////////////////////////////////////////
define([
	'underscore',

	'dynamodb',
	//'aws-sdk',
	'node-uuid',
	'q',
	'memcached',

	'config',
	'utils',
	'logg',
	'email',
	'server_error',
	'c'
], function(
	_,

	DynamoDB,
	//AWS,
	Uuid,
	Q,
	Memcached,

	Config,
	Utils,
	Log,
	Email,
	ServerError,
	C
) {

	var Storage = {};
	var ddb = DynamoDB.ddb(Config.DYNAMODB_CREDENTIALS);
	var Memcached = new Memcached(Config.CACHE_URL);
	// For aws-sdk.  May not switch to this.
	/*
	var dynamoDriver = new AWS.DynamoDB.Client({
		accessKeyId: Config.AWS_ACCESS_KEY_ID,
		secretAccessKey: Config.AWS_SECRET_ACCESS_KEY
	});
	*/

	///////////////////////////////////////////////////////////////////////////
	// Cache
	///////////////////////////////////////////////////////////////////////////
	var Cache = {};

	Memcached.on('issue', function(issue) {
		Log.e('Issue occured on server ' + issue.server + ', ' + issue.retries  + 
		' attempts left untill failure');
	});
	
	Memcached.on('failure', function(issue) {
		Log.e(issue.server + ' failed!');
	});
	
	Memcached.on('reconnecting', function(issue) {
		Log.e('reconnecting to server: ' + issue.server + ' failed!');
	});

	Cache.get = function(key) {
		if (Config.IS_LOCAL_DEV) {
			var deferred = Q.defer();
			deferred.reject(new Error(key + ' was not in cache.'));
			return deferred.promise;
		} else {
			return Q.ncall(
				Memcached.get,
				this,
				key
			);
		}
	};

	Cache.set = function(key, value, lifetime) {
		if (Config.IS_LOCAL_DEV) {
			var deferred = Q.defer();
			// Not setting is ok.
			deferred.resolve(true);
			//deferred.reject(new Error(key + ' could not be saved to cache.'));
			return deferred.promise;
		} else {
			return Q.ncall(
				Memcached.set,
				this,
				key,
				value,
				lifetime
			);
		}
	};

	Cache.delete = function(key) {
		if (Config.IS_LOCAL_DEV) {
			var deferred = Q.defer();
			// Is this really an error?
			// I guess caller shouldn't freak out when this fails, 
			// but we shouldn't fake success.
			deferred.reject(new Error(key + ' could not be deleted from cache.'));
			return deferred.promise;
		} else {
			return Q.ncall(
				Memcached.del,
				this,
				key
			);
		}
	};

	/////////////////////////////////////////////////////////////////////////////
	// PRIMARY FUNCTIONS
	/////////////////////////////////////////////////////////////////////////////

	var _get = function(hashKey, rangeKey) {
		var that = this;
		rangeKey = rangeKey || null;
Log.l('Storage.get');
Log.l('table = ', that.tableName);
Log.l('hashKey = ', hashKey);
Log.l('rangeKey = ', rangeKey);
		
		var deferred = Q.defer();
		var cacheKey = (rangeKey) ? hashKey + rangeKey : hashKey;
		cacheKey = that.cachePrefix + cacheKey;

		Cache.get(cacheKey)
		.then(function(cacheResult) {
Log.l('CACHE HIT');
Log.l(cacheResult);
			deferred.resolve(cacheResult);
		})
		.fail(function(err) {
Log.l('CACHE MISS');
			Q.ncall(
				ddb.getItem,
				that,
				that.tableName,
				hashKey,
				rangeKey,
				{}
			)
			.then(function(dbResult) {
				// Is this correct?
				dbResult = dbResult[0];
				Cache.set(cacheKey, dbResult, that.cacheTimeout)
				.then(function(cacheResult) {
					Log.l(dbResult);
					deferred.resolve(dbResult);
				})
				.end();
			})
			.end();
		})
		.end();

		return deferred.promise;
	};

	var _batchGet = function(keys) {
		var that = this;
		Log.l('Storage.batchGet');
		Log.l('table = ', that.tableName);
		Log.l('keys = ', keys);
		
		var deferred = Q.defer();
		var keysRequiringDbHit = [];
		var results = [];
		
		var checkCache = function(key) {
			var defer2 = Q.defer();

			var cacheKey = that.cachePrefix + key;
			Cache.get(cacheKey)
			.then(function(cacheResult) {
				Log.l('CACHE HIT');
				Log.l(cacheResult);
				results.push(cacheResult);
				defer2.resolve();
			})
			.fail(function(err) {
				Log.l('CACHE MISS');
				keysRequiringDbHit.push(key);
				defer2.resolve();
			})
			.end();

			return defer2.promise;
		};

		var putCache = function(item) {
			var defer3 = Q.defer();
			Cache.set(that.cacheKey(item), item, that.cacheTimeout)
			.then(function(cacheResult) {
				defer3.resolve(true);
			})
			.end();	
			return defer3.promise;
		};

		// http://erickrdch.com/2012/06/how-to-wait-for-2-asynchronous-responses-on-nodejs-commonjs-promises.html
		var queue = [];
		keys.forEach(function(key) {
			queue.push(checkCache(key));
		});
		Q.all(queue)
		.then(function(fulfilled) {

			var batchReq = {};
			batchReq[that.tableName] =  { keys: keysRequiringDbHit };
			Log.l('batchReq', batchReq);

			Q.ncall(
				ddb.batchGetItem,
				that,
				batchReq
			)
			.then(function(dbResult) {
				Log.l('BATCH RESULT');
				Log.l(dbResult);

				var result = dbResult[0].items;
				var queue = [];
				result.forEach(function(item) {
					queue.push(putCache(item));
				});
				Q.all(queue)
				.then(function(fulfilled) {
					Log.l('Done caching all items from batch get.');
					deferred.resolve(result);
				})
				.end();
			})
			.end();
		})
		.end();

		return deferred.promise;
	};

	var _put = function(item) {
		var that = this;
//Log.l('Storage.put');
//Log.l('table = ', that.tableName);
//Log.l('item = ', item);
			
		var deferred = Q.defer();
		cacheKey = item[that.cacheKey];	
				
		Q.ncall(
			ddb.putItem,
			that,
			that.tableName,
			item,
			{}
		)
		.then(function(dbResult) {
			Cache.set(that.cacheKey(item), item, that.cacheTimeout)
			.then(function(cacheResult) {
//Log.l(true);
				deferred.resolve(true);
			})
			.end();	
		})
		.end();

		return deferred.promise;
	};

	var _query = function(hashKey, cacheKey, options) {
		var that = this;
		Log.l('Storage.query');
		Log.l('table = ', that.tableName);
		Log.l('hashKey = ', hashKey);
		Log.l('cacheKey = ', cacheKey);
		Log.l('options = ', options);

		var deferred = Q.defer();

		Cache.get(cacheKey)
		.then(function(cacheResult) {
			Log.l(cacheResult);
			cacheResult = cacheResult.items;
			deferred.resolve(cacheResult);
		})
		.fail(function(err) {
			Q.ncall(
				ddb.query,
				that,
				that.tableName,
				hashKey,
				options
			)
			.then(function(dbResult) {
				// Is this correct?
				dbResult = dbResult[0];
				if (dbResult.count && dbResult.items && dbResult.count > 0) {
					dbResult = dbResult.items;
				} else {
					dbResult = [];
				}
				Cache.set(cacheKey, dbResult, that.cacheTimeout)
				.then(function(cacheResult) {
					Log.l(dbResult);
					deferred.resolve(dbResult);
				})
				.end();
			})
			.end();
		})
		.end();

		return deferred.promise;
	};

	var _batchDelete = function(keys) {
		var that = this;
		Log.l('Storage.batchDelete');
		Log.l('table = ', that.tableName);
		Log.l('deleteRequest = ', deleteRequest);

		var cacheKeys = [];
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			var rangeKey = null;
			var hashKey = null;
			if (typeof key == 'object') { // Array of [hashKey, rangeKey]
				hashKey = key[0];
				rangeKey = key[1];
			} else {
				hashKey = key;
			}
			var cacheKey = (rangeKey) ? hashKey + rangeKey : hashKey;
			cacheKey = that.cachePrefix + cacheKey;
			cacheKeys.push(cacheKey);
		}

		var clearCache = function(key) {
			var defer2 = Q.defer();
			var cacheKey = that.cachePrefix + key;
			Cache.delete(cacheKey)
			.then(function(cacheResult) {
				defer2.resolve();
			})
			.fail(function(err) {
				defer2.resolve(); // We don't really care if this fails.
			})
			.end();
			return defer2.promise;
		};

		var queue = [];
		keys.forEach(function(key) {
			queue.push(clearCache(key));
		});
		Q.all(queue)
		.then(function(fulfilled) {
			var deferred = Q.defer();
			/*
			batchWriteItem = function(putRequest, deleteRequest, cb) {
			Put or delete several items across multiple tables
			@param putRequest dictionnary { 'table': [item1, item2, item3], 'table2': item }
			@param deleteRequest dictionnary { 'table': [key1, key2, key3], 'table2': [[id1, range1], [id2, range2]] }
			@param cb callback(err, res, cap) err is set if an error occured
			*/
			var deleteRequest = {};
			deleteRequest[that.tableName] = keys;
			Q.ncall(
				ddb.batchWriteItem,
				that,
				{}, // putRequest
				deleteRequest
			)
			.then(function(dbResult) {
				Log.l('BATCH RESULT');
				Log.l(dbResult);
				deferred.resolve(dbResult);
			})
			.end();
		})
		.fail(function(err) {
			deferred.reject(err);
		})
		.end();

		return deferred.promise;
	};

	///////////////////////////////////////////////////////////////////////////
	// TABLES
	//
	// cacheKey used to cache items on Storage.put.
	// Storage.get and others will require cacheKey to be specified.
	// Be careful this matches how it is set with put!
	///////////////////////////////////////////////////////////////////////////
	
	EVENTS_BY_USERID_AND_TIME = {
		tableName: 'DAYZE_EVENTS_BY_USERID_AND_TIME',
		cachePrefix: '01_',
		cacheTimeout: 3600,
		cacheKey: function(item) {
			return this.cachePrefix + item.userId + item.eventTime;
		},
		put: _put,
		get: _get,
		query: function(userId, monthCode, options) {
			var hashKey = userId;
			var cacheKey = this.cachePrefix + userId + monthCode;
			// Make sure this object is the context.
			return _query.call(this, hashKey, cacheKey, options);
		}
	};

	EVENTS = {
		tableName: 'DAYZE_EVENTS',
		cachePrefix: '02_',
		cacheTimeout: 3600,
		cacheKey: function(item) {
			return this.cachePrefix + item.eventId;
		},			
		put: _put,
		get: _get,
		batchGet: _batchGet
	};

	USERS = {
		tableName: 'DAYZE_USERS',
		cachePrefix: '03_',
		cacheTimeout: 3600,
		cacheKey: function(item) {
			return this.cachePrefix +  item.userId;
		},
		put: _put,
		get: _get
	};

	USERS_BY_COOKIE = {
		tableName: 'DAYZE_USERS_BY_COOKIE',
		cachePrefix: '04_',
		cacheTimeout: 3600,
		cacheKey: function(item) {
			return this.cachePrefix + item.cookieId;
		},
		put: _put,
		get: _get
	};

	USERS_BY_EMAIL = {
		tableName: 'DAYZE_USERS_BY_EMAIL',
		cachePrefix: '05_',
		cacheTimeout: 3600,
		cacheKey: function(item) {
			return this.cachePrefix + item.email;
		},
		put: _put,
		get: _get
	}
		
	CUSTOM_LINKS = {
		tableName: 'DAYZE_CUSTOM_LINKS',
		cachePrefix: '06_',
		cacheTimeout: 3600,
		cacheKey: function(item) {
			return this.cachePrefix + item.linkId;
		},
		put: _put,
		get: _get
	};

	///////////////////////////////////////////////////////////////////////////
	// Events
	///////////////////////////////////////////////////////////////////////////

	// REDO THIS SECTION !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	// REDO THIS SECTION !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	// REDO THIS SECTION !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	// REDO THIS SECTION !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	// REDO THIS SECTION !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	Storage.Events = (function() {

		var Events = {};

		Events.createEvent = function(user, post) {
			var deferred = Q.defer();

			var eventId = Uuid.v4();
			var eventTime = Utils.makeISOWithDayAndTime(post.dayCode, post.beginTime);

			var event = {
				eventId: eventId,
				eventTime: eventTime,
				name: post.name,
				dayCode: post.dayCode,
				description: post.description,
				location: post.location,
				beginTime: post.beginTime,
				endTime: post.endTime
			};

			EVENTS_BY_USERID_AND_TIME.get(user.userId, eventTime)
			.then(function(eventsByUserIdAndTime) {

				var eventArr = [];
				if (eventsByUserIdAndTime) {
					var existingEvents = eventsByUserIdAndTime.events;
					if (existingEvents) {
						eventArr.push(existingEvents);
					}
				}
				eventArr.push(event.eventId);

				var eventsEntry = {
					userId: user.userId,
					eventTime: eventTime,
					events: eventArr
				};

				EVENTS_BY_USERID_AND_TIME.put(eventsEntry)
				.then(function(result) {
					EVENTS.put(event)
					.then(function(result) {
						deferred.resolve(true);
					});

				});

			})	
			.fail(function(err) {
				deferred.reject(new ServerError(err));
			})
			.end();

			return deferred.promise;

		};

		// BEGIN HERE... HOW DO WE QUERY CORRECTLY?
		Events.getEventsForMonth = function(user, monthCode) {
			var deferred = Q.defer();

			var eventTimeRange = Utils.makeMonthRange(monthCode);

			var options = {
				RangeKeyCondition: {
					ComparisonOperator: 'BETWEEN',
					AttributeValueList: [
						eventTimeRange.begin,
						eventTimeRange.end
					]
				}
			};

			var eventIds = [];
			EVENTS_BY_USERID_AND_TIME.query(user.userId, monthCode, options)
			.then(function(eventsByTime) {
				if (eventsByTime.length) {
					eventsByTime.forEach(function(eventsAtTime) {
						// Less than optimal.
						eventIds = eventIds.concat(eventsAtTime.events);
					});
					if (eventIds.length) {
						return EVENTS.batchGet(eventIds)
						.then(function(events) {
							deferred.resolve(events);
						});
					} else {
						deferred.resolve([]);
					}	
				} else {
					deferred.resolve([]);
				}
			})
			.end();

			return deferred.promise;
		};

		return Events;

	})();

	///////////////////////////////////////////////////////////////////////////
	// Users
	///////////////////////////////////////////////////////////////////////////
	Storage.Users = (function() {
	
		var Users = {};
		
		Users.updateWithEmail = function(user) {
			var deferred = Q.defer();

			var emailIndex = { 
				email: user.email, 
				userId: user.userId 
			};

			USERS.put(user)
			.then(function(userPutResult) {
				return USERS_BY_EMAIL.put(emailIndex);
			})
			.then(function(userByEmailPutResult) {
				deferred.resolve(userByEmailPutResult);
			})
			.fail(function(err) {
				deferred.reject(new ServerError(err));
			})
			.end();

			return deferred.promise;
		};

		Users.setNewEmail = function(user) {
			var deferred = Q.defer();

			Storage.Users.getUserWithEmail(user.unconfirmedEmail)
			.then(function(userWithEmail) {
				if (userWithEmail) {
					
					deferred.reject(new ServerError(C.ErrorCodes.AccountEmailTaken));

				} else {
				
					return Storage.CustomLinks.makeEmailConfirmationLink(user)
					.then(function(link) {
						return Email.sendEmailConfirmation(user, link);
					})
					.then(function(result) {
						deferred.resolve(result);
					});
				
				}
			})
			.fail(function(err) {
				deferred.reject(new ServerError(err));
			})
			.end();

			return deferred.promise;
		};

		// Save user.
		// Save cookie.
		// Returns user.
		Users.setCookie = function(user, cookieId) {
			var deferred = Q.defer();
			
			if (!cookieId) {
				cookieId = Utils.generatePassword(20, 2);
			}

			var cookieIndex = {
				cookieId: cookieId,
				userId: user.userId,
				createTime: Utils.getNowIso()
			};

			USERS.put(user)
			.then(function(userPutResult) {
				return USERS_BY_COOKIE.put(cookieIndex);
			})
			.then(function(userByCookiePutResult) {
				deferred.resolve(user);
			})
			.fail(function(err) {
				deferred.reject(new ServerError(err));
			})
			.end();

			return deferred.promise;
		};

		Users.deleteAllCookies = function(user) {



		};

		// Returns user.
		Users.createTempUser = function() {
			var cookieId = Utils.generatePassword(20, 2);
			var userId = Uuid.v4();

			// Minimalist version.
			// Real entry made if user decides to create account.
			var user = { 
				userId: userId,
				cookieId: cookieId,
				isFullUser: 0,
				createTime: Utils.getNowIso()
			};

			return Users.setCookie(user, cookieId);
		};

		Users.getUserWithCookieId = function(cookieId) {
			var deferred = Q.defer();

			USERS_BY_COOKIE.get(cookieId)
			.then(function(cookieIndex) {
				return USERS.get(cookieIndex.userId)
				.then(function(user) {
					deferred.resolve(user);
				});
			})
			.end();

			return deferred.promise;
		};

		Users.getUserWithEmail = function(email) {
			var deferred = Q.defer();

			USERS_BY_EMAIL.get(email)
			.then(function(emailIndex) {
				USERS.get(emailIndex.userId)
				.then(function(user) {
					deferred.resolve(user);
				})
				.fail(function(err) {
					deferred.reject(new ServerError(err));
				})
				.end();
			})
			.fail(function(err) {
				// No account with that email.
				deferred.resolve(null);
			})
			.end();

			return deferred.promise;
		};

		Users.createAccount = function(user, post) {
			var deferred = Q.defer();
			// Nobody will ever know this password.
			// It will just get reset once user creates their own via verify email link.
			var unconfirmedEmail = post['unconfirmedEmail'];
			//var password = Utils.generatePassword();
			//var salt = Utils.generatePassword(16);
			//var pwHash = Utils.hashSha512(password + salt);
			var displayName = unconfirmedEmail.split('@')[0];

			var account = {
				userId: user.userId,
				cookieId: user.cookieId,
				isFullUser: user.isFullUser,
				createTime: user.createTime,
				//passwordHash: pwHash,
				//passwordSalt: salt,
				missingPassword: 1,
				unconfirmedEmail: unconfirmedEmail,
				displayName: displayName,
				googleToken: user.googleToken || 0,
				facebookToken: user.facebookToken || 0,
				lastActivityTime: Utils.getNowIso()
			};

			var emailIndex = {
				email: account.unconfirmedEmail,
				userId: account.userId
			};

			USERS.put(account)
			// This gets called by AccountRest createAccount code.
			// .then(function(result) {
			// 	return USERS_BY_EMAIL.put(emailIndex);
			// })
			.then(function(result) {
				deferred.resolve(account);
			})
			.fail(function(err) {
				deferred.reject(new ServerError(err));
			})
			.end();

			return deferred.promise;
		};

		Users.update = function(user) {
			var deferred = Q.defer();

			USERS.put(user)
			.then(function(result) {
				deferred.resolve(user);
			})
			.fail(function(err) {
				deferred.reject(new ServerError(err));
			})
			.end();

			return deferred.promise;
		};

		return Users;

	})();

	///////////////////////////////////////////////////////////////////////////
	// Custom Links
	///////////////////////////////////////////////////////////////////////////
	Storage.CustomLinks = (function() {

		var CustomLinks = {};

		CustomLinks.getLink = function(user, linkId) {
			var deferred = Q.defer();

			CUSTOM_LINKS.get(linkId)
			.then(function(link) {
				var needsToBeMarkedUsed = false;
				if (link.userId && link.userId != user.userId) {
					deferred.reject(new ServerError(C.ErrorCodes.LinkNotForUser));
				}
				if (link.isSingleUse) {
					needsToBeMarkedUsed = true;
					if (link.used) {
						deferred.reject(new ServerError(C.ErrorCodes.LinkUsed));
					}
				}
				if (link.expiration) {
					var now = new Date();
					var expiration = new Date(link.expiration);
					if (now > expiration) {
						deferred.reject(new ServerError(C.ErrorCodes.LinkExpired));
					}
				}
				if (needsToBeMarkedUsed) {
link.used = 0;
//link.used = 1;
					CUSTOM_LINKS.put(link)
					.then(function(result) {
						deferred.resolve(link);
					});

				} else {
					deferred.resolve(link);
				}
			})
			.fail(function(err) {
				deferred.reject(new ServerError(err));
			})
			.end();

			return deferred.promise;
		};

		CustomLinks.makeEmailConfirmationLink = function(user) {
			var deferred = Q.defer();

			var expiration = new Date();
			expiration.setDate(expiration.getDate() + Config.LINK_EXPIRATION_EMAIL_CONFIRMATION);
			expiration = expiration.toISOString();
			var link = {
				linkId: Utils.generateCustomLink(),
				type: Config.LINK_TYPE_EMAIL_CONFIRMATION,
				isSingleUse: 1,
				createTime: Utils.getNowIso(),
				expiration: expiration,
				used: 0,
				userId: user.userId,
				pendingEmail: user.unconfirmedEmail
			};

			CUSTOM_LINKS.put(link)
			.then(function(result) {
				deferred.resolve(link);
			})
			.fail(function(err) {
				deferred.reject(new ServerError(err));
			})
			.end();

			return deferred.promise;
		};		

		return CustomLinks;
	})();

	return Storage;

});

		/*
		// Users.resetTable ///////////////////////////////////////////////////
		Users.resetTables = function() {

			// This is dumb.  Don't do this.  Just a dev utility function.
			Config.TABLE_USERS = 'DAYZE_USERS';
			Config.TABLE_USERS_BY_COOKIE = 'DAYZE_USERS_BY_COOKIE';

			var createUsersTable = function() {
				return Q.ncall(
					ddb.createTable,
					this,
					Config.TABLE_USERS,
					{
						hash: ['userId', ddb.schemaTypes().string]
					},
					{
						read: Config.DYNAMO_DEFAULT_READ_PER_SEC, 
						write: Config.DYNAMO_DEFAULT_WRITE_PER_SEC
					}
				);
			};

			var removeUsersTable = function() {
				return Q.ncall(
					ddb.deleteTable,
					this,
					Config.TABLE_USERS
				);
			};

			var createUsersByCookieTable = function() {
				return Q.ncall(
					ddb.createTable,
					this,
					Config.TABLE_USERS_BY_COOKIE, 
					{
						hash: ['cookieId', ddb.schemaTypes().string]
					},
					{
						read: Config.DYNAMO_DEFAULT_READ_PER_SEC, 
						write: Config.DYNAMO_DEFAULT_WRITE_PER_SEC
					}
				);
			};

			var removeUsersByCookieTable = function() {
				return Q.ncall(
					ddb.deleteTable,
					this,
					Config.TABLE_USERS_BY_COOKIE
				);
			};

			
			removeUsersTable()
			.then(function(res) {
				Log.l('Users table removed.');
				Log.l(res);
			})
			.delay(60000)

			.then(createUsersTable)
			.then(function(res) {
				Log.l('Users table created.');
				Log.l(res);
			})
			.delay(10000)
			
			.then(removeUsersByCookieTable)
			.then(function(res) {
				Log.l('UsersByCookie table removed.');
				Log.l(res);
			})
			.delay(60000)
			
			.then(createUsersByCookieTable)
			.then(function(res) {
				Log.l('UsersByCookie table created.');
				Log.l(res);
			})

			.fail(function(err) {
				Log.e('Error.', err, err.stack);
			})
			.end();

			
		};
		*/