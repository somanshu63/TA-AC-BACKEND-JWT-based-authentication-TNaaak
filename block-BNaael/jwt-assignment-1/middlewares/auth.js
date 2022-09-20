var jwt = require('jsonwebtoken');

module.exports = {
    verifyToken: async (req, res, next) => {
        var token = req.headers.authorization;
        try {
            if(token){
                var payload = jwt.verify(token, process.env.SECRET)
                req.user = payload
                next();
            }else{
                res.json({error: 'token required'})
            }
        } catch (error) {
            next(error);
        }
    }
}