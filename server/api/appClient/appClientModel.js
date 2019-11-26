'use strict';

import mongoose from 'mongoose';
var Schema = mongoose.Schema;

var AppClientSchema = new Schema({
	name: {
		type: String,
		required: true,
		unique: true
	},
	secret: {
		type: String,
		required: true
	},
	type: {
		type: Number,
		required: true	//1:'JSAPP', 2: 'WEBAPP', 3: 'M_IOS', 4: 'M_ANDROID'
	}
}, {
	timestamps: {
		createdAt: 'created_at',
		updatedAt: 'last_updated_at'
	}
});

AppClientSchema.index({
	name: 1
});

export default mongoose.model('AppClient', AppClientSchema);