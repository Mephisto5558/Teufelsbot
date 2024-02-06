/** @type {import('@mephisto5558/bot-website').customPage}*/
module.exports = {
  run: function (res, req, next) { return req.logOut(err => err ? next(err) : res.redirect('/')); }
};