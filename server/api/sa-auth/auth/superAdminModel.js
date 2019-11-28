'use strict';

import mongoose from 'mongoose';
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var crypto = require('crypto');

var SuperAdminSchema = new Schema({
	username: {
		type: String,
		lowercase: true,
		unique: true,
		required: true
	},
	email: {
		type: String,
		lowercase: true,
		unique: true,
		required: true
	},
	role: {
		type: Number,
		default: 4
	},
	image_url: {
		type: String
	},
	hashed_password: {
		type: String,
		required: true
	},
	salt: {
		type: String,
		required: true
	},
	tokens: [{
		clientId: {
			type: ObjectId,
			ref: 'AppClient'
		},
		refreshToken: {
			type: String
		}
	}],
	deleted: {
		type: Boolean,
		default: false
	}
}, {
	timestamps: {
		createdAt: 'created_at',
		updatedAt: 'last_updated_at'
	}
});

SuperAdminSchema.index({
	username: 1,
	email: 1
});


/**
 * Virtuals
 */
SuperAdminSchema.virtual('password').set(function(password) {
	this._password = password;
	this.salt = this.makeSalt();
	this.hashed_password = this.encryptPassword(password);
}).get(function() {
	return this._password;
});

// Validate empty email
SuperAdminSchema.path('username').validate(function(username) {
	return username.length;
}, 'username cannot be blank');

// Validate empty email
SuperAdminSchema.path('email').validate(function(email) {
	return email.length;
}, 'email cannot be blank');

// Validate empty password
SuperAdminSchema.path('hashed_password').validate(function(hashedPassword) {
	return hashedPassword.length;
}, 'Password cannot be blank');


var validatePresenceOf = function(value) {
	return value && value.length;
};

/**
 * Methods
 */
SuperAdminSchema.methods = {
	/**
	 * Authenticate - check if the passwords are the same
	 * 
	 * @param {String}
	 *            plainText
	 * @return {Boolean}
	 * @api public
	 */
	authenticate: function(plainText) {
		return this.encryptPassword(plainText) === this.hashed_password;
	},

	/**
	 * Make salt
	 * 
	 * @return {String}
	 * @api public
	 */
	makeSalt: function() {
		return crypto.randomBytes(16).toString('base64');
	},

	/**
	 * Encrypt password
	 * 
	 * @param {String}
	 *            password
	 * @return {String}
	 * @api public
	 */
	encryptPassword: function(password) {
		if (!password || !this.salt)
			return '';
		var saltWithUsername = new Buffer(this.salt + this.email.toString('base64'), 'base64');
		return crypto.pbkdf2Sync(password, saltWithUsername, 10000, 64, 'sha1').toString('base64');
	}
};

export default mongoose.model('SuperAdmin', SuperAdminSchema);