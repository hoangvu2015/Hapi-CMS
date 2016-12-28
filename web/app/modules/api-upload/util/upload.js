'use strict';

const Boom = require('boom');
// const Joi = require('joi');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const Promise = require("bluebird");

module.exports = {
	uploadFile: uploadFile,
};

function uploadFile(request){
	return new Promise(function(resolve, reject){
		var configManager = request.server.configManager;
        var data = request.payload;

		storage(request, function (filename, uploadPath) {
			var file = fs.createWriteStream(uploadPath);
			file.on('error', function (err) {
				request.log(['error', 'upload'], err);
				return reject(Boom.badRequest(err));
			});
			data.file.pipe(file);
			data.file.on('end', function (err) {
				if (err) {
					request.log(['error', 'upload'], err);
					return reject(err);
				}
				var fileInfo = {
					filename: filename
				};
				return resolve(fileInfo);
			});
		});
	});
}

//Tạo tên file và path upload
var storage = function (request, cb) {
	var data = request.payload;
    var name = (data.prefix || 'file') + '_' + Date.now() + '.' + getFileExt(data.file.hapi.filename);//data.file.hapi.filename;
    var uploadPath = path.join(configManager.get('web.upload.path'), name);
    if (data.type) {
    	uploadPath = path.join(configManager.get('web.upload.path'), data.type, name);
    	var exist = fs.access(uploadPath, fs.constants.R_OK, (err) => {
    		if (!err) {
    			/*nếu đã có file thì...(tạo file với tên mới)*/
                // name = data.prefix + '_' + Date.now() + '.' + getFileExt(name);
                uploadPath = path.join(configManager.get('web.upload.path'), data.type, name);
            }

            /*tạo folder nếu chưa có*/
            if (!fs.existsSync(path.join(configManager.get('web.upload.path'), data.type))){
            	mkdirp(path.join(configManager.get('web.upload.path'), data.type), function (err) {
            		if (err) 
            			console.error(err)
            		else console.log('pow!')
            	});
            }
            cb(name, uploadPath);
        });

    } else {
    	var exist = fs.access(uploadPath, fs.constants.R_OK, (err) => {
    		if (!err) {
    			/*nếu đã có file thì...(tạo file với tên mới)*/
                // name = data.prefix + '_' + Date.now() + '.' + getFileExt(name);
                uploadPath = path.join(configManager.get('web.upload.path'), name);
            }
            /*tạo folder nếu chưa có*/
            if (!fs.existsSync(configManager.get('web.upload.path'))){
            	fs.mkdirSync(configManager.get('web.upload.path'));
            	mkdirp(configManager.get('web.upload.path'), function (err) {
            		if (err) 
            			console.error(err)
            		else console.log('pow!')
            	});
            }
            cb(name, uploadPath);
        });
    }
}

//get file extension
var getFileExt = function (fileName) {
    var fileExt = fileName.split(".");
    if (fileExt.length === 1 || (fileExt[0] === "" && fileExt.length === 2)) {
        return "";
    }
    return fileExt.pop();
};
//get file upload name - without extension
var getFileName = function (fileName) {
    return fileName.substring(0, fileName.lastIndexOf('.'));
};

var fileValidate = function (fileName, allowExts, cb) {
    var allowExts = allowExts.split(',');
    allowExts = allowExts.map(function(item){
        return item.trim();
    });
    var fileExt = getFileExt(fileName).toLowerCase();
    if (allowExts.indexOf(fileExt) > -1) {
        cb(null, true);
    }
    cb(null, false);
};