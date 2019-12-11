import mongoose from 'mongoose';
import passport from 'passport';
import config from '../config/environment';
import expressJwt from 'express-jwt';
import compose from 'composable-middleware';
import SuperAdminModel from '../api/sa-auth/auth/superAdminModel';
import User from '../api/users/userModel';
// import util from 'util';
import _ from 'lodash';
var sendRsp = require('../utils/response').sendRsp;

var validateJwt = expressJwt({
	secret: config.secrets.accessToken
});

var globalValidateJwt = expressJwt({
	secret: config.secrets.globalAccessToken
});


function isAuthenticated() {
	return compose()
	.use(function(req, res, next) {
		if (req.query && req.query.hasOwnProperty('access_token')) {
			req.headers.authorization = 'Bearer ' + req.query.access_token;
		}
		validateJwt(req, res, next);
	})
	.use(function(req, res, next) {

		req.client = req.user.client;
		User.findById(req.user.userId, '-tokens -salt -hashed_password')
		.exec(function(err, userExist) {
			console.log("response", userExist);

			if (err) {
				return next(err);
			}
			if (!userExist) {
				SuperAdminModel.findById(req.user.userId, '-tokens -salt -hashed_password')
				.exec(function(err, superAdmin) {
					if (err) {
						return next(err);
					}
					if (superAdmin) {
						req.user = superAdmin;
						next();
					} else {
						return res.send(401);
					}
				})
			} else {
				req.user = userExist;
				next();
			}
		});
	});
}

function isTalent() {
	return compose()
	.use(isAuthenticated())
	.use(async function(req, res, next) {
		try {
			if (req.user.role == 2) {
				const userFind = await User.findOne({
					_id: req.user.id
				})
				if (userFind) {
					req.user = userFind;
					next();
				} else {
					return sendRsp(res, 404, 'Not Found');
				}
			} else {
				return sendRsp(res, 404, 'user Not Found');
				next();
			}

		} catch (err) {
			console.log("eeeeeee",err)
			return sendRsp(res, 500, 'Server Error',err)
		}

	})
}

function isHire() {
	return compose()
	.use(isAuthenticated())
	.use(async function(req, res, next) {
		try {
			if (req.user.role == 3) {
				const userFind = await User.findOne({
					_id: req.user.id
				})
				if (userFind) {
					req.user = userFind;
					next();
				} else {
					return sendRsp(res, 404, 'Not Found');
				}
			} else {
				return sendRsp(res, 404, 'user Not Found');
				next();
			}

		} catch (err) {
			return sendRsp(res, 500, 'Server Error')
		}

	})
}



exports.isHire = isHire;
exports.isTalent = isTalent;
exports.isAuthenticated = isAuthenticated;