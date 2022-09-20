var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bookSchema = new Schema({
    title: String,
    author: String,
    image: String,
    pages: Number,
    price: Number,
    quantity: Number,
    category: {type: Schema.Types.ObjectId, ref: 'Book'}
});

module.exports = mongoose.model('Book', bookSchema);