var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');

var userSchema = new Schema({
    name: String,
    email: String,
    password: String,
});


userSchema.pre('save', async function() {
    if(this.password && this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

userSchema.methods.verifyPassword = async function(password) {
    var result = await bcrypt.compare(password, this.password);
    return result;
}

userSchema.methods.signToken = async function() {
    var payload = {name: this.name, email: this.email};
    try {
        var token = jwt.sign(payload, process.env.SECRET);
        return token;
    } catch (error) {
        return error;
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