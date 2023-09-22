const SERVER_ADDRESS = `http://localhost:3000`;
const User = require('../service/schemas/schemaUsers');
const bcrypt = require('bcrypt');
const gravatar = require('gravatar');
const fs = require('fs/promises');
const jimp = require('jimp');
const sgMail = require('@sendgrid/mail');
const { v4 } = require('uuid');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = (email, verificationToken) => {
  return {
    to: email,
    from: 'immarcini@gmail.com',
    subject: 'Sending with SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: `<a href="${SERVER_ADDRESS}/api/users/verify/${verificationToken}">Click link to verify your email </a>`,
  };
};

const getAllUsers = async () => {
  try {
    return await User.find();
  } catch (error) {
    console.log('Error getting user list: ', error);
    throw error;
  }
};

// const checkifUserExists = async email => {
//   try {
//     const allUsers = await User.find();
//     const user = allUsers.find(user => user.email === email);
//     return user;
//   } catch (error) {
//     console.log('Error occurred when getting user: ', error);
//     throw error;
//   }
// };

// //////////// v2 start ///////////////////////

const checkifUserExists = async (val, fieldName) => {
  try {
    const user = await User.findOne({ [fieldName]: val });
    return user;
  } catch (error) {
    console.log('Error occurred when getting user: ', error);
    throw error;
  }
};

// //////////// v2 end ///////////////////////

const getUserById = async contactId => {
  try {
    const contact = await User.findById(contactId);
    return contact;
  } catch (error) {
    console.error('Error occurred when trying to get user:', error);
    throw error;
  }
};

const addUser = async body => {
  try {
    const { email, password } = body;
    // const user = await checkifUserExists(email);
    const user = await checkifUserExists(email, 'email');

    if (user) {
      throw new Error('email already in use');
    }

    const salt = await bcrypt.genSalt();
    const encryptedPass = await bcrypt.hash(password, salt);
    const avatar = gravatar.url(email, { s: '250' });
    const verificationToken = v4();

    const newUser = await User.create({
      ...body,
      password: encryptedPass,
      avatarURL: avatar,
      verificationToken,
    });

    await sgMail.send(msg(email, verificationToken));

    return newUser;
  } catch (error) {
    console.log('Error occurred when adding user: ', error);
    throw error;
  }
};

const patchUser = async (subscription, userId) => {
  const availableSubscriptions = User.schema.path('subscription').enumValues;

  if (!subscription || !availableSubscriptions.includes(subscription)) {
    throw new Error('Wrong subscription value!');
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('Missing user!');
    }

    user.subscription = subscription;
    await user.save();

    return user;
  } catch (error) {
    console.error('An error occurred while updating user: ', error.message);
    throw error;
  }
};

const patchAvatar = async (filePath, userId) => {
  const localPath = `public/avatars/avatar-${userId}.jpg`;
  const serverPath = `${localPath.replace(/^public/, '')}`;

  try {
    jimp.read(filePath).then(avatar => {
      avatar.autocrop().resize(250, 250).writeAsync(localPath);
    });

    await User.findByIdAndUpdate(
      userId,
      { avatarURL: `${localPath.replace(/^public/, '')}` },
      { new: true, fields: 'avatarURL' }
    );

    await fs.unlink(filePath);
    return serverPath;
  } catch (error) {
    console.error('Error while updating avatar: ', error);
    throw error;
  }
};

const verifyUser = async verificationToken => {
  try {
    const user = await checkifUserExists(verificationToken, 'verificationToken');

    if (!user) {
      throw new Error('User not found!');
    }

    const { verify } = user;
    if (verify) {
      throw new Error('Verification has already been passed!');
    }

    user.verify = true;
    user.verificationToken = null;
    await user.save();
  } catch (error) {
    console.log('Error occurred when verifying user: ', error);
    throw error;
  }
};

const sendVerificationEmail = async email => {
  try {
    const user = await checkifUserExists(email, 'email');
    const { verify, verificationToken } = user;

    if (verify) {
      throw new Error('Verification has already been passed');
    }

    await sgMail.send(msg(email, verificationToken));
  } catch (error) {
    console.log('Error occurred when sending verification email: ', error);
    throw error;
  }
};

module.exports = {
  getUserById,
  addUser,
  patchUser,
  getAllUsers,
  patchAvatar,
  verifyUser,
  sendVerificationEmail,
};
