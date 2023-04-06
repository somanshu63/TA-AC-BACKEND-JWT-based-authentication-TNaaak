var express = require('express');
var router = express.Router();
var auth = require('../middlewares/auth');
var User = require('../models/user')

/* GET home page. */
router.get('/:username', auth.optional, async function(req, res, next) {
  var username = req.params.username;
  try {
    var user = await User.findOne({username: username});
    if(!user){
        res.status(400).json({error: 'no user by this username'})
    }
    var sendUser = await user.profile(req.user)
    res.status(200).json({profile: sendUser})
  } catch (error) {
    next(error)
  }
});


//follow user
router.post('/:username/follow', auth.verifyToken, async (req, res, next) => {
    var username = req.params.username;
    try {
        var user = await User.findOne({username: username, followers: req.user.id})
        if(user){
            res.status(200).json({warning: 'already followed/no user'})
        }else{
            var user = await User.findOneAndUpdate({username}, {$push: {followers: req.user.id}}, {new:true});
            var sendUser = await user.profile(req.user)
            res.status(200).json({profile: sendUser})
        }
    } catch (error) {
        next(error);
    }
});


//unfollow user
router.delete('/:username/follow', auth.verifyToken, async (req, res, next) => {
    var username = req.params.username;
    try {
        var user = await User.findOne({username: username, followers: req.user.id})
        if(!user){
            res.status(200).json({warning: 'already unfollowed/no user'})
        }else{
            var user = await User.findOneAndUpdate({username}, {$pull: {followers: req.user.id}}, {new:true});
            var sendUser = await user.profile(req.user)
            res.status(200).json({profile: sendUser})
        }
    } catch (error) {
        next(error);
    }
});
























module.exports = router;
