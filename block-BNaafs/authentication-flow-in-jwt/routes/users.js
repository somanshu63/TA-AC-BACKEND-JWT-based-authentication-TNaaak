var express = require('express');
var router = express.Router();
var User = require('../models/user')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//register
router.post('/register', async function (req, res, next)  {
  try {
    var user = await User.create(req.body);
    console.log(user);
    var token = await user.signToken()
    res.status(200).json({user: user.userJSON(token)})
  } catch (error) {
    next(error)
  }
})


//login
router.post('/login', async function(req, res, next) {
  var {email, password} = req.body;
  if(!email || !password){
    res.status(400).json({error: "email/password required"})
  }
  try {
    var user = await User.findOne({email})
    console.log(user)
    if(!user){
      res.status(400).json({error: "email not registered"})
    }
    var result = await user.verifyPassword(password);
    if(!result){
      res.status(400).json({error: "wrong password"})
    }
    var token = await user.signToken()
    console.log(token)
    res.status(200).json({user: user.userJSON(token)})
  } catch (error) {
    next(error);
  }
});


module.exports = router;