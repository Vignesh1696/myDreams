import passport from 'passport';
import _ from 'lodash';
import expressJwt from 'express-jwt';
import request from 'request';
import crypto from '../../../auth/encrypt-decrypt';
import SuperAdminmodel from './superAdminModel';
import config from '../../../config/environment';
var sendRsp = require('../../../utils/response').sendRsp;
var log = require('../../../libs/log')(module);
var status = require('../../../config/http_status');
var msg = require('../../../config/message');

exports.create = function(req, res) {
	var superAdmin = {};
	superAdmin.username = req.body.username;
	superAdmin.email = req.body.email;
	superAdmin.first_name = req.body.first_name;
	superAdmin.last_name = req.body.last_name;
	superAdmin.password = req.body.password;
	SuperAdminmodel.create(superAdmin)
		.then(data => {
			sendRsp(res,200,'created',data);
		}).catch(err => {
			sendRsp(res, 500, "Server Error",err);
		});
};

exports.update = function(req, res) {
	var UpdateSuperAdmin = {};
	var _id = req.params.id;
	UpdateSuperAdmin.username = req.body.username;
	UpdateSuperAdmin.email = req.body.email;
	UpdateSuperAdmin.first_name = req.body.first_name;
	UpdateSuperAdmin.last_name = req.body.last_name;
	UpdateSuperAdmin.password = req.body.password;
	SuperAdminmodel.findByIdAndUpdate({
			_id
		}, UpdateSuperAdmin)
		.then(updateAdmin => {
			sendRsp(res,200,'ok',updateAdmin);
		}).catch(err => {
			sendRsp(res, 500, "Server Error",err);
		});
};
exports.me = function(req, res) {
	var user = {};
	 user = req.user.id;
	SuperAdminmodel.find({
		_id: user
	},'-salt -hashed_password -tokens').then(user => {
		sendRsp(res, 200, 'ok', user);

	}).catch(err => {
		sendRsp(res, 409, "noUserFound", err);
	});
}

exports.delete = function(req, res) {
	var id = req.params.id;
	SuperAdminmodel.findOneAndDelete({
			_id: id
		})
		.then(AdminDeleted => {
			sendRsp(res,200,'ok',AdminDeleted);

		}).catch(err => {
			sendRsp(res, 500, "Server Error",err);
		});
};

exports.login = function(req, res) {	
	try {
		req.checkBody('username', 'Missing Query Param').notEmpty();
		req.checkBody('password', 'Missing Query Param').notEmpty();
		var errors = req.validationErrors();
		if (errors) {
			sendRsp(res, status.BAD_REQUEST, msg.err, errors);
			return;
		}
		var params = req.body;
		var clientId = config.auth.clientId;
		var clientSecret = config.auth.clientSecret;
		params.grant_type = "password";
		var authCode = new Buffer(clientId + ":" + clientSecret).toString('base64');	
		request.post({
			url: config.auth.saUrl,
			form: params,
			headers: {
				"Authorization": "Basic " + authCode
			}
		}, function(err, response, body) {
			console.log("response", response.statusCode);
			console.log("body", body);
			if (err) {
				log.error('Internal error(%d): %s', res.statusCode, err.message);
				return sendRsp(res, 500, "Server Error");
			}
			if (response.statusCode == 403) {
				sendRsp(res, 401, 'Invalid email or Password');
				return;
			}
			var tokens = {};
			var rspTokens = {};
			var tokenJSON = JSON.parse(body);
			var refreshToken = tokenJSON.refresh_token;
			rspTokens.access_token = tokenJSON.access_token;
			rspTokens.expires_in = tokenJSON.expires_in;
			rspTokens.token_type = tokenJSON.token_type;
			var encryptedRefToken = crypto.encrypt(refreshToken);
			tokens.clientId = clientId;
			tokens.refreshToken = JSON.parse(body).refresh_token;
			rspTokens.refresh_token = encryptedRefToken;
			res.cookie('admin_refresh_token', encryptedRefToken);
			log.info('200', 'Success');
			return sendRsp(res, 200, 'Success', rspTokens);		
		});
	} catch (err) {
		console.log("login error catch block", err);
		sendRsp(res, status.INTERNAL_SERVER_ERROR, msg.err, err);
	}
};


exports.refreshToken = function(req, res, next) {
	console.log('commmmmmm',req.body.refresh_token)
		var decryptedRefToken = crypto.decrypt(req.body.refresh_token);
	SuperAdminmodel.find({
		"email": req.body.username
	}, function(err, user) {
		if (err) {
			log.error('Internal error(%d): %s', res.statusCode, err.message);
			return sendRsp(res, 500, "Server Error");
		}
		if (user.length > 0) {
			var tokens = user[0].tokens;
			var flag = false;
			for (var i = 0; i < tokens.length; i++) {
				if (tokens[i].refreshToken === decryptedRefToken) {
					flag = true;
				}
			}
			if (!flag) {
				log.error("MISMATCH_REFRESH_TOKEN");
				sendRsp(res, 403, "Refesh Token Mismatched");
				return;
			}
			var params = {};
			params.refresh_token = decryptedRefToken;
			var clientId = config.auth.clientId;
			var clientSecret = config.auth.clientSecret;
			params.grant_type = "refresh_token";

			var authCode = new Buffer(clientId + ":" + clientSecret).toString('base64');
			request.post({
				url: config.auth.saUrl,
				form: params,
				headers: {
					"Authorization": "Basic " + authCode
				}
			}, function(err, response, body) {

				if (err) {
					log.error('Internal error(%d): %s', res.statusCode, err.message);
					return sendRsp(res, 500, "Server Error");
				}

				if (!err) {
					log.info('200, Success');
					return sendRsp(res, 200, 'Success', JSON.parse(body));
				}
			});
		} else {
			res.clearCookie('admin_refresh_token');
			log.error('403', 'Not Found');
			return sendRsp(res, 404, 'Not Found');
		}
	});
};


exports.logout = function(req, res, next) {
	if (req.body.refresh_token) {
		var refToken = crypto.decrypt(req.body.refresh_token);
		res.clearCookie('admin_refresh_token');
		SuperAdminmodel.update({
			'username': req.body.username
		}, {
			$pull: {
				tokens: {
					"refreshToken": refToken
				}
			}
		}, function(err, result) {
			if (err) {
				log.error('Internal error(%d): %s', res.statusCode, err.message);
				return sendRsp(res, 500, "Server Error");
			}
			if (!err) {
				return sendRsp(res, 200, "Logout Successfully");
			} else {
				log.error('Internal error(%d): %s', res.statusCode, err.message);
				return sendRsp(res, 500, "Server Error");
			}
		});
	} else {
		console.log("cannot find refresh token in req body");
	}
};

exports.me = function(req, res) {
	var user = {};
	 user = req.user.id;
	SuperAdminmodel.find({
		_id: user
	},'-salt -hashed_password -tokens').then(user => {
		sendRsp(res, 200, 'ok', user);

	}).catch(err => {
		sendRsp(res, 409, "noUserFound", err);
	});
}