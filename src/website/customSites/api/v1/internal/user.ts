import { ALLOWED_SIZES } from 'discord.js';
import { constants } from 'node:http2';
import type { CustomPage } from '#types/locals';

const { HTTP_STATUS_FORBIDDEN, HTTP_STATUS_UNAUTHORIZED } = constants;


export default {
  run(res, req): unknown {
    if (!req.isAuthenticated())
      return res.status(HTTP_STATUS_UNAUTHORIZED).json({ errorCode: HTTP_STATUS_UNAUTHORIZED, error: 'Not logged in' });
    if (this.db.get('botSettings', 'blacklist')?.includes(req.user.id))
      return res.status(HTTP_STATUS_FORBIDDEN).json({ errorCode: HTTP_STATUS_FORBIDDEN, error: 'You have been blacklisted from using the bot.' });

    return res.json({
      ...req.user,
      avatarURL: this.client.users.cache.get(req.user.id)
      /* eslint-disable-next-line @typescript-eslint/no-magic-numbers -- 1024 */
        ?.avatarURL({ size: /\?size=(?<size>\d+)/.exec(req.user.avatar)?.groups?.size ?? ALLOWED_SIZES[6] }) ?? req.user.avatar,
      dev: this.client.config.devIds.has(req.user.id)
    });
  }
} satisfies CustomPage;