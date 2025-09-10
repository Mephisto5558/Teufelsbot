/** @type {import('#types/locals').customPage} */
module.exports = {
  run(res, req, next) { return req.logOut(err => (err ? res.redirect('/') : next(err))); }
};