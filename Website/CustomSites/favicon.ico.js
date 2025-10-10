/** @import { customPage } from '#types/locals' */

/** @type {customPage} */
module.exports = {
  run(res) { return res.redirect(this.client.user.displayAvatarURL()); }
};