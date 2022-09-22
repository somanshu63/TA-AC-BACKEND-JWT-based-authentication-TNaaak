var express = require('express');
var router = express.Router();
var Article = require('../models/article');
var auth = require('../middlewares/auth');
const User = require('../models/user');
var Comment = require('../models/comment')

//get articles
router.get('/', auth.optional, auth.verifyFavorite, auth.verifyFollowing, function(req, res, next) {
    var {tag, author, favorited, limit, offset} = req.query;
    var lim, skip;
    var query = {}
    var array =[];

    if(tag){
        query.tag = tag;
    }
    if(author){
        query.author = author;
    }
    if(favorited){
        query.favorited = favorited;
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
                var user = await articles[i].author.profile(req.following);
                array[i] = await articles[i].articleJSON(req.favorited, user);
                if(i == articles.length - 1){
                    res.status(200).json({articles: array})
                }
            }
        }
        data();
    });    
});

//feed articles
router.get('/feed', auth.verifyToken, auth.verifyFavorite, auth.verifyFollowing, async function(req, res, next) {
    var {limit, offset} = req.query;
    var lim, skip;
    var array = [];

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

    var users = await User.find({followers: req.user.id})

    Article.find({author: {$in: users}})
    .populate('author')
    .sort({createdAt: 1})
    .limit(lim)
    .skip(skip)
    .exec((err, articles) => {
        if(err) return next(err);
        async function data(){
            for (let i = 0; i < articles.length; i++) {
                var user = await articles[i].author.profile(req.following);
                array[i] = await articles[i].articleJSON(req.favorited, user);
                if(i == articles.length - 1){
                    res.status(200).json({articles: array})
                }
            }
        }
        data();
    });    
});



//get article
router.get('/:slug', auth.verifyToken, auth.verifyFavorite, auth.verifyFollowing, async (req, res, next) => {
    var slug = req.params.slug;
    try {
        var article = await Article.findOne({slug: slug}).populate('author');
        var userProfile = await article.author.profile(req.following);
        var articleData = await article.articleJSON(req.favorited, userProfile);
        res.status(200).json({article: articleData})
    } catch (error) {
        next(error);
    }
});


//create article
router.post('/', auth.verifyToken, auth.verifyFavorite, auth.verifyFollowing, async (req, res, next) => {
    req.body.article.author = req.user.id;
    console.log(req.body.article);
    try {
        var article = await Article.create(req.body.article);
        var user = await User.findOne({id: article.author});
        var userProfile = await user.profile(req.following);
        var articleData = await article.articleJSON(req.favorited, userProfile);
        res.status(200).json({article: articleData})
    } catch (error) {
        next(error);
    }
});

//update article
router.put('/:slug', auth.verifyToken, auth.verifyFavorite, auth.verifyFollowing, async (req, res, next) => {
    var slug = req.params.slug;
    var {title, description, body, taglist} = req.query.article;
    try {
        var article = await Article.findOne({slug: slug});
        article.title = req.body.article.title;
        article.description = req.body.article.description;
        article.body = req.body.article.body;
        article.taglist = req.body.article.taglist;
        article = await article.save();
        var article = await Article.findOne({slug: slug}).populate('author');
        var userProfile = await article.author.profile(req.following);
        var articleData = await article.articleJSON(req.favorited, userProfile);
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
        var user = await User.findOne({id: article.author});
        var userProfile = await user.profile(req.following);
        var articleData = await article.articleJSON(req.favorited, userProfile);
        res.status(200).json({deletedArticle: articleData})
    } catch (error) {
        next(error);     
    }
});


//add comment
router.post('/:slug/comments', auth.verifyToken, auth.verifyFollowing, async (req, res, next) => {
    var slug = req.params.slug;
    var article = await Article.findOne({slug: slug});
    req.body.comment.article = article.id;
    req.body.comment.author = req.user.id;
    try {
        var comment = await (await Comment.create(req.body.comment)).populate('author');
        var userProfile = await comment.author.profile(req.following);
        var commentData = await comment.commentJSON(userProfile);
        res.status(200).json({comment: commentData})
    } catch (error) {
        next(error)
    }
});

//get comments from an article
router.get('/:slug/comments', auth.optional, auth.verifyFollowing, async function(req, res, next) {
    var slug = req.params.slug;
    var array = [];
    try {
        var article = await Article.findOne({slug: slug});
        var comments = await Comment.find({article: article.id}).populate('author');
        async function data(){
            for (let i = 0; i < comments.length; i++) {
                var profile = await comments[i].author.profile(req.following);
                array[i] = await comments[i].commentJSON(profile)
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
router.delete('/:slug/comments/:id', auth.verifyToken, auth.verifyFollowing, async (req, res, next) => {
    var id = req.params.id;
    try {
        var comment = await Comment.findByIdAndDelete(id).populate('author');
        var userProfile = await comment.author.profile(req.following);
        var commentData = await comment.commentJSON(userProfile);
        res.status(200).json({deletedComment: commentData})
    } catch (error) {
        next(error);
    }
});


//favorite article
router.post('/:slug/favorite', auth.verifyToken, auth.verifyFavorite, auth.verifyFollowing, async (req, res, next) => {
    var slug = req.params.slug;
    try {
        var article = await Article.findOne({slug: slug, favorites: req.user.id})
        if(article){
            res.status(200).json({warning: 'already favorite/ no article'})
        }else{
            await Article.findOneAndUpdate({slug: slug}, {$push: {favorites: req.user.id}}).populate('author');
            var article = await Article.findOne({slug: slug}).populate('author');
            var userProfile = await article.author.profile(req.following);
            var articleData = await article.articleJSON(req.favorited, userProfile);
            res.status(200).json({article: articleData})
        }
    } catch (error) {
        next(error);
    }
});

//unfavorite article
router.delete('/:slug/favorite', auth.verifyToken, auth.verifyFavorite, auth.verifyFollowing, async (req, res, next) => {
    var slug = req.params.slug;
    try {
        var article = await Article.findOne({slug: slug, favorites: req.user.id})
        if(!article){
            res.status(200).json({warning: 'already unfavorite/no article'})
        }else{
            await Article.findOneAndUpdate({slug: slug}, {$pull: {favorites: req.user.id}}).populate('author');
            var article = await Article.findOne({slug: slug}).populate('author');
            var userProfile = await article.author.profile(req.following);
            var articleData = await article.articleJSON(req.favorited, userProfile);
            res.status(200).json({article: articleData})
        }
    } catch (error) {
        next(error);
    }
});









module.exports = router;
