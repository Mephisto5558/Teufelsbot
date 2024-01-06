module.exports = {
  title: 'Your IP',

  /**@this WebServer @param {Res}res @param {Req}req*/
  run: function (res, req) {
    return res.send(req.header('x-forwarded-for') || req.socket.remoteAddress || 'unknown');
  }
};