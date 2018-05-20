const uuid = require('uuid'); 
const mongoose = require(`mongoose`);

const BlogPostSchema = {
        "title": {type: String},
        "content": {type: String},
        "author": {type: String},
        "created": {type: String}
};


const BlogPost = mongoose.model(`Blogpost`, BlogPostSchema);
module.exports = {BlogPost};