/**@type {import('@mephisto5558/bot-website').customPage}*/
module.exports = {
  run: function (res, req, next) {
    if (req.query.redirectURL) req.session.redirectURL = req.query.redirectURL;
    return this.passport.authenticate('discord')(req, res, next);
  }
};