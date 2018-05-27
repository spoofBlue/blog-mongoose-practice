`use strict`;

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
    console.info('Seeding blog post data');
    const seedData = [];
    for (let i=1; i<=10; i++) {
        seedData.push(generateBlogPost());
    }
    return BlogPosts.insertMany(seedData);
}

function generateBlogPost() {
    const sampleBlogPost = {
        "title": generateTitle() ,
        "content": generateContent() ,
        "author": generateAuthor() 
    };
    return sampleBlogPost;
}

function generateTitle() {
    const titles = ["Catch 42", "Guilt and Greed", "The Final Straw", "This Is America", "Repost"];
    return titles[Math.floor(Math.random() * titles.length)];
}

function generateContent() {
    const contents = ["I've said it before, and I'll say it again..." ,
"Does this dress make me look phat?" ,
"She looked at me for 2 seconds. Any advice?" ,
"The doctor says it's normal, but I think the government is paying him off."
];
    return contents[Math.floor(Math.random() * contents.length)];
}

function generateAuthor() {
    const firstNames = ["Bearded", "Donald", "An Informed", "Lebron", "Avocado"];
    const lastNames = ["Brian", "Trump", "Imposter", "James", "Duck"];
    return { 
        firstName: firstNames[Math.floor(Math.random() * firstNames.length)] ,
        lastName: lastNames[Math.floor(Math.random() * lastNames.length)]
    };
}

function tearSeedDb() {
    console.warn(`Dropping database`);
    return mongoose.connection.dropDatabase();
}


describe(`Blog Post Integration API Test`, function() {
    before(function() {
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
        it('should return all existing blog posts', function() {
            let res;
            return chai.request(app)
                .get('/blog-posts')
                .then(function(_res) {
                     res = _res;
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.be.an(`array`);
                    expect(res.body).to.have.lengthOf.at.least(1);
                    return BlogPosts.count();
            })
            .then(function(count) {
                expect(res.body).to.have.lengthOf(count);
            });
        });

        it(`should have blog posts with required fields`, function() {
            let resBlogpost;
            return chai.request(app)
                .get(`/blog-posts`)
                .then(function(res) {
                    res.body.forEach(function(post) {
                        expect(post).to.include.keys(`title`,`content`,`author`,`id`);
                    });
                    resBlogPost = res.body[0];
                    return BlogPosts.findById(resBlogPost.id);
                })
                .then(function(seedPost) {
                    expect(resBlogPost.title).to.equal(seedPost.title);
                    expect(resBlogPost.content).to.equal(seedPost.content);
                    expect(resBlogPost.author).to.contain(seedPost.author.firstName);
                    expect(resBlogPost.author).to.contain(seedPost.author.lastName);
                    expect(resBlogPost.id).to.equal(seedPost.id);
                });
        });

        it(`should get a specific blog post using an id`, function() {
            let gettingPost;

            return BlogPosts.findOne()
                .then(function(resPost) {
                    gettingPost = resPost;
                    return chai.request(app).get(`/blog-posts/${gettingPost.id}`);
                })
                .then(function(res) {
                    expect(res.body.title).to.equal(gettingPost.title);
                    expect(res.body.contnet).to.equal(gettingPost.contnet);
                    expect(res.body.id).to.equal(gettingPost.id);
                    expect(res.body.author).to.contain(gettingPost.author.firstName);
                    expect(res.body.author).to.contain(gettingPost.author.lastName);

                    return BlogPosts.findById(res.body.id)
                })
                .then(function(seedPost) {
                    expect(gettingPost.title).to.equal(seedPost.title);
                    expect(gettingPost.content).to.equal(seedPost.content);
                    expect(gettingPost.id).to.equal(seedPost.id);
                    expect(gettingPost.author.firstName).to.equal(seedPost.author.firstName);
                    expect(gettingPost.author.lastName).to.equal(seedPost.author.lastName);
                });
        });

        it(`should fail to make a get request for a non-existant blog post`, function() {
            let notBlogPostID = `1`;

            return chai.request(app).get(`/blog-posts/${notBlogPostID}`)
                .then(function(res) {
                    expect(res).to.have.status(500);
                    expect(res.body.message).to.equal(`Internal Server Error`); // Too specific?
                    return BlogPosts.findById(notBlogPostID);
                })
                .then(function(res) {
                    console.log(`test should never reach this point 2`);
                    expect(res.body).to.equal(`Tester, this function should not reach me!`);
                })
                .catch(function(error) {
                    expect(error.name).to.equal(`CastError`);
                });
        });
    });

    describe(`POST requests`, function() {
        it(`should return the posted blog post`, function() {
            const newPost = generateBlogPost();

            let res;
            return chai.request(app)
                .post(`/blog-posts`)
                .send(newPost)
                .then(function(_res) {
                    res = _res;
                    expect(res).to.have.status(201);
                    expect(res).to.be.json;
                    expect(res.body).to.be.a('object');
                    expect(res.body).to.include.keys(`title`,`content`,`author`,`id`);

                    // Comparing response body with request.
                    expect(res.body.title).to.equal(newPost.title);
                    expect(res.body.id).to.not.be.null;
                    expect(res.body.content).to.equal(newPost.content);
                    expect(res.body.author).to.contain(newPost.author.firstName);
                    expect(res.body.author).to.contain(newPost.author.lastName);
                    return BlogPosts.findById(res.body.id);
                })
                .then(function(seedPost) {
                    // Comparing response body with newly-seeded data.
                    expect(res.body.title).to.equal(seedPost.title);
                    expect(res.body.content).to.equal(seedPost.content);
                    expect(res.body.author).to.contain(seedPost.author.firstName);
                    expect(res.body.author).to.contain(seedPost.author.lastName);
                    expect(res.body.id).to.equal(seedPost.id);
                });
        });

        it(`should fail to make a post request when required fields aren't in request`, function() {
            const badPost = {
                author : "George Clooney",
                age : "27"
            }

            return chai.request(app)
                .post(`/blog-posts`)
                .send(badPost)
                .then(function(res) {
                    expect(res).to.have.status(400);
                })
                .catch(function(error) {
                    expect(error).to.have.status(400);
                });
        })
    });

    describe(`PUT requests`, function() {
        it(`should change the data on one item as specified`, function() {
            const updatingPost = {
                "title": `OMG we were wrong!!`,
                "content": `Wait until you hear about the 12 things we've changed!`,
            }

            return BlogPosts.findOne()
                .then(function(resPost) {
                    updatingPost.id = resPost.id;
                    return chai.request(app).put(`/blog-posts/${updatingPost.id}`)
                    .send(updatingPost)
                    .then(function(res) {
                        expect(res).to.have.status(204);
                        return BlogPosts.findById(updatingPost.id)
                    })
                    .then(function(seedPost) {
                        expect(updatingPost.title).to.equal(seedPost.title);
                        expect(updatingPost.content).to.equal(seedPost.content);
                        expect(resPost.author.firstName).to.equal(seedPost.author.firstName);
                        expect(resPost.author.lastName).to.equal(seedPost.author.lastName);
                        expect(updatingPost.title).to.not.equal(resPost.title);
                        expect(updatingPost.content).to.not.equal(resPost.content);
                    });
                    
                });
        });

        it(`should fail to make a put request due to an invalid key in request`, function() {
            const notBlogPostID = `1`;
            const updatingPost = {
                "title": `OMG we were wrong!!`,
                "content": `Wait until you hear about the 12 things we've changed!`,
            }

            return BlogPosts.findOne()
                .then(function(resPost) {
                    updatingPost.id = resPost.id;
                    return chai.request(app).put(`/blog-posts/${notBlogPostID}`)
                    .send(updatingPost)
                    .then(function(res) {
                        expect(res).to.have.status(400);
                        return BlogPosts.findById(notBlogPostID)
                    })     
                    .then(function(res) {
                        expect(res.body).to.equal(`Tester, this function should never reach here.`);
                    })
                    .catch(function(error) {
                        console.log(error.body);  
                        expect(error.name).to.equal(`CastError`);
                    });
                });
        })
    });

    describe(`DELETE requests`, function() {

        it("should remove a choosen post", function() {
            let deletingPost;

            return BlogPosts.findOne()
                .then(function(resPost) {
                    deletingPost = resPost;
                    return chai.request(app).delete(`/blog-posts/${deletingPost.id}`);
                })
                .then(function(res) {
                    expect(res).to.have.status(204);
                    return BlogPosts.findById(deletingPost.id)
                })
                .then(function(seedPost) {
                    expect(seedPost).to.be.null;
                });
            
        });
    });
});