'use strict';

const sycnES = global.ES_SYNC || false;
const _ = require('lodash');
const elasticsearch = require('elasticsearch');
const Bluebird = require('bluebird');

const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic')
const Schema = mongoose.Schema;

const SaleContactSchema = new Schema({
	/*===================Thông tin assign sale man===================*/
	_sale_usermember:{					// Sale member (1,1)
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	date_receive: Date,						//Ngày nhận contact				
	_sale_userconvert:{					// Sale convert (1,1)
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	note_saleman: String,				//Ghi chú khi bàn giao contact cho saleman
	note_cc: String,					//Ghi chú khi bàn giao CC
	/*End Thông tin assign sale man*/

	/*================Thông tin contact từ site cũ===================*/
	olduser_id: {
		type: Number,
	},
	oldteacher_id: {
		type: Number,
	},
	type: { // co phai la kid hay khong old field(kid)
		type: String,
		trim: true,
		enum: ['','kid', 'work']
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
	/*End Thông tin contact từ site cũ*/


	/*========================Info Level, Call content ========================*/
	call_info: {
		call_level: Number,		// Level cuoc goi
		call_status: String,	// trang thai cuoc goi
		call_quality: String,	// chat luong cuoc goi
		call_note: String,		// ghi chu cuoc goi
		recall_schedule: Date, 	// lich goi lai
		is_recall_schedule: {
			type:Boolean,
			default: false
		}, 	// check lich goi lai
		care_status: String, 	// trang thai cham soc
	},
	level_1: {
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
		learn_info: String
	},
	level_2: {
		type: {
			type: String,
			trim: true,
			enum: ['', 'kid', 'work'],
			default: ''
		},
		learner_demand: String,		//Nhu cầu học
		learner_level: String 		//Trình độ học viên
	},
	level_3: {
		accept_test: {
			type: Boolean,
			default: false
		},										//Đã chấp nhận test
		schedule_inteview: Date,				//Lịch test
	},
	level_4: {

		inteview_or_online: {					//1:inteview  2: online
			type: Number,
			default: 0
		}
	},
	level_5: {
		is_tested: {
			type: Boolean,
			default: false
		},										//Đã làm 2 bài test
		test_file: String
	},
	level_6: {
		received_distance: 	{
			type: Boolean,
			default: false
		}										//Đã nhận lộ trình học
	},
	level_7: {
		fee_partial: Number						//Học phí đã đóng 1 phần
	},
	level_8: {

		learn_begin_at: String,					//Thời gian muốn học
		teacher_request: String,				//Yêu cầu giáo viên
		money_finish: Number,					//Tiền đã chốt
		pay_type: {
			type: String,
			enum:['chuyenkhoan', 'tienmat']
		},
		bank: String,
		is_received_money: {
			type: Boolean,
			default: false
		}										//Đã nhận tiền
	},
	/*End Info Level, Call content */

	/*====================================Chốt sale====================================*/
	is_finish: {								//Đã chốt sale
		type: Boolean,
		default: false
	},
	date_assign_cc: Date						//Ngày bàn giao qua CC						
	/*End Chốt sale*/

},{
	timestamps: true
});

/*Tạo Elastic Search For Model*/
let defaultSetting = {
	defer: function () {return Bluebird.defer();}
};
let settings = _.merge({}, defaultSetting, global.ES_CONFIG);
let esClient = new elasticsearch.Client(settings);
SaleContactSchema.plugin(mongoosastic,{esClient: esClient});
let SaleContact  = mongoose.model('SaleContact', SaleContactSchema);

if(sycnES){
	/*Đồng bộ với colection đã tồn tại*/
	let stream = SaleContact.synchronize({}, {saveOnSynchronize: true})
	, count = 0;

	stream.on('data', function(err, doc){
		count++;
	});
	stream.on('close', function(){
		console.log('indexed ' + count + ' documents!');
	});
	stream.on('error', function(err){
		console.log(err);
	});
}

module.exports = SaleContact;