const
  { ALLOWED_SIZES } = require('discord.js'),
  { HTTP_STATUS_FORBIDDEN, HTTP_STATUS_UNAUTHORIZED } = require('node:http2').constants;

/** @type {import('#types/locals').customPage} */
module.exports = {
  run(res, req) {
    if (this.db.get('botSettings', 'blacklist')?.includes(req.user?.id))
      return res.status(HTTP_STATUS_FORBIDDEN).json({ errorCode: HTTP_STATUS_FORBIDDEN, error: 'You have been blacklisted from using the bot.' });
    if (!req.user)
      return res.status(HTTP_STATUS_UNAUTHORIZED).json({ errorCode: HTTP_STATUS_UNAUTHORIZED, error: 'Not logged in' });

    return res.json({
      ...req.user,
      avatarURL: this.client.users.cache.get(req.user.id)
      /* eslint-disable-next-line @typescript-eslint/no-magic-numbers -- 1024 */
        ?.avatarURL({ size: req.user.avatar.match(/\?size=(?<size>\d+)/)?.groups?.size ?? ALLOWED_SIZES[6] }) ?? req.user.avatar,
      dev: this.client.config.devIds.has(req.user.id)
    });
  }
};