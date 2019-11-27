/**
 * Module dependencies.
 */
import oauth2orize from 'oauth2orize';
import passport from 'passport';
import _ from 'lodash';
import crypto from 'crypto';
import User from '../auth/superAdminModel';
import config from '../../../config/environment';
import jwt from 'jsonwebtoken';
import auth from './auth';
var log = require('../../../libs/log')(module);



// create OAuth 2.0 server
var server = oauth2orize.createServer();

/**
 * Exchange user id and password for access tokens.
 * 
 * The callback accepts the `client`, which is exchanging the user's name and
 * password from the token request for verification. If these values are
 * validated, the application issues an access token on behalf of the user who
 * authorized the code.
 */
server.exchange(oauth2orize.exchange.password(function(client, email, password,
	scope, done) {
	console.log("hello");
	User.findOne({
		email: email
	}, function(err, user) {
		if (err) {
			log.error('Internal error(%d): %s', res.statusCode, err.message);
			return done(err);
		}
		if (!user) {
			return done(null, false);
		}
		if (!user.authenticate(password)) {
			return done(null, false);
		}

		var tokenPayload = {
			userId: user._id,
			email: user.email,
			client: client
		};

		var accessToken = jwt.sign(tokenPayload, config.secrets.accessToken, {
			expiresIn: config.token.expiresInMinutes * 60
		});

		if (user.tokens.length > 0) {
			for (var i = 0; i < user.tokens.length; i++) {
				var token = user.tokens[i];
				if (token.clientId === JSON.stringify(client._id)) {
					return done(null, accessToken, token.refreshToken, {
						expires_in: config.token.expiresInMinutes * 60
					});
				}
			}
		}

		var refreshTokenPayload = {
			userId: user._id,
			email: user.email,
			client: client
		};
		var refreshToken = jwt.sign(refreshTokenPayload, config.secrets.refreshToken);

		var token = {
			appClient: client._id,
			refreshToken: refreshToken
		};
		User.update({
			_id: user._id,
			'tokens.appClient': client._id
		}, {
			$set: {
				'tokens.$': token
			}
		}, function(err, numAffected) {
			if (numAffected.nModified == 0) {
				// Document not updated so you can push onto the array
				User.update({
					_id: user._id
				}, {
					$push: {
						'tokens': token
					}
				}, function(err, numAffected) {
					if (err) {
						return done(null, false);
					}
					return done(null, accessToken, refreshToken, {
						expires_in: config.token.expiresInMinutes * 60
					});
				});
			} else {
				if (err) {
					log.error('Internal error(%d): %s', res.statusCode, err.message);
					return done(null, false);
				}
				return done(null, accessToken, refreshToken, {
					expires_in: config.token.expiresInMinutes * 60
				});
			}

		});
	});
}));

/**
 * Exchange the refresh token for an access token.
 * 
 * The callback accepts the `client`, which is exchanging the client's id from
 * the token request for verification. If this value is validated, the
 * application issues an access token on behalf of the client who authorized the
 * code
 */
server.exchange(oauth2orize.exchange.refreshToken(function(client,
	refreshToken, scope, done) {
	jwt.verify(refreshToken, config.secrets.refreshToken, function(err,
		tokenPayload) {
		if (err) {
			return done(err);
		}
		if (client._id != tokenPayload.client._id) {
			return done(null, false);
		}
		if (client.secret != tokenPayload.client.secret) {
			return done(null, false);
		}
		User.findById(tokenPayload.userId, function(err, user) {
			if (err) {
				return done(err);
			}
			if (!user) {
				return done(null, false);
			}
			
			var newTokenPayload = {
				userId: user._id,
				email: user.email,
				client: client
			};
			var accessToken = jwt.sign(newTokenPayload,
				config.secrets.accessToken, {
					expiresIn: config.token.expiresInMinutes * 60
				});

			var token = {
				appClient: client._id,
				refreshToken: refreshToken
			};
			User.update({
				_id: user._id,
				'tokens.appClient': client._id
			}, {
				$set: {
					'tokens.$': token
				}
			}, function(err, numAffected) {
				if (numAffected == 0 && err && err.code === 16836) {
					// Document not updated so you can push onto the array
					User.update({
						_id: user._id
					}, {
						$push: {
							'tokens': token
						}
					}, function(err, numAffected) {
						if (err) {
							return done(null, false);
						}
						return done(null, accessToken, null, {
							expires_in: config.token.expiresInMinutes * 60
						});
					});
				} else {
					if (err) {
						return done(null, false);
					}
					return done(null, accessToken, null, {
						expires_in: config.token.expiresInMinutes * 60
					});
				}

			});
		});
	});
}));

/**
 * Token endpoint
 * 
 * `token` middleware handles client requests to exchange authorization grants
 * for access tokens. Based on the grant type being exchanged, the above
 * exchange middleware will be invoked to handle the request. Clients must
 * authenticate when making requests to this endpoint.
 */
exports.token = [
	passport.authenticate(['basic', 'oauth2-client-password'], {
		session: false
	}), server.token(), server.errorHandler()
];