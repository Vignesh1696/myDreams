'use strict';

import mongoose from 'mongoose';
var Schema = mongoose.Schema;

var CategorySchema = new Schema({
	name: {
		type: String,
		required: true,
		unique: true
	},
	desc:{
		type:String
	},
	deleted:{
		type:Boolean,
		default:false
	}
}, {
	timestamps: {
		createdAt: 'created_at',
		updatedAt: 'last_updated_at'
	}
});

CategorySchema.index({
	name: 1
});

export default mongoose.model('CategorySchema', CategorySchema);