/** @type {import('#types/locals').customPage} */
module.exports = {
  run(res, req, next) {
    return this.passport.authenticate('discord', {
      failureRedirect: '/auth/discord',
      successRedirect: 'redirectURL' in req.session ? req.session.redirectURL : '/'
    })(req, res, next);
  }
};