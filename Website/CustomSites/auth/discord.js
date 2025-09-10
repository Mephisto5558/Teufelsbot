/** @type {import('#types/locals').customPage} */
module.exports = {
  run(res, req, next) {
    if (typeof req.query.redirectURL == 'string') req.session.redirectURL = req.query.redirectURL;
    return this.passport.authenticate('discord')(req, res, next);
  }
};