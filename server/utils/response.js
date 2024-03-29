var sendRsp = function sendRsp(res, status, msg, output, appErrorCode) {
	output = output ? output : {};
	var meta = {};
	meta.status = status;
	if (appErrorCode) {
		meta.error = appErrorCode;
	}
	meta.msg = msg;

	res.statusCode = status;
	res.send({
		meta: meta,
		response: output
	});
};

module.exports.sendRsp = sendRsp;