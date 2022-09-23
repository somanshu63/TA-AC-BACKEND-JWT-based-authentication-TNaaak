var express = require('express');
var router = express.Router();
var Article = require('../models/article');
var auth = require('../middlewares/auth');
const User = require('../models/user');
var Comment = require('../models/comment')

//get articles
router.get('/', auth.optional, function(req, res, next) {
    var {tag, author, favorited, limit, offset} = req.query;
    var lim, skip;
    var query = {}
    var array =[];

    if(tag){
        query.taglist = tag;
    }
    if(author){
        User.findOne({username: author}, (err, user) => {
            if(err) return next(err);
            query.author = user.id;
        });
    }
    if(favorited){
        User.findOne({username: author}, (err, user) => {
            if(err) return next(err);
            query.favorited = user.id;
        });
    }

    if(limit){
        lim = limit
    }else{
        lim = 20; 
    }

    if(offset){
        skip = offset;
    }else{
        skip = 0;
    }

    Article.find(query)
    .populate('author')
    .sort({createdAt: 1})
    .limit(lim)
    .skip(skip)
    .exec((err, articles) => {
        if(err) return next(err);
        async function data(){
            for (let i = 0; i < articles.length; i++) {
                array[i] = await articles[i].articleJSON(req.user);
                console.log(array[i])
                if(i == articles.length - 1){
                    res.status(200).json({articles: array})
                }
            }
        }
        data();
    });    
});

//feed articles
router.get('/feed', auth.verifyToken, async function(req, res, next) {
    var {limit, offset} = req.query;
    var lim = limit ? limit : 20;
    var skip = offset ? offset : 0;
    var array = [];

    
    var users = await User.find({followers: req.user.id})
    usersIds = await users.map(user => user.id);

    Article.find({author: {$in: usersIds}})
    .populate('author')
    .sort({createdAt: 1})
    .limit(lim)
    .skip(skip)
    .exec((err, articles) => {
        if(err) return next(err);
        async function data(){
            for (let i = 0; i < articles.length; i++) {
                array[i] = await articles[i].articleJSON(req.user);
                if(i == articles.length - 1){
                    res.status(200).json({articles: array})
                }
            }
        }
        data();
    });    
});



//get article
router.get('/:slug', auth.verifyToken, async (req, res, next) => {
    var slug = req.params.slug;
    try {
        var article = await Article.findOne({slug: slug}).populate('author');
        var articleData = await article.articleJSON(req.user);
        res.status(200).json({article: articleData})
    } catch (error) {
        next(error);
    }
});


//create article
router.post('/', auth.verifyToken, async (req, res, next) => {
    req.body.article.author = req.user.id;
    try {
        var article = await Article.create(req.body.article);
        var articleData = await article.articleJSON(req.user);
        res.status(200).json({article: articleData})
    } catch (error) {
        next(error);
    }
});

//update article
router.put('/:slug', auth.verifyToken, async (req, res, next) => {
    var slug = req.params.slug;
    var {title, description, body, taglist} = req.body.article;
    try {
        var article = await Article.findOne({slug: slug});
        article.title = title;
        article.description = description;
        article.body = body;
        article.taglist = taglist;
        article = await article.save();
        var article = await Article.findOne({slug: slug}).populate('author');
        var articleData = await article.articleJSON(req.user);
        res.status(200).json({article: articleData})   
    } catch (error) {
        next(error);
    }
});

//delete article
router.delete('/:slug', auth.verifyToken, async (req, res, next) => {
    var slug = req.params.slug;
    try {
        var article = await Article.findOneAndDelete({slug: slug});
        var articleData = await article.articleJSON(req.user);
        res.status(200).json({deletedArticle: articleData})
    } catch (error) {
        next(error);     
    }
});


//add comment
router.post('/:slug/comments', auth.verifyToken, async (req, res, next) => {
    var slug = req.params.slug;
    var article = await Article.findOne({slug: slug});
    req.body.comment.article = article.id;
    req.body.comment.author = req.user.id;
    try {
        var comment = await (await Comment.create(req.body.comment)).populate('author');
        var commentData = await comment.commentJSON(req.user);
        res.status(200).json({comment: commentData})
    } catch (error) {
        next(error)
    }
});

//get comments from an article
router.get('/:slug/comments', auth.optional, async function(req, res, next) {
    var slug = req.params.slug;
    var array = [];
    try {
        var article = await Article.findOne({slug: slug});
        var comments = await Comment.find({article: article.id}).populate('author');
        async function data(){
            for (let i = 0; i < comments.length; i++) {
                array[i] = await comments[i].commentJSON(req.user)
                if(i == comments.length - 1){
                    res.status(200).json({comments: array})
                }
            }
        }
        data();
    } catch (error) {
        
    }
});

//delete comment
router.delete('/:slug/comments/:id', auth.verifyToken, async (req, res, next) => {
    var id = req.params.id;
    try {
        var comment = await Comment.findByIdAndDelete(id).populate('author');
        var commentData = await comment.commentJSON(req.user);
        res.status(200).json({deletedComment: commentData})
    } catch (error) {
        next(error);
    }
});


//favorite article
router.post('/:slug/favorite', auth.verifyToken, async (req, res, next) => {
    var slug = req.params.slug;
    try {
        var article = await Article.findOne({slug: slug, favorites: req.user.id})
        if(article){
            res.status(200).json({warning: 'already favorite/ no article'})
        }else{
            var article = await Article.findOneAndUpdate({slug: slug}, {$push: {favorites: req.user.id}}, {new: true}).populate('author');
            var articleData = await article.articleJSON(req.user);
            res.status(200).json({article: articleData})
        }
    } catch (error) {
        next(error);
    }
});

//unfavorite article
router.delete('/:slug/favorite', auth.verifyToken, async (req, res, next) => {
    var slug = req.params.slug;
    try {
        var article = await Article.findOne({slug: slug, favorites: req.user.id})
        if(!article){
            res.status(200).json({warning: 'already unfavorite/no article'})
        }else{
            var article = await Article.findOneAndUpdate({slug: slug}, {$pull: {favorites: req.user.id}}, {new: true}).populate('author');
            var articleData = await article.articleJSON(req.user);
            res.status(200).json({article: articleData})
        }
    } catch (error) {
        next(error);
    }
});









module.exports = router;
