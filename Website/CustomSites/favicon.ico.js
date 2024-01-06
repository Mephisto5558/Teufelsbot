module.exports = {
  /**@this WebServer @param {Res}res*/
  run: function (res) { return res.redirect(this.client.user.displayAvatarURL()); }
};