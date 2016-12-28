'use strict';

const Handlebars = require('handlebars');

const helpers = {
    aboutLink: function () {
        return '/about';
    },
    contactLink: function () {
        return '/contact';
    },
    postListLink: function () {
        return '/posts';
    },
    postCategoryLink : function(category){
        return `/posts/${category.slug}`;
    },
    postDetailLink: function (post) {
        return `/post/${post.slug}`;
    },
    
    json: function(context){
        return JSON.stringify(context);
    },
    formatDate: function(date) {
        return moment(date).format('DD/MMYYYY');
    },
    if_eq: function(a, b, opts) {
        if(a == b) // Or === depending on your needs
            return opts.fn(this);
        else
            return opts.inverse(this);
    }
};

for (let key in helpers) {
    Handlebars.registerHelper(key, helpers[key]);
}
module.exports = {};
