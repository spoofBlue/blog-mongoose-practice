`use strict`

const chai = require(`chai`);
const chaiHttp = require(`chai-http`);
const faker = require(`faker`);
const mongoose = require(`mongoose`);
//const bodyParser = require(`bodyParser`);

const {app, runServer, closeServer} = require(`../server`);
const {BlogPosts} = require(`../model`);
const {TEST_DATABASE_URL} = require(`../config`);


chai.use(chaiHttp);

const expect = chai.expect;


function seedBlogPostData() {
    const seedData = [];
    for (let i=1; i<=10; i++) {
        seedData.push(generateBlogPost());
    }
    return BlogPosts.insertMany(seedData);
}

function generateBlogPost() {
    const sampleBlogPost = {
        "title": "something" ,
        "content": "lorem ipsum example" ,
        "author": {"firstName" : "Ralph", "lastName" : "Burgandy"} ,
        "created": "July 17th, 2032"
    };
    return sampleBlogPost;
}

function tearSeedDb() {
    console.log("bbye");
    console.warn(`Dropping database`);
    return mongoose.connection.dropDatabase();
}


describe(`Blog Post Integration API Test`, function() {
    before(function() {
        console.log("ello");
        return runServer(TEST_DATABASE_URL);
    });
    beforeEach(function() {
        return seedBlogPostData();
    });
    afterEach(function() {
        return tearSeedDb();
    });
    after(function() {
        return closeServer();
    });




    describe(`GET requests`, function() {

    });

    describe(`POST requests`, function() {

    });

    describe(`PUT requests`, function() {

    });

    describe(`DELETE requests`, function() {

    });
});