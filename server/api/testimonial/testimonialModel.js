'use strict';

import mongoose from 'mongoose';
var Schema = mongoose.Schema;

var TestimonialSchema = new Schema({
	user: {
		type: ObjectId,
		ref:"User"
		required: true,
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


export default mongoose.model('Testimonial', TestimonialSchema);