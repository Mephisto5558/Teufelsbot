/** @import { CustomPage } from '#types/locals' */

/** @type {CustomPage} */
module.exports = {
  title: 'Your IP',

  run(res, req) {
    return res.send(req.header('x-forwarded-for') ?? req.socket.remoteAddress ?? 'unknown');
  }
};