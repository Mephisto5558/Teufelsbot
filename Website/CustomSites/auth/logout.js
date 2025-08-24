/** @type {import('@mephisto5558/bot-website').customPage} */
module.exports = {
  run(res, req, next) { return req.logOut(err => (err ? res.redirect('/') : next(err))); }
};