var express = require('express');
var router = express.Router();
var Book = require('../models/book')
var Comment = require('../models/comment')
var auth = require('../middlewares/auth');
const category = require('../models/category');
const cart = require('../models/cart');


//list of all books
router.get('/', function(req, res, next) {
    Book.find({}, (err, books) => {
        if(err) return next(err);
        res.json({books});
    });
});

//get single book
router.get('/:id', (req, res, next) => {
    var id = req.params.id;
    Book.findById(id, (err, book) => {
        if(err) return next(err);
        res.json({book});
    });
});


//create book
router.post('/',  auth.verifyToken, (req, res, next) => {
    Book.create(req.body, (err, book) => {
        if(err) return next(err);
        res.json(`{created: ${book}}`);
    });
});

//update book
router.put('/:id', (req, res, next) => {
    var id = req.params.id;
    Book.findById(id, (err, book) => {
        if(err) return next(err);
        if(book.author == req.user){
            Book.findByIdAndUpdate(id, {$set: req.body}, (err, book) => {
                if(err) return next(err);
                res.json(`{updated: ${book}}`);
            });
        }else{
            res.json({error: "you cant edit anyone's data"});
        }
    });
});

//delete book
router.delete('/:id', (req, res, next) => {
    var id = req.params.id;
    Book.findByIdAndDelete(id, (err, book) => {
        if(err) return next(err);
        res.json(`{deleted: ${book}}`)
    });
});


//view all comments for specific book
router.get('/:id/comments', (req, res, next) => {
    var id = req.params.id;
    Comment.find({book: id}, (err, comments) => {
        if(err) return next(err);
        res.json({comments});
    });
});


//add category
router.post('/:id/addcategory', auth.verifyToken, (req, res, next) => {
    var id = req.params.id;
    req.body.book = id;
    category.create(req.body, (err, category) => {
        if(err) return next(err);
        res.json({category});
    });
});

//create comment
router.post('/:id/addcomment', auth.verifyToken, (req, res, next) => {
    var id = req.params.id;
    req.body.book = id;
    Comment.create(req.body, (err, comment) => {
        if(err) return next(err);
        res.json(`{created: ${comment}}`);
    });
});

//update comment
router.put('/comments/:id',  auth.verifyToken,(req, res, next) => {
    var id = req.params.id;
    Comment.findById(id, (err, comment) => {
        if(comment.author == req.user){
            Comment.findByIdAndUpdate(id, {$set: req.body}, (err, comment) => {
                if(err) return next(err);
                res.json(`{updated: ${comment}}`);
            });
        }else{
            res.json({error: "you cant edit anyone's data"})
        }
    });
});

//delete comment
router.delete('/comments/:id', (req, res, next) => {
    var id = req.params.id;
    Comment.findByIdAndDelete(id, (err, comment) => {
        if(err) return next(err);
        res.json(`{deleted: ${comment}}`)
    });
});


//add book to cart
router.put('/:id/addtocart', auth.verifyToken, (req, res, next) => {
    var id = req.params.id;
    cart.findOneAndUpdate({userId: req.user.id}, {$set: {$push: {book: id}}}, (err, cart) => {
        if(err) next(err);
        res.json({success: 'book added to cart'});
    });
});

//remove book from cart
router.put('/:id/removefromcart', auth.verifyToken, (req, res, next) => {
    var id = req.params.id;
    cart.findOneAndUpdate({userId: req.user.id}, {$set: {$pull: {book: id}}}, (err, cart) => {
        if(err) return next(err);
        res.json({success: 'book removed from cart'});
    });
});



module.exports = router;
