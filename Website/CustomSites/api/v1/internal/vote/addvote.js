/** @type {import('@mephisto5558/bot-website').customPage}*/
module.exports = {
  method: 'POST',

  run: async function (res, req) {
    const reply = await this.voteSystem.addVote(req.body.featureId, req.user?.id, 'up');
    return res.status(reply.errorCode ?? 200).json(reply);
  }
};