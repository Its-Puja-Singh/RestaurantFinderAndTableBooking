const { body, validationResult } = require('express-validator');

module.exports = {
  registerRules: () => [
    body('userName', 'User name is required').not().isEmpty(),
    body('email', 'email is required and valid').isEmail(),
    body('password', 'Password is required and with 6 character or more').isLength({ min: 6 }),
  ],
  loginRules: () => [
    body('email', 'email is required and valid').isEmail(),
    body('password', 'Password is required and with 6 character or more').isLength({ min: 6 }),
  ],
  updateRules: () => [
    body('userName', 'User name is required').not().isEmpty(),
    body('phone', 'Phone in a valid format').isLength({ min: 10, max: 16 }),
  ],
  resetPasswordRules: () => [
    body('password', 'Must be at least 6 chars long').not().isEmpty().isLength({ min: 6 }),
    body('confirmPassword', 'Passwords do not match').custom((value, { req }) => value === req.body.password),
  ],
  tableBookingRules: () => [
    body('userName', 'User name is required').not().isEmpty(),
    body('email', 'email is required and valid').isEmail(),
    body('phone', 'Phone in a valid format').isLength({ min: 10, max: 16 }),
  ],
  validate: (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    const extractedErrors = [];
    errors.array().map(err => {
      extractedErrors.push({ [err.location]: err.location, params: err.param, msg: err.msg });
    });
    return res.status(400).json({ errors: extractedErrors });
  },
};
