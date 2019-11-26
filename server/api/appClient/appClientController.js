import AppClient from './appClientModel';
var sendRsp = require('../../utils/response').sendRsp;


exports.create = function(req, res) {
	req.body.secret = require('crypto').randomBytes(32).toString('base64');
	AppClient.create(req.body)
		.then(data => {
			sendRsp(res,201,'created',data);
		}).catch(err => {
			sendRsp(res,500,'error',err);
		});
};