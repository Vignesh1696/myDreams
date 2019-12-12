'use strict';

import mongoose from 'mongoose';
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
	user: {
		type: ObjectId,
		ref:"User"
		required: true,
	},
	comment:{
		type:String
	},
	post:{
		type: ObjectId,
		ref:"Post"
		required: true,
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


export default mongoose.model('Comment', CommentSchema);