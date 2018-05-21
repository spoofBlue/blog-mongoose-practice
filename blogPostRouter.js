
const express = require(`express`);
const bodyParser = require(`body-parser`);

const {BlogPosts} = require(`./model.js`);

// Further package accessibility
const router = express.Router();
const jsonParser = bodyParser.json();

router.get(`/`, (req, res) => {
    const filters = {};
    const queryableFields = [`title`, `content`, `author`];
    queryableFields.forEach(field => {
        if (req.query[field]) {
            filters[field] = new RegExp(req.query[field], 'g');
        }
    });
    BlogPosts
        .find(filters)
        .then(blogPosts => {
            res.status(200).json(blogPosts.map(blogpost => blogpost.serialize()));  
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({message :`Internal Server Error`});
        });
});

router.get(`/:id`, (req, res) => {
    BlogPosts
        .findById(req.params.id)
        .then(blogPost => {
            res.status(200).json(blogPost.serialize());  
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({message :`Internal Server Error`});
        });
});

/**
function hasBlogpostFields(req) {
    const requiredFields = [`title`, `content`, `author`];
    requiredFields.forEach(field => {
        console.log(req.body);
        if (!(field in req.body)) {
            const message = `The field ${field} is missing from the request.`;
            return message;
        }
        if (field === `author`) {
            const authorFields = [`firstName`, `lastName`];
            authorFields.forEach(authField => {
                console.log(req.body.author);
                if (!(authField in req.body.author)) {
                     const message = `The field author.${authField} is missing from the request.`;
                    return message;
                }
            });    
        }
    });
    return "All fields found.";
}
*/

router.post('/', (req, res) => {
    /**
     const message = hasBlogpostFields(req);
     if (message !== "All fields found.") {
        console.error(message);
        return res.status(400).send(message);
     }
    */
    const requiredFields = [`title`, `content`, `author`];
    requiredFields.forEach(field => {
        console.log(req.body);
        if (!(field in req.body)) {
            const message = `The field ${field} is missing from the request.`;
            console.error(message);
            return res.status(400).send(message);
        }
        if (field === `author`) {
            const authorFields = [`firstName`, `lastName`];
            authorFields.forEach(authField => {
                console.log(req.body.author);
                if (!(authField in req.body.author)) {
                    const message = `The field author.${authField} is missing from the request.`;
                    console.error(message);
                    return res.status(400).send(message);
                }
            });    
        }
    });
    BlogPosts
        .create({
            title : req.body.title ,
            content : req.body.content ,
            "author[firstName]" : req.body.author.firstName ,
            "author[lastName]" : req.body.author.lastName
        })
        .then(blogpost => res.status(201).json(blogpost.serialize()))
        .catch(err => {
            const message = `Failed to create blogpost`;
            console.log(err);
            return res.status(400).send(message);
        });
});

router.put(`/:id`, (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const msg = `${req.params.id} and ${req.body.id} not the same`;
        return res.status(400).json({message : msg});
    }

    const toUpdate = {};
    const updateableFields = [`title`, `content`, `author`];
    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });

    BlogPosts
    .findByIdAndUpdate(req.params.id, {$set : toUpdate})
    .then(blogpost => res.status(204).end())
    .catch(error => {
        const message = `Failed to update blogpost`;
        console.log(error);
        return res.status(400).send(message);
    });
});

router.delete(`/:id`, (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const msg = `${req.params.id} and ${req.body.id} not the same`;
        return res.status(400).json({message : msg});
    }

    BlogPosts
    .findByIdAndRemove(req.params.id)
    .then(blogposts => res.status(204).end())
    .catch(error => {
        const message = `Failed to delete blogpost`;
        console.log(error);
        return res.status(400).send(message);
    });
});



router.use('*', function (req, res) {
    res.status(404).json({ message: 'Not Found' });
});

module.exports = router;