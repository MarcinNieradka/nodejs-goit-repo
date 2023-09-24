const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const usersSchema = new mongoose.Schema({
  password: {
    type: String,
    required: [true, 'Password is required'],
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
  },

  subscription: {
    type: String,
    enum: ['starter', 'pro', 'business'],
    default: 'starter',
  },

  token: {
    type: String,
    default: null,
  },

  avatarURL: {
    type: String,
  },

  verify: {
    type: Boolean,
    default: false,
  },

  verificationToken: {
    type: String,
    default: null,
  },
});

usersSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

const User = mongoose.model('user', usersSchema);

module.exports = User;
