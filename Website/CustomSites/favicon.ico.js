/**@type {import('@mephisto5558/bot-website').customPage}*/
module.exports = {
  run: function (res) { return res.redirect(this.client.user.displayAvatarURL()); }
};