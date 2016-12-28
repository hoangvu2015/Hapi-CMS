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
	_sale_userconvert:{					// Sale convert (1,1)
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	date_assign_saleman: {				//Ngày bàn giao qua saleman
		type: Date,
		default: Date.now
	},			
	note_saleman: String,				//Ghi chú khi bàn giao contact cho saleman
	/*===================End Thông tin assign sale man===================*/

	/*====================================Thông tin chốt sale====================================*/
	is_finish: {								//Đã chốt sale
		type: Boolean,
		default: false
	},
	date_assign_cmd: Date,						//Ngày bàn giao qua CMD		
	note_cmd: String,					//Ghi chú khi bàn giao CMD
	/*====================================End Chốt sale==================================*/

	/*========================Call content ========================*/
	call_info: {
		call_level: {
			type: Number,
			default: 0
			},					// Level cuoc goi
			call_status: {
				type: String,
				default: ''
			},					// trang thai cuoc goi
		call_quality: String,	// chat luong cuoc goi
		call_note: String,		// ghi chu cuoc goi
		recall_schedule: Date, 	// lich goi lai
		is_recall_schedule: {
			type:Boolean,
			default: false
		}, 	// check lich goi lai
		care_status: String, 	// trang thai cham soc
		history:[{
			_id: {
				type: Schema.Types.ObjectId, 
				default: function () { return mongoose.Types.ObjectId()} 
			},
			call_level: Number,
			call_status: String,
			call_quality: String,
			call_note: String,
			recall_schedule: Date,
			is_recall_schedule: {
				type:Boolean,
				default: false
			},
			care_status: String,
			createdAt: {
				type: Date,
				default: Date.now,
			}
		}]
	},
	/*========================END Call content ========================*/

	/*========================Info Level ========================*/
	level_1: {
		olduser_id: {
			type: Number,
		},
		oldteacher_id: {
			type: Number,
		},
		email: {
			type: String,
			trim: true,
			unique: 'Email already exists',
			index: true, 
			sparse: true,
			// required: [true, 'Please enter email address'],
			match: [/.+\@.+\..+/, 'Please fill a valid email address']
		},
		skype: {
			type: String,
			trim: true,
		},
		name:String,
		name_kid: String,
		phone: {
			type: String,
			unique: 'Phone already exists',
			index: true, 
			sparse: true,
		},
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
		learn_begin_at: String,					//Thời gian muốn học
		teacher_request: String,				//Yêu cầu giáo viên
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
		money_finish: {
			type: Number,
			required: true,
			default: 0
		},					//Tiền đã chốt
		pay_type: {
			type: String,
			enum:['chuyenkhoan', 'tienmat']
		},
		bank: String,
		is_received_money: {
			type: Boolean,
			default: false
		},										//Đã nhận tiền
		history:[{
			_sale_usermember: Schema.Types.ObjectId,
			type: {
				type: String,
				trim: true,
				enum: ['kid', 'work'],
				default: 'work'
			},
			_id: {
				type: Schema.Types.ObjectId, 
				default: function () { return mongoose.Types.ObjectId()} 
			},
			money_finish: Number,					//Tiền đã chốt
			pay_type: {
				type: String,
				required: true,
				enum:['chuyenkhoan', 'tienmat']
			},
			bank: String,
			is_received_money: {
				type: Boolean,
				default: false
			},
			createdAt: {
				type: Date,
				default: Date.now,
			}
		}]
	},
	/*End Info Level */
	dup: {
		type: Boolean,
		default: false
	},
	eviction: {
		type: Boolean,
		default: false
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
		console.log('SaleContact indexed ' + count + ' documents!');
	});
	stream.on('error', function(err){
		console.log(err);
	});
}

module.exports = SaleContact;