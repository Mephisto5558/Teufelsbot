const { HTTP_STATUS_FORBIDDEN, HTTP_STATUS_UNAUTHORIZED } = require('node:http2').constants;

/** @type {import('@mephisto5558/bot-website').customPage} */
module.exports = {
  run(res, req) {
    if (this.db.get('botSettings', 'blacklist').includes(req.user?.id))
      return res.status(HTTP_STATUS_FORBIDDEN).json({ errorCode: HTTP_STATUS_FORBIDDEN, error: 'You have been blacklisted from using the bot.' });
    if (!req.user)
      return res.status(HTTP_STATUS_UNAUTHORIZED).json({ errorCode: HTTP_STATUS_UNAUTHORIZED, error: 'Not logged in' });

    return res.json({ ...req.user, avatarUrl: this.client.users.cache.get(req.user.id)?.avatar ?? req.user.avatar, dev: this.client.config.devIds.has(req.user.id) });
  }
};