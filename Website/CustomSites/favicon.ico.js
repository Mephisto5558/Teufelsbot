/** @type {import('@mephisto5558/bot-website').customPage}*/
module.exports = {
  run(res) { return res.redirect(this.client.user.displayAvatarURL()); }
};