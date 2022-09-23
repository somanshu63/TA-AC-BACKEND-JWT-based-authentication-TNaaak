var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./user')

var commentSchema = new Schema({
    body: String,
    author: {type: Schema.Types.ObjectId, ref: 'User'},
    article: {type: Schema.Types.ObjectId, ref: 'Article'}
}, {timestamps: true});

commentSchema.methods.commentJSON = async function(currentUser){
    return {
        id: this.id,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        body: this.body,
        author: await this.author.profile(currentUser)
    }
}

module.exports = mongoose.model('Comment', commentSchema);
