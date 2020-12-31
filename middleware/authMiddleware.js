const logger = require('../Helper/log4jsHelper.js');
const { decodeToken } = require('../Helper/jwtTokenHelper');
const { enums } = require('../constants');
const User = require('../models/userModel.js');

module.exports = {
  authMiddleware: async (req, res, next) => {
    const token = req.header('token');
    if (!token) return res.status(400).json({ message: 'UNAUTHORIZED' });
    try {
      const decoded = await decodeToken(token);
      if (!decoded) return res.status(400).json({ message: 'TOKEN_IS_EXPIRED' });
      req.user = decoded.user;
      next();
    } catch (e) {
        res.status(400).json({ message: 'SOMETHING_WRONG_WITH_TOKEN_VALUE' });
        next(e);
    }
  },
  isAdmin: async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (user.role === enums.USER_ROLES.ADMIN) {
        next();
      } else {
        return res.status(400).json('UNAUTHORIZED');
      }
    } catch (e) {
        res.status(400).json({ message: 'SOMETHING_WRONG_WITH_TOKEN_VALUE' });
        next(e);
    }
  },
  isUserOrAdmin: async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (user.role === enums.USER_ROLES.USER || user.role === enums.USER_ROLES.ADMIN) {
        next();
      } else {
        return res.status(400).json({ message: 'UNAUTHORIZED' });
      }
    } catch (e) {
        res.status(400).json({ message: 'SOMETHING_WRONG_WITH_TOKEN_VALUE' });
        next(e);
    }
  },
  isRestaurantOwner: async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (user.role === enums.USER_ROLES.RESTAURANT_OWNER) {
        next();
      } else {
        return res.status(400).json({ message: 'UNAUTHORIZED' });
      }
    } catch (e) {
        res.status(400).json({ message: 'SOMETHING_WRONG_WITH_TOKEN_VALUE' });
        next(e);
    }
  },
};
