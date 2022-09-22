var express = require('express');
const User = require('../models/user');
var router = express.Router();

//registration
router.post('/', async function(req, res, next) {
  try {
    var user = await User.create(req.body.user);
    var token = await user.signToken();
    var senduser = await user.userJSON(token)
    res.status(200).json({user: senduser})
  } catch (error) {
    next(error);
  }
});


//login
router.post('/login', async (req, res, next) => {
  var {email, password} = req.body.user;
  if(!email || !password){
    res.status(400).json({error: 'email/password required'});
  }
  var user = await User.findOne({ email });
  if(!user){
    res.status(400).json({error: 'email not registered'});
  }
  var result = await user.verifyPassword(password);
  if(!result){
    res.status(400).json({error: 'wrong password'});
  }
  try {
    var token = await user.signToken();
    var senduser = await user.userJSON(token)
    res.status(200).json({user: senduser})
  } catch (error) {
    next(error);
  }
});



module.exports = router;
