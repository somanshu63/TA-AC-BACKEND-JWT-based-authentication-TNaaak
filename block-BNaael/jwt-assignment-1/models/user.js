var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken');

var userSchema = new Schema({
    name: String,
    email: {type: String, unique: true},
    password: String,
});

userSchema.pre('save', async function(next) {
    if(this.password && this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 10)
    }
    next()
})


userSchema.methods.verifyPassword = async function(password){
    var result = bcrypt.compare(password, this.password)
    return result;
}

userSchema.methods.signToken = async function() {
    var payload = {name: this.name, email: this.email};
    try {
        var token = await jwt.sign(payload, process.env.SECRET)
        return token;
    } catch (error) {
        return error ;       
    }
}

userSchema.methods.userJSON = async function(token) {
    return{
        name: this.name,
        email: this.email,
        token: token
    }
}




module.exports = mongoose.model('User', userSchema);