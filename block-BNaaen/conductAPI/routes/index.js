var express = require('express');
var router = express.Router();
var Article = require('../models/article');

/* GET home page. */
router.get('/tags', function(req, res, next) {
  Article.distinct('tags').exec((err, tags) => {
    res.status(200).json({tags: tags})
  });
});

module.exports = router;
