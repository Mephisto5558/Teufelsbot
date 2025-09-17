/** @type {import('#types/locals').customPage} */
module.exports = {
  run(res, req, next) {
    return this.passport.authenticate('discord', /** @type {import('passport').AuthenticateCallback} */ (rawErr, user) => {
      /** @type {Error | undefined} */
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment */
      const err = !rawErr || rawErr instanceof Error ? rawErr : new Error(rawErr);
      if (err?.code == 'invalid_grant' || err?.message == 'Failed to obtain access token') return res.redirect('/auth/discord');
      if (err) return next(err);
      if (!user) return res.redirect('/auth/discord');

      /** @type {{ redirectURL: string | undefined }} */
      const { redirectURL } = req.session;
      if ('redirectURL' in req.session) delete req.session.redirectURL;

      req.logIn(user, err => (err ? next(err) : res.redirect(redirectURL ?? '/')));
    })(req, res, next);
  }
};