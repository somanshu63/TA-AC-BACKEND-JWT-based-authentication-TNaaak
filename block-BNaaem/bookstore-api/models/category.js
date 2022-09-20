var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var categorySchema = new Schema({
    title: String,
    book: {type: Schema.Types.ObjectId, ref: 'Book'}
});

module.exports = mongoose.model('Category', categorySchema);