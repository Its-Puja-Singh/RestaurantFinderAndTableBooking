const { sign, verify } = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/keys');

module.exports = {
  createJwt: async payload => await sign(payload, JWT_SECRET, { expiresIn: '200h' }),
  decodeToken: async token => await verify(token, JWT_SECRET),
};
