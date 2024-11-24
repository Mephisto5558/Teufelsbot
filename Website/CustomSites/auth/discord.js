/** @type {import('@mephisto5558/bot-website').customPage}*/
module.exports = {
  run(res, req, next) {
    if (typeof req.query.redirectURL == 'string') req.session.redirectURL = req.query.redirectURL;
    return this.passport.authenticate('discord')(req, res, next);
  }
};