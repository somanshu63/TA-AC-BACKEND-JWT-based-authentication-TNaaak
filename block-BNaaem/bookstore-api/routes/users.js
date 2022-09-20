var express = require('express');
const user = require('../models/user');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//registration handler
router.post('/register', async function(req, res, next) {
  try {
    var user = await user.create(req.body);
    var token = await user.signToken();
    res.status(200).json({user: user.userJSON(token)});
  } catch (error) {
    next(error);
  }
});


//login handler
router.post('/login', async function(req, res, next) {
  var {email, password} = req.body;
  if(!email || !password){
    res.status(400).json({error: "email/password required"});
  }
  try {
    var user = await User.findOne({email: email});
    if(!user){
      res.status(400).json({error: "email is not registered"});
    }
    var result = await user.verifyPassword(password);
    if(!result){
      res.status(400).json({error: "password is wrong"});
    }else{
      var token = await user.signToken();
      res.status(200).json({user: user.userJSON(token)});
    }
  } catch (error) {
    next(error);
  }
});



module.exports = router;
