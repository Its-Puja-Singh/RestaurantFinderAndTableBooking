const Restaurant = require('../models/restaurantModel');

module.exports = {
  getRestaurant: async (req, res, next) => {
    try {
      const result = await Restaurant.getRestaurant();
      return res.json({ message: 'SUCCESS', data: result });
    } catch (err) {
      next(err);
    }
  },
  searchByFood: async (req, res, next) => {
    try {
      const { q, pageNumber, lim } = req.query;
      const page = parseFloat(pageNumber);
      const limit = parseFloat(lim);
      const options = {
        q,
        page,
        limit
      };
      const result = await Restaurant.search(options);
      return res.json({ message: 'SUCCESS', data: result });
    } catch (err) {
      next(err);
    }
  },
}