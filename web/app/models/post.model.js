'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var slug = require('slug');
/**
 * Post Schema
 */
var PostSchema = new Schema({
    title: {
        type: String,
        default: '',
        required: 'Please fill title',
        trim: true
    },
    slug: {
        type: String,
        default: '',
        trim: true
    },
    teaser: {
        type: String,
        default: '',
        trim: true
    },

    image: {
        type: String,
        default: '',
        trim: true
    },
    thumb: {
        type: String,
        default: '',
        trim: true
    },
    content: {
        type: String,
        default: '',
        required: 'Please fill content',
        trim: true
    },
    feature: {
        type: Number,
        default: 0
    },
    status: {
        type: Number,
        default: 1
    },
    created: {
        type: Date,
        default: Date.now
    },
    modified: {
        type: Date
    },
    category: [{
        type: Schema.ObjectId,
        ref: 'Category'
    }],
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    attrs: {
        title: String,
        description: String,
        keyword: String
    }
});
PostSchema.index({ slug: 1 });

PostSchema.pre('update', function(next) {
    if (!this.slug) {
        this.slug = slug(this.title);
    }
    this.slug = this.slug.toLowerCase();
    this.modified = Date.now();
    next();
});
PostSchema.pre('save', function(next) {
    if (!this.slug) {
        this.slug = slug(this.title);
    }
    this.slug = this.slug.toLowerCase();
    this.modified = Date.now();
    next();
});
module.exports = mongoose.model('Post', PostSchema);
