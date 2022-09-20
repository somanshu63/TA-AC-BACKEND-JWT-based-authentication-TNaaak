var express = require('express');
var router = express.Router();
var auth = require('../middlewares/auth')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/dashboard', auth.verifyToken, (req, res, next) => {
  console.log(req.user)
  res.json("hello this is dashboard, portected page")
});


module.exports = router;
