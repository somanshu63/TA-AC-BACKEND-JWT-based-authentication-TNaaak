var express = require('express');
var router = express.Router();
var auth = require('../middlewares/auth')
var User = require('../models/user')

//get current user
router.get('/', auth.verifyToken, async function(req, res, next) {
    try {
        var user = await User.findOne({email: req.user.email});
        if(!user){
            res.status(400).json({error: 'no user'});
        }else{
            var token = await user.signToken();
            var senduser = await user.userJSON(token)
            res.status(200).json({user: senduser});   
        }
    } catch (error) {
        next(error);
    }
});

//update user
router.put('/', auth.verifyToken, async (req, res, next) => {
    try {
        var user = await User.findOneAndUpdate({email: req.body.user.email}, req.body.user, {new: true});
        if(!user){
            res.status(400).json({error: 'no user by that email'})
        }
        var token = await user.signToken();
        var senduser = await user.userJSON(token)
        res.status(200).json({user: senduser});
    } catch (error) {
        next(error);
    }
});



module.exports = router;