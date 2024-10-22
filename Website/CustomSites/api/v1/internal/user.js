/** @type {import('@mephisto5558/bot-website').customPage}*/
module.exports = {
  run(res, req) {
    if (this.db.get('botSettings', 'blacklist').includes(req.user?.id)) return res.json({ errorCode: 403, error: 'You have been blacklisted from using the bot.' });
    return res.json(req.user ? { ...req.user, dev: this.client.config.devIds.has(req.user.id) } : { errorCode: 401, error: 'Not logged in' });
  }
};