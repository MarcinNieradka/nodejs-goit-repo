const User = require('../service/schemas/schemaUsers');
const bcrypt = require('bcrypt');
const gravatar = require('gravatar');
const fs = require('fs/promises');
const jimp = require('jimp');

const getAllUsers = async () => {
  try {
    return await User.find();
  } catch (error) {
    console.log('Error getting user list: ', error);
    throw error;
  }
};

const checkifUserExists = async email => {
  try {
    const allUsers = await User.find();
    const user = allUsers.find(user => user.email === email);
    return user;
  } catch (error) {
    console.log('Error occurred when getting user: ', error);
    throw error;
  }
};

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
    const user = await checkifUserExists(email);

    if (user) return 409;

    const salt = await bcrypt.genSalt();
    const encryptedPass = await bcrypt.hash(password, salt);
    const avatar = gravatar.url(email, { s: '250' });

    const newUser = await User.create({ ...body, password: encryptedPass, avatarURL: avatar });
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
  const serverPath = `${process.env.SERVER_ADDRESS}/${localPath}`;

  try {
    jimp.read(filePath).then(avatar => {
      avatar.autocrop().resize(250, 250).writeAsync(localPath);
    });

    await User.findByIdAndUpdate(
      userId,
      { avatarURL: localPath },
      { new: true, fields: 'avatarURL' }
    );

    await fs.unlink(filePath);
    return serverPath;
  } catch (error) {
    console.error('Error while updating avatar: ', error);
    throw error;
  }
};

module.exports = {
  getUserById,
  addUser,
  patchUser,
  getAllUsers,
  patchAvatar,
};
