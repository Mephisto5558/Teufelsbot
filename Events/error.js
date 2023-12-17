const { errorHandler } = require('../Utils');

/**@this Client @param {Error}err @returns {Promise<void>}*/
module.exports = function error(err, client) {
  return errorHandler.call(this, client ? err : null); //sometimes there is no err
};