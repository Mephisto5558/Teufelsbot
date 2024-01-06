module.exports = {
  /**@this WebServer @param {Res}res @param {Req}req @param {NextFunc}next*/
  run: function (res, req, next) {
    if (req.query.redirectURL) req.session.redirectURL = req.query.redirectURL;
    return this.passport.authenticate('discord')(req, res, next);
  }
};