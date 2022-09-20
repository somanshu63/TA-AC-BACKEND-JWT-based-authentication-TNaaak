var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var cartSchema = new Schema({
    userId: {type: Schema.Type.ObjectId, ref: 'User'},
    books: [{type: Schema.Type.ObjectId, ref: 'Book'}]
})

module.exports = mongoose.model('Cart', cartSchema);