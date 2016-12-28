'use strict';

const sycnES = global.ES_SYNC || false;
const _ = require('lodash');
const elasticsearch = require('elasticsearch');
const Bluebird = require('bluebird');
const mongoosastic = require('mongoosastic')

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Bcrypt = require('bcrypt');

const SALT_LENGTH = 9;

var validateLocalStrategyProperty = function (property) {
	return ((this.provider !== 'local' && !this.updated) || property.length);
};

var validateLocalStrategyPassword = function (password) {
	return (this.provider !== 'local' || (password && password.length > 5));
};

var UserSchema = new Schema({
	name: {
		type: String,
		trim: true,
		validate: [validateLocalStrategyProperty, 'Please fill in your name']
	},
	email: {
		type: String,
		trim: true,
		unique: 'Email already exists',
		validate: [validateLocalStrategyProperty, 'Please fill in your email'],
		match: [/.+\@.+\..+/, 'Please fill a valid email address']
	},
	password: {
		type: String,
		validate: [validateLocalStrategyPassword, 'Password should be longer']
	},
	activeToken: {
		type: String,
		default: '',
		trim: true,
	},
	activeExpires: {
		type: Date
	},
	provider: {
		type: String,
		required: 'Provider is required'
	},
	providerData: {},
	additionalProvidersData: {},
	roles: {
		type: [{
			type: String,
			enum: ['user', 'super-admin', 'admin', 'sale']
		}],
		default: ['user']
	},
	status: {
		type: Boolean,
		default: true
	},
	resetPasswordToken: {
		type: String
	},
	resetPasswordExpires: {
		type: Date
	},
	deletedAt: Date,
	// Extend user sale
	saleman: {
		active: {
			type: Boolean,
			default: false
		},
		types: [{
			type: String,
			enum: ['kid', 'work']
		}],
		manager: {
			type: Boolean,
			default: false
		}
	}
},{
	timestamps: true
});
/******************************************************************
Methods
*******************************************************************/
UserSchema.methods = {
	hashPassword: function (password, callback) {
		Bcrypt.hash(password, SALT_LENGTH, callback);
	},
	compare: function (password, callback) {
		Bcrypt.compare(password, this.password, callback);
	}
};

/*Tạo Elastic Search For Model*/
let defaultSetting = {
	defer: function () {return Bluebird.defer();}
};
let settings = _.merge({}, defaultSetting, global.ES_CONFIG);
let esClient = new elasticsearch.Client(settings);
UserSchema.plugin(mongoosastic,{esClient: esClient});
let User  = mongoose.model('User', UserSchema);

if(sycnES){
	/*Đồng bộ với colection đã tồn tại*/
	let stream = User.synchronize({}, {saveOnSynchronize: true})
	, count = 0;

	stream.on('data', function(err, doc){
		count++;
	});
	stream.on('close', function(){
		console.log('User indexed ' + count + ' documents!');
	});
	stream.on('error', function(err){
		console.log(err);
	});
}
module.exports = User;