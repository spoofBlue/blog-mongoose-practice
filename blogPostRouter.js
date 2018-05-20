
const express = require(`express`);
const bodyParser = require(`body-parser`);

const {BlogPosts} = require(`./model.js`);

// Further package accessibility
const router = express.Router();
const jsonParser = bodyParser.json();


module.exports = router;