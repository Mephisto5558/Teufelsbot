/** @type {import('@mephisto5558/bot-website').customPage}*/
module.exports = {
  run: async function (res, req) {
    const reply = this.voteSystem.getMany(parseInt(req.query.amount) || null, parseInt(req.query.offset ?? 0), req.query.filter, req.query.includePending == 'true', req.user?.id);
    return res.status(reply.errorCode ?? 200).json(reply);
  }
};