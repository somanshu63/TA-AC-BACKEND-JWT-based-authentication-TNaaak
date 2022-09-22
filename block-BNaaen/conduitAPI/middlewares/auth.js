var jwt = require('jsonwebtoken');
const User = require('../models/user');
const Article = require('../models/article');


module.exports = {
    verifyToken: async (req, res, next) => {
        var token = req.headers.authorization;
        try {
            if(token){
                var payload = await jwt.verify(token, process.env.SECRET);
                req.user = payload;
                next();
            }else{
                res.status(400).json({error: 'no user logged in'})
            }
        } catch (error) {
            next(error);
        }
    },
    optional: async (req, res, next) => {
        var token = req.headers.authorization;
        try {
            if(token){
                var payload = await jwt.verify(token, process.env.SECRET);
                req.user = payload;
                next();
            }else{
                req.user = null;
                next()
            }
        } catch (error) {
            next(error);
        }
    },
    verifyFollowing: async(req, res, next) => {
        var profileId = req.params.id;
        if(req.user){
            var result = await User.findOne({id: profileId, followers: req.user.id})
            if(result){
                req.following = true;
            }else{
                req.following = false;
            }
        }else{
            req.following = false;
        }
        
        next();
    },
    verifyFavorite: async(req, res, next) => {
        var articleSlug = req.params.slug;
        if(req.user){
            var result = await Article.findOne({slug: articleSlug, favorited: req.user.id})
            if(result){
                req.favorited = true;
            }else{
                req.favorited = false;
            }
        }else{
            req.favorited = false;
        }
        next();
    }
}