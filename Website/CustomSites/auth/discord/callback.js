/** @type {import('@mephisto5558/bot-website').customPage} */
module.exports = {
  run(res, req, next) {
    return this.passport.authenticate('discord', (err, user) => {
      if (err?.code == 'invalid_grant' || err?.message == 'Failed to obtain access token') return res.redirect('/auth/discord');
      if (err) return next(err);
      if (!user) return res.redirect('/auth/discord');

      /** @type {string | undefined} */
      const redirectURL = req.session.redirectURL;
      if (redirectURL) delete req.session.redirectURL;

      req.logIn(user, err => (err ? next(err) : res.redirect(redirectURL ?? '/')));
    })(req, res, next);
  }
};