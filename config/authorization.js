const { getAllUsers } = require('../models/users.js');
const passport = require('./config-passport.js');

const auth = async (req, res, next) => {
  try {
    await passport.authenticate('jwt', { session: false }, async (err, user) => {
      if (!user || err) {
        return res.status(401).json({
          status: 'error',
          code: 401,
          message: 'Unauthorized',
          data: 'Unauthorized',
        });
      }

      const authHeader = req.headers.authorization;
      const token = authHeader ? authHeader.split(' ')[1] : null;

      const allUsers = await getAllUsers();
      if (!allUsers.some(user => user.token === token)) {
        return res.status(401).json({
          status: 'error',
          code: 401,
          message: 'Token not valid',
          data: 'Token not valid',
        });
      }

      req.user = user;
      next();
    })(req, res, next);
  } catch (error) {
    next(error);
  }
};

module.exports = auth;
