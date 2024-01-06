module.exports = {
  /**@this WebServer @param {Res}res @param {Req}req @param {NextFunc}next*/
  run: function (res, req, next) { return req.logOut(err => err ? next(err) : res.redirect('/')); }
};