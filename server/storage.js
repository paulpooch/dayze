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
		
		var deferred = Q.defer();
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
						setTimeout(function() {
							return dbGetInBatches();
						}, Config.DYNAMO_BATCH_DELAY); // Delay so we don't crush db
					} else {
						return;
					}
					
				})
				.fail(function(err) {
Log.l('Error in _batchGet', err);
					deferred.reject(err);
				})
				.end();

			}
		};

		// http://erickrdch.com/2012/06/how-to-wait-for-2-asynchronous-responses-on-nodejs-commonjs-promises.html
		var queue = [];
		keys.forEach(function(key) {
			queue.push(checkCache(key));
		});
		
		return Q.all(queue)
		.then(function(fulfilled) {

			remainingKeys = keysRequiringDbHit;
			return dbGetInBatches();

		}).then(function() {

Log.l('BATCH RESULT');
Log.l(results);

			var queue = [];
			results.forEach(function(itemToCache) {
				queue.push(putCache(itemToCache));
			});

			return Q.all(queue)
			.then(function(fulfilled) {
				Log.l('Done caching all items from batch get.');
				return(results);
			});

		});

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

	// This is wrong.  Needs to use exclusiveStartKey stuff.
	// See _scan
	// FIX THIS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	// FIX THIS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	// FIX THIS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	// FIX THIS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	// FIX THIS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
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
Log.l('remainingKeys', remainingKeys);
					if (remainingKeys.length)  {
						setTimeout(function() {
Log.l('NEXT BATCH');
							return dbDeleteInBatches();
						}, Config.DYNAMO_BATCH_DELAY); // Delay so we don't crush db
					} else {
Log.l('DONE!!!! remainingKeys', remainingKeys);
						return;
					}
				})
				.fail(function(err) {
Log.l('Error in _batchDelete', err);
					deferred.reject(err);
				})
				.end();

			}
		};

		var queue = [];
		cacheKeys.forEach(function(cacheKey) {
			queue.push(clearCache(cacheKey));
		});

		return Q.all(queue)
		.then(function(fulfilled) {

			return dbDeleteInBatches();

		})
		.then(function() {
Log.l('_batchDelete complete.');
			return;
		});

	};

	/* 
	This does not add entries to memcache since it's usually pulling everything which includes a lot of garbage.
	Like during table cleans.
	If you need it to dump to cache build that.
	*/
	var _scan = function(scanOptions) {
		var that = this;
Log.l('Storage.scan');
Log.l('table = ', that.tableName);
Log.l('scanOptions = ', scanOptions);

		var deferred = Q.defer();
		scanOptions = scanOptions || {};
		
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
			scan(lastKey)
			.then(function(scanResult) {
				scanResult = scanResult[0];
				totalItems = totalItems.concat(scanResult.items);
				totalCount += scanResult.count;
				nextKey = scanResult.lastEvaluatedKey;
				if (nextKey && nextKey.hash) {
					setTimeout(function() {
						loop(nextKey);	
					}, Config.DYNAMO_BATCH_DELAY); // Delay so we don't crush db
				} else {
					deferred.resolve({ count: totalCount, items: totalItems });
				}
			})
			.fail(function(err) {
				deferred.reject(err);
			})
			.end();
		};

		loop();

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
		get: _get
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

			try {
				var eventId = Uuid.v4();
				var eventTime = Utils.makeISOWithDayAndTime(post.dayCode, post.beginTime);
			} catch (err) {
				deferred.reject(new ServerError(err));
			}

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

			event = Utils.removeEmptyStrings(event);

			EVENTS_BY_USERID_AND_TIME.get(user.userId, eventTime)
			.then(function(eventsByUserIdAndTime) {

				var eventArr = [];
				if (eventsByUserIdAndTime) {
					var existingEvents = eventsByUserIdAndTime.events;
					if (existingEvents) {
						eventArr.concat(existingEvents);
					}
				}
				eventArr.push(event.eventId);

				var eventsEntry = {
					userId: user.userId,
					eventTime: eventTime,
					events: eventArr
				};

				return EVENTS_BY_USERID_AND_TIME.put(eventsEntry)
				.then(function(result) {

					return EVENTS.put(event)
					.then(function(result) {
						deferred.resolve(event);
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
					// needsToBeMarkedUsed = true;
					// if (link.used) {
					// 	deferred.reject(new ServerError(C.ErrorCodes.LinkUsed));
					// }
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

		AdminTools.cleanTables = function() {
			
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

			var loop = function() {
Log.l('loop');
				if (referentialIntegrityMappings.length) {
					var refMap = referentialIntegrityMappings.pop();
					return clean(refMap)
					.then(function(result) {

						if (referentialIntegrityMappings.length) {
							return loop();
						} else {
							return;
						}

					});
				}
			};

			var clean = function(refMap) {
Log.l('CLEANING TABLES BASED ON ', refMap);
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
							} else {
Log.l('BOTTOM OF RESURSION STACK');
								return;
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
Log.l('clean complete.');
					deferred.resolve();
				})
				.fail(function(err) {
					deferred.reject(new ServerError(err));
				})
				.end();

				return deferred.promise;
			};

			return loop();

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