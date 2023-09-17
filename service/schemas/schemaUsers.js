const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const gravatar = require('gravatar');

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
    // Dodaj pole "avatarURL".
    type: String,
  },
});

usersSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

// usersSchema.pre('save', function (next) {
//   if (!this.avatarURL) {
//     const avatar = gravatar.url(this.email, { s: '250' });
//     this.avatarURL = avatar;
//   }
//   next();
// });

const User = mongoose.model('user', usersSchema);

module.exports = User;
