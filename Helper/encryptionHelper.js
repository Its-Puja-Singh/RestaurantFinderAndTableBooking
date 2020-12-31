const crypto = require('crypto');

// Generate random string
module.exports = {
  generateRandomString: length =>
    crypto
      .randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length),
  hashString: (value, salt) => crypto.createHmac('sha256', salt).update(value).digest('hex'),
};
