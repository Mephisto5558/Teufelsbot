const { errorHandler } = require('../Utils');

/**@this Client @param {Error}err @returns {Promise<void>}*/
module.exports = function error(err) {
  return errorHandler.call(this, err);
};