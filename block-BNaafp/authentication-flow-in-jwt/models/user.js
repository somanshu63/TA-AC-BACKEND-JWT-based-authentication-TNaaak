var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var userSchema = new Schema({
    name: String,
    email: String,
    password: String
});


userSchema.pre('save', async function(next) {
    if(this.password && this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 10);
    }
    next()

})

userSchema.methods.verifyPassword = async function(password) {
    var result = await bcrypt.compare(password, this.password);
    return result;
}

module.exports = mongoose.model('User', userSchema);