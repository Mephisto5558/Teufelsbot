/** @import { CustomPage } from '#types/locals' */

/** @type {CustomPage} */
module.exports = {
  title: 'Your IP',

  run: (res, req) => res.send(req.header('x-forwarded-for') ?? req.socket.remoteAddress ?? 'unknown')
};