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

	Cache.remove = function(key) {
		if (Config.IS_LOCAL_DEV) {
			var deferred = Q.defer();
			deferred.resolve(true);
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

	var makeCacheKeysFromDbKeys = function(cachePrefix, keys) {
		var cacheKeys = [];
		keys.forEach(function(key, index) {
			var rangeKey = null;
			var hashKey = null;
			if (typeof key == 'object') { // Array of [hashKey, rangeKey]
				hashKey = key[0];
				rangeKey = key[1];
			} else {
				hashKey = key;
			}
			var cacheKey = (rangeKey) ? hashKey + rangeKey : hashKey;
			cacheKey = cachePrefix + cacheKey;
			cacheKeys.push(cacheKey);
		});
		return cacheKeys;
	};

	var makeCacheKeyFromDbKey = function(cachePrefix, hashKey, rangeKey) {
		if (typeof hashKey == 'object') { // Array of [hashKey, rangeKey]
			var hKey = hashKey[0];
			var rKey = null;
			if (hashKey.length > 0) {
				rKey = hashKey[1];
			}
			var cacheKey = (rKey) ? hKey + rKey : hKey;
			cacheKey = cachePrefix + cacheKey;
			return cacheKey;
		} else {
			var cacheKey = (rangeKey) ? hashKey + rangeKey : hashKey;
			cacheKey = cachePrefix + cacheKey;
			return cacheKey;
		}
	};
	
	var _get = function(hashKey, rangeKey) {
		var that = this;
		rangeKey = rangeKey || null;

Log.l('Storage.get');
Log.l('table = ', that.tableName);
Log.l('hashKey = ', hashKey);
Log.l('rangeKey = ', rangeKey);
		
		var cacheKey = makeCacheKeyFromDbKey(that.cachePrefix, hashKey, rangeKey);

		return Cache.get(cacheKey)
		.then(function(cacheResult) {
Log.l('CACHE HIT');
Log.l(cacheResult);
			return cacheResult;
		})
		.fail(function(err) {
Log.l('CACHE MISS');
			return Q.ncall(
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
				
				return Cache.set(cacheKey, dbResult, that.cacheTimeout)
				.then(function(cacheResult) {
Log.l(dbResult);
					return dbResult;
		
				});
			
			});
		});

	};

	// COMPLETELY UNTESTED :)
	var _batchGet = function(keys) {
		var that = this;
		var deferred = Q.defer();

Log.l('Storage.batchGet');
Log.l('table = ', that.tableName);
Log.l('keys = ', keys);
		
		var keysRequiringDbHit = [];
		var results = [];
		var remainingKeys;
		
		var checkCache = function(key) {
			var cacheKey = makeCacheKeyFromDbKey(that.cachePrefix, key);

			return Cache.get(cacheKey)
			.then(function(cacheResult) {
Log.l('CACHE HIT');
Log.l(cacheResult);
				// CACHE RESULTS
				results.push(cacheResult);
				return;

			})
			.fail(function(err) {
Log.l('CACHE MISS');
				keysRequiringDbHit.push(key);
				return;
			})
			.end();
		};

		var putCache = function(item) {
			return Cache.set(that.cacheKey(item), item, that.cacheTimeout)
			.then(function(cacheResult) {
				return true;
			});
		};

		var dbGet = function(keys) {
			var batchReq = {};
			batchReq[that.tableName] =  { keys: keys };
Log.l('batchReq', batchReq);
			return Q.ncall(
				ddb.batchGetItem,
				that,
				batchReq
			);
		};

		var dbGetInBatches = function() {
			if (remainingKeys.length) {
				var keysToGet = [];
				var i = 0;
				while (i < Config.DYNAMO_DEFAULT_READ_PER_SEC && remainingKeys.length) {
					keysToGet.push(remainingKeys.pop());
					i++;
				}

				return dbGet(keysToGet)
				.then(function(getResult) {
					var dbResults = getResult[0].items;
					// DB RESULTS
					results.concat(dbResults);

					if (remainingKeys.length)  {

						var recursiveDefer = Q.defer();
						setTimeout(function() {
							
							dbGetInBatches()
							.then(function() {
								recursiveDefer.resolve();
							})
							.fail(function(err) {
								recursiveDefer.reject(err);
							})
							.end();

						}, Config.DYNAMO_BATCH_DELAY); // Delay so we don't crush db
						return recursiveDefer.promise;

					}					
				});
			}
		};

		// http://erickrdch.com/2012/06/how-to-wait-for-2-asynchronous-responses-on-nodejs-commonjs-promises.html
		var queue = [];
		keys.forEach(function(key) {
			queue.push(checkCache(key));
		});
		
		Q.all(queue)
		.then(function(fulfilled) {

			remainingKeys = keysRequiringDbHit;
			return dbGetInBatches();

		})
		.then(function() {

Log.l('BATCH RESULT');
Log.l(results);

			var queue = [];
			results.forEach(function(itemToCache) {
				queue.push(putCache(itemToCache));
			});

			return Q.all(queue);

		})
		.then(function() {
			deferred.resolve(results);
		})
		.fail(function(err) {
			Log.l('Error in _batchGet', err);
			deferred.reject(err);
		})
		.end();

		return deferred.promise;
	};

	var _put = function(item) {
		var that = this;

Log.l('Storage.put');
Log.l('table = ', that.tableName);
Log.l('item = ', item);

		return Q.ncall(
			ddb.putItem,
			that,
			that.tableName,
			item,
			{}
		)
		.then(function(dbResult) {
			return Cache.set(that.cacheKey(item), item, that.cacheTimeout);
		})
		.then(function(cacheResult) {
			return true;
		});
	};

	var _delete = function(hashKey, rangeKey) {
		var that = this;

Log.l('Storage.delete');
Log.l('table = ', that.tableName);
Log.l('hashKey = ', hashKey);
Log.l('rangeKey = ', rangeKey);

		var cacheKey = makeCacheKeyFromDbKey(that.cachePrefix, hashKey, rangeKey);
		var options = {}; // Implement options support if we ever need that.
					      // Can support expected value.

		var deleteFromTable = function() {
			return Q.ncall(
				ddb.deleteItem,
				that,
				that.tableName,
				hashKey,
				rangeKey,
				options
			)
			.then(function(deleteResult) {
				deferred.resolve(deleteResult);
			});
		};

		return Cache.remove(cacheKey)
		.then(function(result) {
			return deleteFromTable();
		});

	};

	var _query = function(hashKey, cacheKey, queryOptions) {
		var that = this;

Log.l('Storage.query');
Log.l('table = ', that.tableName);
Log.l('hashKey = ', hashKey);
Log.l('cacheKey = ', cacheKey);
Log.l('options = ', queryOptions);
		
		var deferred = Q.defer();

		Cache.get(cacheKey)
		.then(function(cacheResult) {

		 	deferred.resolve(cacheResult);

		})
		.fail(function(err) {

			var totalItems = [];
			var totalCount = 0;

			var dbQuery = function(startKey) {
				var options = {};
				_.extend(options, queryOptions);
				if (startKey) {
					options['exclusiveStartKey'] = startKey;
				}
				/** https://github.com/teleportd/node-dynamodb/blob/master/lib/ddb.js
				* returns a set of Attributes for an item that matches the query
				* @param table the tableName
				* @param hash the hashKey
				* @param options {attributesToGet, limit, consistentRead, count, 
				*                 rangeKeyCondition, scanIndexForward, exclusiveStartKey}
				* @param cb callback(err, tables) err is set if an error occured
				* query = function(table, hash, options, cb) {
				*/
				return Q.ncall(
					ddb.query,
					that,
					that.tableName,
					hashKey,
					options
				);
			};

			var loop = function(lastKey) {

				return dbQuery(lastKey)
				.then(function(queryResult) {

					totalItems = totalItems.concat(queryResult.items);
					totalCount += queryResult.count;
					var nextKey = queryResult.lastEvaluatedKey;
					if (nextKey && nextKey.hash) {

						var recursiveDefer = Q.defer();
						setTimeout(function() {
							loop(nextKey)
							.then(function() {
								recursiveDefer.resolve();
							});
						}, Config.DYNAMO_BATCH_DELAY);
						return recursiveDefer.promise;

					}
				});

			};

			loop()
			.then(function() {

				var result = { count: totalCount, items: totalItems };
				return Cache.set(cacheKey, result, that.cacheTimeout)
				.then(function(cacheResult) {
					
					deferred.resolve(result);

				});

			})
			.fail(function(err) {
				deferred.reject(err);
			})
			.end();

		})
		.end();

		return deferred.promise;
	};

	var _batchDelete = function(keys) {
		var that = this;
		var deferred = Q.defer();

Log.l('Storage.batchDelete');
Log.l('table = ', that.tableName);
Log.l('keys = ', keys);

		var remainingKeys = keys;
		var cacheKeys = makeCacheKeysFromDbKeys(that.cachePrefix, keys);
		
		var clearCache = function(cacheKey) {
Log.l('clearCache', cacheKey);
			return Cache.remove(cacheKey);
		};

		var dbDelete = function(keys) {
			/*
			batchWriteItem = function(putRequest, deleteRequest, cb) {
			Put or delete several items across multiple tables
			@param putRequest dictionnary { 'table': [item1, item2, item3], 'table2': item }
			@param deleteRequest dictionnary { 'table': [key1, key2, key3], 'table2': [[id1, range1], [id2, range2]] }
			@param cb callback(err, res, cap) err is set if an error occured
			*/
			var deleteRequest = {};		
			deleteRequest[that.tableName] = keys;
Log.l('deleteRequest', deleteRequest);
			return Q.ncall(
				ddb.batchWriteItem,
				that,
				{}, // putRequest
				deleteRequest
			);
		};

		var dbDeleteInBatches = function() {
			if (remainingKeys.length) {

				var keysToDelete = [];
				var i = 0;
				while (i < Config.DYNAMO_DEFAULT_WRITE_PER_SEC && remainingKeys.length) {
					keysToDelete.push(remainingKeys.pop());
					i++;
				}

				return dbDelete(keysToDelete)
				.then(function(deleteResult) {
Log.l('remainingKeys', remainingKeys.length);
					if (remainingKeys.length)  {
						var recursiveDefer = Q.defer();
						setTimeout(function() {
							
							dbDeleteInBatches()
							.then(function() {
								recursiveDefer.resolve();
							})
							.fail(function(err) {
								recursiveDefer.reject(err);
							})
							.end();

						}, Config.DYNAMO_BATCH_DELAY); // Delay so we don't crush db
						return recursiveDefer.promise;

					}
				});

			}
		};

		var queue = [];
		cacheKeys.forEach(function(cacheKey) {
			queue.push(clearCache(cacheKey));
		});

		Q.all(queue)
		.then(dbDeleteInBatches)
		.then(function() {
Log.l('_batchDelete complete.');
			deferred.resolve();
		})
		.fail(function(err) {
			deferred.reject(err);
		})
		.end();

		return deferred.promise;
	};

	/* 
	This does not add entries to memcache since it's usually pulling everything which includes a lot of garbage.
	Like during table cleans.
	If you need it to dump to cache build that.
	*/
	var _scan = function(scanOptions) {
		var that = this;
		scanOptions = scanOptions || {};

Log.l('Storage.scan');
Log.l('table = ', that.tableName);
Log.l('scanOptions = ', scanOptions);
		
		var scan = function(startKey) {
			var options = {};
			_.extend(options, scanOptions);
			if (startKey) {
				options['exclusiveStartKey'] = startKey;
			}
			/*
			* scan = function(table, options, cb) {
			* returns one or more items and its attributes by performing a full scan of a table.
			* @param table the tableName
			* @param options {attributesToGet, limit, count, scanFilter, exclusiveStartKey}
			* @param cb callback(err, {count, items, lastEvaluatedKey}) err is set if an error occured
			*/
			return Q.ncall(
				ddb.scan,
				that,
				that.tableName,
				options
			);
		};

		var totalItems = [];
		var totalCount = 0;

		var loop = function(lastKey) {
			return scan(lastKey)
			.then(function(scanResult) {
				scanResult = scanResult[0];
				totalItems = totalItems.concat(scanResult.items);
				totalCount += scanResult.count;
				nextKey = scanResult.lastEvaluatedKey;
				if (nextKey && nextKey.hash) {

					var recursiveDefer = Q.defer();
					setTimeout(function() {
						loop(nextKey)
						.then(function() {
							recursiveDefer.resolve();
						});
					}, Config.DYNAMO_BATCH_DELAY); // Delay so we don't crush db
					return recursiveDefer.promise;

				}
			});
		};

		return loop()
		.then(function() {
			var result = { count: totalCount, items: totalItems };
			return result;
		});

	};

	///////////////////////////////////////////////////////////////////////////
	// TABLES
	//
	// cacheKey used to cache items on Storage.put.
	// Storage.get and others will require cacheKey to be specified.
	// Be careful this matches how it is set with put!
	///////////////////////////////////////////////////////////////////////////
	
	EVENTS_BY_USERID_AND_DAYCODE = {
		tableName: 'DAYZE_EVENTS_BY_USERID_AND_DAYCODE',
		cachePrefix: '01_',
		cacheTimeout: 3600,
		cacheKey: function(item) {
			return this.cachePrefix + item.userId + item.dayCode;
		},
		put: _put,
		get: _get,
		query: function(userId, monthCode, options) {
			var hashKey = userId;
			var cacheKey = this.cachePrefix + userId + monthCode;
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
		get: _get,
		scan: _scan,
		batchDelete: _batchDelete
	};

	USERS_BY_COOKIE = {
		tableName: 'DAYZE_USERS_BY_COOKIE',
		cachePrefix: '04_',
		cacheTimeout: 3600,
		cacheKey: function(item) {
			return this.cachePrefix + item.cookieId;
		},
		put: _put,
		get: _get,
		scan: _scan,
		batchDelete: _batchDelete
	};

	USERS_BY_EMAIL = {
		tableName: 'DAYZE_USERS_BY_EMAIL',
		cachePrefix: '05_',
		cacheTimeout: 3600,
		cacheKey: function(item) {
			return this.cachePrefix + item.email;
		},
		put: _put,
		get: _get,
		scan: _scan,
		batchDelete: _batchDelete
	}
		
	CUSTOM_LINKS = {
		tableName: 'DAYZE_CUSTOM_LINKS',
		cachePrefix: '06_',
		cacheTimeout: 3600,
		cacheKey: function(item) {
			return this.cachePrefix + item.linkId;
		},
		put: _put,
		get: _get,
		scan: _scan,
		batchDelete: _batchDelete
	};

	///////////////////////////////////////////////////////////////////////////
	// STORAGE OPERATIONS
	//
	//  Every op should begin with:
	//		var deferred = Q.defer();
	//
	// and end with:
	// 		.fail(function(err) {
	//			deferred.reject(new ServerError(err));
	//		})
	//		.end();
	//
	//		return deferred.promise;
	//
	///////////////////////////////////////////////////////////////////////////

	///////////////////////////////////////////////////////////////////////////
	// Events
	///////////////////////////////////////////////////////////////////////////

	Storage.Events = (function() {

		var Events = {};

		Events.createEvent = function(user, post) {
			var deferred = Q.defer();

			var eventId = Uuid.v4();
			var dayCode = post.dayCode;

			var event = {
				eventId: eventId,
				name: post.name,
				userId: user.userId,
				createTime: Utils.getNowIso()
			};	

			event = Utils.removeEmptyStrings(event);

			EVENTS_BY_USERID_AND_DAYCODE.get(user.userId, dayCode)
			.then(function(eventIndex) {

				var eventIds = eventIndex && eventIndex.eventIds || [];
				eventIds.push(eventId);
				var eventIndex = {
					userId: user.userId,
					dayCode: dayCode,
					eventIds: eventIds
				};

				return EVENTS_BY_USERID_AND_DAYCODE.put(eventIndex)
				.then(function(putResult) {

					return EVENTS.put(event);

				});

			})
			.fail(function(err) {
Log.l('err in Events.createEvent', err);
				deferred.reject(new ServerError(err));
			})
			.end();

			return deferred.promise;
		};

		Events.getEventsForMonth = function(user, monthCode) {
			var deferred = Q.defer();

			var eventTimeRange = Utils.makeMonthRange(monthCode);
Log.l(eventTimeRange);

			var options = {
				RangeKeyCondition: {
					ComparisonOperator: 'BETWEEN',
					AttributeValueList: [
						eventTimeRange.begin,
						eventTimeRange.end
					]
				}
			};

			EVENTS_BY_USERID_AND_DAYCODE.query(user.userId, monthCode, options)
			.then(function(eventIndices) {
				// eventIndices is an array of objects { userId, dayCode, eventIds: [ '123', '124', ... ] }
Log.l('eventIndices', eventIndices);
				if (eventIndices.count) {

					var allEventIdsInMonth = [];
					eventIndices.forEach(function(eventIndex) {
						allEventIdsInMonth = allEventIdsInMonth.concat(eventIndex.eventIds);
					});

					return EVENTS.batchGet(allEventIdsInMonth);					

				} else {

					deferred.resolve([]);
				
				}

			})
			.then(function(events) {
Log.l('all events this month', events);
				deferred.resolve(events);
			})
			.fail(function(err) {
				deferred.reject(new ServerError(err));
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
				
					return Storage.CustomLinks.makeLink(user, C.Links.EmailConfirmation)
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

		Users.resetPassword = function(user) {
			var deferred = Q.defer();

			Storage.CustomLinks.makeLink(user, C.Links.ResetPassword)
			.then(function(link) {

				return Email.sendResetPassword(user, link);

			})
			.then(function(sendResetPasswordResult) {
				deferred.resolve(sendResetPasswordResult);
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
				userId: user.userId
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
			});

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

		Users.getUserWithId = function(userId) {
			var deferred = Q.defer();

			USERS.get(userId)
			.then(function(user) {
				deferred.resolve(user);
			})
			.fail(function(err) {
				deferred.reject(new ServerError(err));
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

			// var emailIndex = {
			// 	email: account.unconfirmedEmail,
			// 	userId: account.userId
			// };

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

		CustomLinks.getLink = function(linkId, ignoreRules) {
			var deferred = Q.defer();

			CUSTOM_LINKS.get(linkId)
			.then(function(link) {

				if (ignoreRules) {
					deferred.resolve(link);
				}

				var needsToBeMarkedUsed = false;
				
				/* No guarantee user is logged in when they hit link.
				if (link.userId && link.userId != user.userId) {
					deferred.reject(new ServerError(C.ErrorCodes.LinkNotForUser));
				}
				*/

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

					link.used = 1;
					
					return CUSTOM_LINKS.put(link)
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

		CustomLinks.makeLink = function(user, type) {
			var deferred = Q.defer();

			var expiration = new Date();
			var life = C.Links.Expiration[type];
			expiration.setDate(expiration.getDate() + life);
			expiration = expiration.toISOString();

			if (type == C.Links.EmailConfirmation) {

				var link = {
					linkId: Utils.generateCustomLink(),
					type: type,
					isSingleUse: 1,
					createTime: Utils.getNowIso(),
					expiration: expiration,
					used: 0,
					userId: user.userId,
					pendingEmail: user.unconfirmedEmail 
					// We store the email in link so we know exactly what email we mailed.
					// Otherwise we'd be blindly trusting user.unconfirmedEmail at the time of link click which is bad.
				};

			} else if (type == C.Links.ResetPassword) {
				
				var link = {
					linkId: Utils.generateCustomLink(),
					type: type,
					isSingleUse: 1,
					createTime: Utils.getNowIso(),
					expiration: expiration,
					used: 0,
					userId: user.userId
				};

			}

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

	Storage.AdminTools = (function() {

		var AdminTools = {};

		AdminTools.createGarbage = function() {
			var deferred = Q.defer();

			var garbage = [];

			for (var i = 0; i < 100; i++) {
				var link = {
					linkId: Utils.generateCustomLink(),
					isSingleUse: 1,
					used: 1
				};
				garbage.push(link);
			}

			var dbWrite = function(items) {
				/*
				batchWriteItem = function(putRequest, deleteRequest, cb) {
				Put or delete several items across multiple tables
				@param putRequest dictionnary { 'table': [item1, item2, item3], 'table2': item }
				@param deleteRequest dictionnary { 'table': [key1, key2, key3], 'table2': [[id1, range1], [id2, range2]] }
				@param cb callback(err, res, cap) err is set if an error occured
				*/
				var putRequest = {};		
				putRequest['DAYZE_CUSTOM_LINKS'] = items;
Log.l('putRequest', putRequest);
				return Q.ncall(
					ddb.batchWriteItem,
					this,
					putRequest, // putRequest
					{}
				);
			};

			var writeInBatches = function() {
			
				if (garbage.length) {
					var itemsToWrite = [];
					var i = 0;
					while (i < Config.DYNAMO_DEFAULT_WRITE_PER_SEC && garbage.length) {
						itemsToWrite.push(garbage.pop());
						i++;
					}
				}

				return dbWrite(itemsToWrite)
				.then(function(writeResult) {
Log.l('garbage', garbage.length);
					if (garbage.length)  {

						var recursiveDefer = Q.defer();
						setTimeout(function() {
							
							writeInBatches()
							.then(function() {
								recursiveDefer.resolve();
							})
							.fail(function(err) {	
								recursiveDefer.reject(err);
							})
							.end();

						}, Config.DYNAMO_BATCH_DELAY); // Delay so we don't crush db
						return recursiveDefer.promise;

					}
				});

			};

			writeInBatches()
			.then(function() {
Log.l('DONE');
				deferred.resolve();
			})
			.fail(function(err) {
Log.l('FAIL', err);
				deferred.reject();
			})
			.end();

			return deferred.promise;
		};

		AdminTools.cleanTables = function() {
			var rootDefer = Q.defer();

			var referentialIntegrityMappings = [
				{
					// For each cookieId in USERS_BY_COOKIE
					// 		Ensure USERS contains a user with that cookieId.
					//  	If not, delete that row in USERS_BY_COOKIE (it's an orphan).
					slaveTable: USERS_BY_COOKIE, 
					masterTable: USERS,
					slaveKey: 'cookieId',
					masterKey: 'userId'
				}, {
					// Delete all rows in USERS_BY_EMAIL if no user actually has that email.
					slaveTable: USERS_BY_EMAIL,
					masterTable: USERS,
					slaveKey: 'email',
					masterKey: 'userId'
				}
			];

			var expirationMappings = [
				{
					masterTable: CUSTOM_LINKS,
					masterKey: 'linkId',
					expirationField: 'expiration',
					daysOverExpirationForDeletion: 10,
					deleteIfMissingExpiration: true,
					otherRules: [ // return true if should be deleted.
						function(item) {
							if (item.hasOwnProperty('isSingleUse') &&
							item.hasOwnProperty('used')) {
								if (item.isSingleUse == 1 && item.used == 1) {
									return true;
								}
							}
							return false;
						}
					]
				}, {
					masterTable: USERS,
					masterKey: 'userId',
					expirationField: 'lastActivityTime',
					daysOverExpirationForDeletion: 10,
					deleteIfMissingExpiration: true
				}

			];

			var refMapLoop = function() {
				if (referentialIntegrityMappings.length) {
					var refMap = referentialIntegrityMappings.pop();
					
					return cleanRef(refMap)
					.then(function(result) {

						if (referentialIntegrityMappings.length) {
					
							return refMapLoop();
					
						} else {
							return;
						}

					});
				}
			};

			var cleanRef = function(refMap) {
Log.l('//////////////////////////////////////////////////////////////////');
Log.l('// CLEANING TABLE FOR REFERENTIAL INTEGRITY');
Log.l(refMap.slaveTable.tableName);
Log.l('//////////////////////////////////////////////////////////////////');
				var deferred = Q.defer();

				var SLAVE = refMap.slaveTable;
				var MASTER = refMap.masterTable;
				var masterKeyName = refMap.masterKey;
				var slaveKeyName = refMap.slaveKey;
				var slaveItems;
				var slavesToDelete = [];

				var processSlaveItemsOneAtATime = function() {
					if (slaveItems.length) {
					
						var slaveItem = slaveItems.pop();
						var masterKey = slaveItem[masterKeyName];
						
						return MASTER.get(masterKey)
						.then(function(masterItem) {
							
							if (!masterItem || masterItem[slaveKeyName] != slaveItem[slaveKeyName]) {
								var slaveKey = slaveItem[slaveKeyName];
								slavesToDelete.push(slaveKey);
							} else {
								// Do nothing.  This item should live.
							}

							// Keep going?
							if (slaveItems.length) {

								return processSlaveItemsOneAtATime();

							}

						});

					}
				};

				SLAVE.scan({ limit: Config.DYNAMO_SCAN_CHUNK_SIZE })
				.then(function(result) {
					slaveItems = result.items;
Log.l('slaveItems', slaveItems);
					
					return processSlaveItemsOneAtATime();	

				})
				.then(function() {
Log.l('savesToDelete', slavesToDelete);
					
					return SLAVE.batchDelete(slavesToDelete);

				})
				.then(function() {
Log.l('//////////////////////////////////////////////////////////////////');
Log.l('// THIS TABLE CLEAN');
Log.l(refMap.slaveTable.tableName);
Log.l('//////////////////////////////////////////////////////////////////');
					deferred.resolve();
				})
				.fail(function(err) {
					deferred.reject(err);
				})
				.end();

				return deferred.promise;
			};

			var expirationLoop = function() {
				if (expirationMappings.length) {
					var expirationMap = expirationMappings.pop();
					
					return cleanExpiration(expirationMap)
					.then(function(result) {

						if (expirationMappings.length) {
							return expirationLoop();
						} else {
							return;
						}

					});
				}
			};

			var cleanExpiration = function(expirationMap) {
Log.l('//////////////////////////////////////////////////////////////////');
Log.l('// CLEANING TABLE FOR EXPIRATION');
Log.l(expirationMap.masterTable.tableName);
Log.l('//////////////////////////////////////////////////////////////////');
				var deferred = Q.defer();

				var MASTER = expirationMap.masterTable;
				var masterKeyName = expirationMap.masterKey;
				var expirationField = expirationMap.expirationField;

				var keysToDelete = [];
				var masterItems;

				var now = new Date().getTime();
				var cutoffDate = expirationMap.daysOverExpirationForDeletion * 24 * 60 * 60 * 1000;
				cutoffDate = now - cutoffDate;

				MASTER.scan({ limit: Config.DYNAMO_SCAN_CHUNK_SIZE })
				.then(function(result) {

Log.l('scan result', result);
					masterItems = result.items;
					masterItems.forEach(function(item) {
						
						var alreadyDeleted = false;

						var expirationFieldExists = item.hasOwnProperty(expirationField);
						if (expirationFieldExists) {
							var itemDate = new Date(item[expirationField]).getTime();
							if (itemDate < cutoffDate) {
								keysToDelete.push(item[masterKeyName]);
								alreadyDeleted = true;
Log.l('item = ', itemDate, 'cutoffDate = ', cutoffDate);
Log.l('expired item', item);
							}
						} else {
							if (expirationMap.deleteIfMissingExpiration) {
Log.l('item missing expiration', item);
								keysToDelete.push(item[masterKeyName]);
								alreadyDeleted = true;
							}
						}

						if (expirationMap.otherRules) {
							var otherRules = expirationMap.otherRules;
							otherRules.forEach(function(rule) {
								if (rule(item) && !alreadyDeleted) {
									keysToDelete.push(item[masterKeyName]);
									alreadyDeleted = true;
								}
							});
						}

					});
					
				})
				.then(function() {

Log.l('keysToDelete', keysToDelete);
					return MASTER.batchDelete(keysToDelete);

				})
				.then(function() {
Log.l('//////////////////////////////////////////////////////////////////');
Log.l('// THIS TABLE CLEAN');
Log.l(expirationMap.masterTable.tableName);
Log.l('//////////////////////////////////////////////////////////////////');
					deferred.resolve();
				})
				.fail(function(err) {
					deferred.reject(err);
				})
				.end();

				return deferred.promise;
			};

Log.l('//////////////////////////////////////////////////////////////////');
Log.l('//////////////////////////////////////////////////////////////////');
Log.l('//////////////////////////////////////////////////////////////////');
Log.l('// BEGIN CLEANING ALL TABLES');
Log.l('//////////////////////////////////////////////////////////////////');
Log.l('//////////////////////////////////////////////////////////////////');
Log.l('//////////////////////////////////////////////////////////////////');
			refMapLoop()
			.then(expirationLoop)
			.then(function() {
Log.l('//////////////////////////////////////////////////////////////////');
Log.l('//////////////////////////////////////////////////////////////////');
Log.l('//////////////////////////////////////////////////////////////////');
Log.l('// ALL TABLES CLEAN');
Log.l('//////////////////////////////////////////////////////////////////');
Log.l('//////////////////////////////////////////////////////////////////');
Log.l('//////////////////////////////////////////////////////////////////');
				rootDefer.resolve({ msg: 'all tables clean' });
			})
			.fail(function(err) {
				rootDefer.reject(new ServerError(err));
			})
			.end();

			return rootDefer.promise;

		};

		return AdminTools;

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