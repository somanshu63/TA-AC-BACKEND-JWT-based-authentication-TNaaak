var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
    title: String,
    author: String,
    book: {type: Schema.Types.ObjectId, ref: 'Book'}
});

module.exports = mongoose.model('Comment', commentSchema);