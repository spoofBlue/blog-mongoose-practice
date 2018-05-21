`use strict`;

const mongoose = require(`mongoose`);

const BlogPostSchema = mongoose.Schema({
        "title": {type: String},
        "content": {type: String},
        "author": {firstName : {type: String}, lastName : {type: String}}
});

BlogPostSchema.virtual(`fullName`).get(function() {
    return `${this.author.firstName} ${this.author.lastName}`.trim();
});

BlogPostSchema.methods.serialize = function() {
    return {
        title : this.title ,
        content : this.content ,
        author : this.fullName 
    };
};

const BlogPosts = mongoose.model(`blogposts`, BlogPostSchema);

module.exports = {BlogPosts};