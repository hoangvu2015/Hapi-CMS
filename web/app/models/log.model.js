'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LogSchema = new Schema({
	_id_auth:{ 							// Người thực hiện.
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	type: {
		type: String,
		required: true,
		enum: ['assign_saleman']
	},
	content: {
		_id_contact: {
			type: Schema.Types.ObjectId,
			ref: 'SaleContact'
		},
		_id_user_dest:{
			type: Schema.Types.ObjectId,
			ref: 'User'
		},
		_id_user_src:{
			type: Schema.Types.ObjectId,
			ref: 'User'
		},
		desc: String,
	}
	// module: { 							//Thông tin module
	// 	name:{
	// 		type: String,
	// 		required: true,
	// 		enum: ['user', 'salecontact']
	// 	},					
	// 	type: {
	// 		type: String,
	// 		required: true,
	// 		enum: ['admin','web','api']
	// 	},
	// 	action: String,			//Hành động thực hiện log
	// 	desc: String,			//Mô tả hành động
	// 	url: String,			//Url đang log
	// },					
	// client: 							//Thông tin client log
	// {
	// 	ip: String,
	// 	os: String,
	// 	browser: String,
	// 	device: String
	// },
	// payload : {},//Object thông tin cần log.
},{
	timestamps: true
});

module.exports = mongoose.model('Log', LogSchema);
