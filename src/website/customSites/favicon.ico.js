/** @import { CustomPage } from '../../types/locals' */

/** @type {CustomPage} */
module.exports = {
  run(res) { return res.redirect(this.client.user.displayAvatarURL()); }
};