const express = require('express');
const usersRouter = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const auth = require('../../config/authorization.js');
const upload = require('../../config/multer.js');
const Joi = require('joi');

const secret = process.env.SECRET;

const {
  getUserById,
  addUser,
  patchUser,
  patchAvatar,
  verifyUser,
  sendVerificationEmail,
} = require('../../models/users');
const User = require('../../service/schemas/schemaUsers.js');

const schema = Joi.object({
  email: Joi.string().email().required(),
});

usersRouter.post('/signup', async (req, res, next) => {
  const { body } = req;
  if (Object.keys(body).length === 0) {
    return res.status(400).json('Error! Missing fields!');
  }
  try {
    const user = await addUser(body);

    const { email, subscription } = user;
    return res.status(201).json({
      status: 'success',
      code: 201,
      data: {
        email,
        subscription,
      },
    });
  } catch (error) {
    next(error);
  }
});

usersRouter.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !user.validPassword(password)) {
    return res.status(400).json({
      status: 'error',
      code: 400,
      message: 'Incorrect login or password',
      data: 'Bad request',
    });
  }

  if (user?.verify === false) {
    return res.status(400).json({
      status: 'error',
      code: 400,
      message: 'User not verified',
    });
  }

  try {
    const payload = {
      id: user.id,
      username: user.email,
    };

    const token = jwt.sign(payload, secret, { expiresIn: '1h' });

    user.token = token;
    await user.save();

    res.status(200).json({
      status: 'success',
      code: 200,
      data: { token: token },
    });
  } catch (error) {
    next(error);
  }
});

usersRouter.post('/logout', auth, async (req, res, next) => {
  const { id } = req.user;
  try {
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json(`User not found!`);
    }
    user.token = null;
    await user.save();
    return res.status(204).json(`User logout!`);
  } catch (error) {
    next(error);
  }
});

usersRouter.get('/current', auth, async (req, res, next) => {
  const { id: userId } = req.user;
  try {
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json(`User not found!`);
    }

    const { email, subscription } = user;
    return res.status(200).json({
      status: 'success',
      code: 200,
      data: { email, subscription },
    });
  } catch (error) {
    next(error);
  }
});

usersRouter.patch('/', auth, async (req, res) => {
  const { id } = req.user;
  const { subscription } = req.body;

  if (!subscription) {
    return res.status(400).json({ message: 'Error! Missing field subscription!' });
  }

  try {
    const updatedUser = await patchUser(subscription, id);

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found!' });
    }

    return res.json({
      status: 'success',
      code: 200,
      data: { subscription: updatedUser.subscription },
    });
  } catch (error) {
    res.status(500).json(`Error: ${error.message}`);
  }
});

usersRouter.patch('/avatars', auth, upload.single('avatar'), async (req, res) => {
  const avatar = req.file;

  if (!avatar) {
    return res.status(400).json('Error! Missing file!');
  }
  const { path } = avatar;
  const { id } = req.user;

  try {
    const newAvatar = await patchAvatar(path, id);
    return res.status(200).json({
      status: 'success',
      code: 200,
      avatarURL: newAvatar,
    });
  } catch (error) {
    res.status(500).json(`Error while updating avatar: ${error}`);
  }
});

usersRouter.get('/verify/:verificationToken', async (req, res, next) => {
  const verificationToken = req.params.verificationToken;

  try {
    await verifyUser(verificationToken);
    return res.status(200).json({ status: 'success', message: 'Verification success' });
  } catch (error) {
    res.status(404).json(`Error: ${error}`);
  }
});

usersRouter.post('/verify', async (req, res, next) => {
  const { body } = req;
  const { error } = schema.validate(body);

  if (error) {
    return res.status(400).json({ message: 'missing required field email' });
  }

  const { email } = req.body;
  try {
    await sendVerificationEmail(email);
    return res.status(200).json({ message: 'Verification email sent' });
  } catch (error) {
    res.status(400).json({ message: `Error: ${error.message}` });
  }
});

module.exports = usersRouter;
