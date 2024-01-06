module.exports = {
  /**@this WebServer @param {Res}res @param {Req}req @param {NextFunc}next*/
  run: async function (res, req, next) {
    return this.passport.authenticate('discord', (err, user) => {
      if (err?.code == 'invalid_grant' || err?.message == 'Failed to obtain access token') return res.redirect('/auth/discord');
      if (err) return next(err);
      if (!user) return res.redirect('/auth/discord');

      let redirectURL;
      if (req.session.redirectURL) {
        redirectURL = req.session.redirectURL;
        delete req.session.redirectURL;
      }

      req.logIn(user, err => err ? next(err) : res.redirect(redirectURL || '/'));
    })(req, res, next);
  }
};