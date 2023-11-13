const { errorHandler } = require('../Utils');

/**@this Client @param {Error}err*/
module.exports = async function error(err) {
  return errorHandler.call(this, err);
};