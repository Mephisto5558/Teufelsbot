/**@type {import('@mephisto5558/bot-website').customPage}*/
module.exports = {
  title: 'Your IP',

  run: function (res, req) {
    return res.send(req.header('x-forwarded-for') || req.socket.remoteAddress || 'unknown');
  }
};