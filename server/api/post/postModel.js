'use strict';

import mongoose from 'mongoose';
var Schema = mongoose.Schema;

var PostSchema = new Schema({
	user: {
		type: ObjectId,
		ref:"User"
		required: true,
	},
	desc:{
		type:String
	},
	images:{
		type:String
	},
	vedio:{
		type:String
	},
	like_users: [{
		type: ObjectId,
		ref: "User"
	}],
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


export default mongoose.model('Post', PostSchema);