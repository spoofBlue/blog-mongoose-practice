`use strict`;

const mongoose = require(`mongoose`);

const BlogPostSchema = mongoose.Schema({
        "title": {type: String},
        "content": {type: String},
        "author": {type: String},
        "created": {type: String}
});

BlogPostSchema.virtual(`fullName`).get(function() {
    return `${this.author.firstName} ${this.author.lastName}`.trim();
});

BlogPostSchema.method.serialize = function() {
    return {
        title : this.title ,
        content : this.content ,
        author : this.fullName 
        //, created : this.created
    };
};

const BlogPost = mongoose.model(`Blogpost`, BlogPostSchema);

module.exports = {BlogPost};