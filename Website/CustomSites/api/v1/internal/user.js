const { HTTP_STATUS_FORBIDDEN, HTTP_STATUS_UNAUTHORIZED } = require('node:http2').constants;

/** @type {import('@mephisto5558/bot-website').customPage}*/
module.exports = {
  run(res, req) {
    if (this.db.get('botSettings', 'blacklist').includes(req.user?.id)) return res.json({ errorCode: HTTP_STATUS_FORBIDDEN, error: 'You have been blacklisted from using the bot.' });
    return res.json(req.user ? { ...req.user, dev: this.client.config.devIds.has(req.user.id) } : { errorCode: HTTP_STATUS_UNAUTHORIZED, error: 'Not logged in' });
  }
};