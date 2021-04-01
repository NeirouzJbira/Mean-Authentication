var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");

var user = new mongoose.Schema({
  email: { type: String, require: true },
  username: { type: String, require: true, unique: true },
  password: { type: String, require: true, minlength: 8 },
  isVerified: { type: Boolean, default: false },
  passwordResetToken: String,
});

const User = (module.exports = mongoose.model("User", user));

module.exports.getUserById = function (Id, callabck) {
  User.findById(Id, callabck);
};

module.exports.getUserByUsername = function (username) {
  const query = { username: username };
  return User.findOne(query).exec();
};

module.exports.addUser = function (newUser) {
  return bcrypt
    .genSalt(10)
    .then((salt) => bcrypt.hash(newUser.password, salt))
    .then((hash) => {
      newUser.password = hash;
      return User.create(newUser);
    });
};

module.exports.comparePassword = function (userPassword, hash) {
  return bcrypt.compare(userPassword, hash);
};
