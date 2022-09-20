var express = require('express');
var router = express.Router();
var Book = require('../models/book')

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
router.post('/', (req, res, next) => {
    Book.create(req.body, (err, book) => {
        if(err) return next(err);
        res.json(`{created: ${book}}`);
    });
});

//update book
router.put('/:id', (req, res, next) => {
    var id = req.params.id;
    Book.findByIdAndUpdate(id, {$set: req.body}, (err, book) => {
        if(err) return next(err);
        res.json(`{updated: ${book}}`);
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






module.exports = router;
