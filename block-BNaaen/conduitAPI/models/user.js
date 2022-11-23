var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");

var userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  bio: String,
  image: String,
  followers: [{ type: Schema.Types.ObjectId }],
});

userSchema.pre("save", async function (next) {
  if (this.password && this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.verifyPassword = async function (password) {
  var result = await bcrypt.compare(password, this.password);
  return result;
};

userSchema.methods.signToken = async function () {
  var payload = { username: this.username, email: this.email, id: this.id };
  try {
    var token = await jwt.sign(payload, process.env.SECRET);
    return token;
  } catch (error) {
    return error;
  }
};

userSchema.methods.userJSON = async function (token) {
  return {
    email: this.email,
    token: token,
    username: this.username,
    bio: this.bio || null,
    image: this.image || null,
  };
};

userSchema.methods.profile = async function (currentUser) {
  return {
    username: this.username,
    bio: this.bio,
    image: this.image,
    following: this.followers.includes(currentUser ? currentUser.id : ""),
  };
};

module.exports = mongoose.model("User", userSchema);
