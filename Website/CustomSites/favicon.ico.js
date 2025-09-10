/** @type {import('#types/locals').customPage} */
module.exports = {
  run(res) { return res.redirect(this.client.user.displayAvatarURL()); }
};