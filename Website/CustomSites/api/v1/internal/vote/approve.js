/** @type {import('@mephisto5558/bot-website').customPage}*/
module.exports = {
  run: async function (res, req) {
    const reply = await this.voteSystem.approve(req.query.featureId, req.user?.id);
    return res.status(reply.errorCode || 200).json(reply);
  }
};