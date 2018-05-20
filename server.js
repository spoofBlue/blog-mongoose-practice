
const express = require(`express`);
const morgan = require(`morgan`);


const BlogPost = require(`./model`);
const blogPostRouter = require(`./blogPostRouter`);

const app = express();

// Middleware
app.use(morgan(`common`));


let server;

function runServer() {
    const port = process.env.PORT || 8080;
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseurl, err => {
            if (err) {
                return reject(err);
            }
        });
        server = app.listen(port, () => {
            console.log(`Your app is listening on port ${port}`);
            resolve(server);
        })
        .on(`error`, err => {
            mongoose.disconnect();
            reject(err);
        });
    });
}

function closeServer() {
    return new Promise((resolve, reject) => {
        console.log('Closing server');
        mongoose.disconnect();
        server.close(err => {
            if (err) {
                reject(err);
                return;
            };
            resolve();
        });
    });
}


if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
    console.log("hello");
};


module.exports = {app, runServer, closeServer};