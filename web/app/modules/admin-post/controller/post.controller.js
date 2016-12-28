'use strict';

const Boom = require('boom');
const util = require('util');
const Joi = require('joi');
const mongoose = require('mongoose');
const Post = mongoose.model('Post');
const _ = require('lodash');
exports.getAll = {
    handler: function(request, reply) {
        let config = request.server.configManager;
        let page = request.query.page || 1;
        let itemsPerPage =  config.get('web.paging.itemsPerPage');
        let numberVisiblePages = config.get('web.paging.numberVisiblePages');

        let options = {};
        if (request.query.keyword && request.query.keyword.length > 0) {
            let re = new RegExp(request.query.keyword, 'i');
            options.title = re;
        }
        Post.find(options).populate('category').lean().sort('-created').paginate(page, itemsPerPage, function(err, items, total) {
            if (err) {
                request.log(['error', 'list', 'post'], err);
                reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
            }
            let totalPage = Math.ceil(total / itemsPerPage);
            let dataRes = { status: 1, totalItems: total, totalPage: totalPage, currentPage: page, itemsPerPage: itemsPerPage, numberVisiblePages: numberVisiblePages, items: items };
            reply(dataRes);
        });

    }
}

exports.edit = {
    pre: [
        { method: getById, assign: 'post' }
    ],
    handler: function(request, reply) {
        let post = request.pre.post;
        if (post) {
            return reply(post);
        } else {
            reply(Boom.notFound('Post is not found'));
        }
    }
}

exports.save = {
    handler: function(request, reply) {
        let post = new Post(request.payload);
        let promise = post.save();
        promise.then(function(post) {
            reply(post);
        }).catch(function(err) {
            request.log(['error', 'post'], err);
            reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));

        });
    },
    description: 'Created post',
    tags: ['api'],
    plugins: {
        'hapi-swagger': {
            responses: { '400': { 'description': 'Bad Request' } },
            payloadType: 'form'
        }
    },
    validate: {
        payload: {
            title: Joi.string().required().description('Title'),
            teaser: Joi.string().description('Teaser'),
            content: Joi.string().required().description('Content'),
            status: Joi.number().required().description('Status'),
            slug: Joi.string().description('Slug'),
            category: Joi.any().description('Category'),
            feature: Joi.any().description('Feature'),
            thumb: Joi.any().description('Thumms'),
            image: Joi.any().description('Image'),
            attrs: Joi.any().description('Meta')

        }
    }
}

exports.update = {
    pre: [
        { method: getById, assign: 'post' }
    ],
    handler: function(request, reply) {
        let post = request.pre.post;
        post = _.extend(post, request.payload);
        let promise = post.save();
        promise.then(function(post) {
            reply(post);
        }).catch(function(err) {
            reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
        });
    },
    description: 'Update post',
    tags: ['api'],
    plugins: {
        'hapi-swagger': {
            responses: { '400': { 'description': 'Bad Request' } },
            payloadType: 'form'
        }
    },
    validate: {
        payload: {
            title: Joi.string().required().description('Title'),
            teaser: Joi.string().description('Teaser'),
            content: Joi.string().required().description('Content'),
            status: Joi.number().required().description('Status'),
            slug: Joi.string().description('Slug'),
            modified: Joi.date().required().description('Modified'),
            _id: Joi.string().required().description('MongoID'),
            category: Joi.any().description('Category'),
            feature: Joi.any().description('Feature'),
            thumb: Joi.any().description('Thumms'),
            image: Joi.any().description('Image'),
            attrs: Joi.any().description('Meta')

        }
    }
}
exports.delete = {
    pre: [
        { method: getById, assign: 'post' }
    ],
    handler: function(request, reply) {
        const post = request.pre.post;
        post.remove((err) => {
            return reply(post);
        });
    }
}

/**
 * Middleware
 */
function getById(request, reply) {
    const id = request.params.id || request.payload.id;
    let promise = Post.findOne({ '_id': id });
    promise.then(function(post) {
        reply(post);
    }).catch(function(err) {
        request.log(['error'], err);
        return reply.continue();
    })


}
