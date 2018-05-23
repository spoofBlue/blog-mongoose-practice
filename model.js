`use strict`;

const mongoose = require(`mongoose`);

const BlogPostSchema = mongoose.Schema({
        "title": {type: String, required : true},
        "content": {type: String},
        "author": {firstName : {type: String}, lastName : {type: String}}
        "created": {type: Date, default: Date.now}
});

BlogPostSchema.virtual(`fullName`).get(function() {
    return `${this.author.firstName} ${this.author.lastName}`.trim();
});

BlogPostSchema.methods.serialize = function() {
    return {
        id : this._id ,
        title : this.title ,
        content : this.content ,
        author : this.fullName ,
        created : this.created
    };
};

const BlogPosts = mongoose.model(`blogposts`, BlogPostSchema);

module.exports = {BlogPosts};