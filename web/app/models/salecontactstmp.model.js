'use strict';

const sycnES = global.ES_SYNC || false;
const _ = require('lodash');
const elasticsearch = require('elasticsearch');
const Bluebird = require('bluebird');

const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic')
const Schema = mongoose.Schema;

const SaleContactTmpSchema = new Schema({
	
	/*===================Thông tin assign sale man===================*/
	// _sale_usermember:{					// Sale member (1,1)
	// 	type: Schema.Types.ObjectId,
	// 	ref: 'User'
	// },
	// date_receive: Date,						//Ngày nhận contact				
	// _sale_userconvert:{					// Sale convert (1,1)
	// 	type: Schema.Types.ObjectId,
	// 	ref: 'User'
	// },
	// note_saleman: String,				//Ghi chú khi bàn giao contact cho saleman
	// note_cc: String,					//Ghi chú khi bàn giao CC
	/*End Thông tin assign sale man*/


	/*================NEW===================*/

	email: {
		type: String,
		trim: true,
		// required: [true, 'Please enter email address'],
		match: [/.+\@.+\..+/, 'Please fill a valid email address']
	},
	skype: {
		type: String,
		trim: true,
	},
	name:String,
	name_kid: String,
	phone: String,
	phone2: String,
	age: String,
	source_contact: {	//Nguồn contact
		type:String,
		default: 'MTO'
	},		
	career: String,
	dob: Date,			//Ngày Sinh
	address: String,
	district: String,	// Huyện
	province: String,	//Tỉnh
	learn_info: String,
	type: { 			//Loại contacts là kid hay work old field(kid)
		type: String,
		trim: true,
		enum: ['','kid', 'work']
	},
	teacher_request: String,	//Yêu cầu giáo viên (teacher_like)

	olduser_id: {
		type: Number,
	},
	oldteacher_id: {
		type: Number,
	},

	utm_code: { // tracking
		utm_source: String,
		utm_campaign: String,
		refererhostname: String,
	},
	info_client: { //Thong tin phia nguoi dung (ip, browser, device)
		ip: String,
		browser: String,
		device: String
	},
	newly: {				//trạng thái mới (để xác định contacts nào đã đc chia rồi)
		type: Boolean,
		default: true
	},
},{
	timestamps: true
});

/*Tạo Elastic Search For Model*/
let defaultSetting = {
	defer: function () {return Bluebird.defer();}
};
let settings = _.merge({}, defaultSetting, global.ES_CONFIG);
let esClient = new elasticsearch.Client(settings);
SaleContactTmpSchema.plugin(mongoosastic,{esClient: esClient});
let SaleContactTmp  = mongoose.model('SaleContactTmp', SaleContactTmpSchema);

if(sycnES){
	/*Đồng bộ với colection đã tồn tại*/
	let stream = SaleContactTmp.synchronize({}, {saveOnSynchronize: true})
	, count = 0;

	stream.on('data', function(err, doc){
		count++;
	});
	stream.on('close', function(){
		console.log('SaleContactTmp indexed ' + count + ' documents!');
	});
	stream.on('error', function(err){
		console.log(err);
	});
}

module.exports = SaleContactTmp;