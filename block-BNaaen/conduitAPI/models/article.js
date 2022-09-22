var mongoose = require('mongoose');
const User = require('./user');
var Schema = mongoose.Schema;
var slug = require('slug');

var articleSchema = new Schema({
    slug: String,
    title: {type: String, required: true},
    description: {type: String, required: true},
    body: {type: String, required: true},
    taglist: [{type: String}],
    favorites: [{type: Schema.Types.ObjectId, ref: 'User'}],
    author: {type: Schema.Types.ObjectId, ref: 'User'}
}, {timestamps: true});


articleSchema.pre('save', async function(next){
    if(this.title && this.isModified('title')){
        this.slug = slug(this.title);
    }
    next();
});

articleSchema.methods.articleJSON = async function(value, profile){
    return {
        article: {
            slug: this.slug,
            title: this.title,
            desription: this.description,
            body: this.body,
            taglist: this.taglist,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            favorited: value,
            favoritesCount: this.favorites.length,
            author: profile
        }
    }
}

module.exports = mongoose.model('Article', articleSchema)