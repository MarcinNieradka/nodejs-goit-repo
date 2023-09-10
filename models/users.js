const User = require('../service/schemas/schemaUsers');
const bcrypt = require('bcrypt');

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

    const newUser = await User.create({ ...body, password: encryptedPass });
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

module.exports = {
  getUserById,
  addUser,
  patchUser,
  getAllUsers,
};
