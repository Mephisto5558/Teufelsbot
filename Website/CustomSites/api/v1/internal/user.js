module.exports = {
  /**@this WebServer @param {Res}res @param {Req}req*/
  run: async function (res, req) {
    if (this.db.get('botSettings', 'blacklist')?.includes(req.user?.id)) return res.json({ errorCode: 403, error: 'You have been blacklisted from using the bot.' });
    return req.user ? res.json({ ...req.user, dev: this.client.application.owner.id == req.user?.id }) : res.json({ errorCode: 401, error: 'Not logged in' });
  }
};