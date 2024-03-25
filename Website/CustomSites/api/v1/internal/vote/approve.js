/** @type {import('@mephisto5558/bot-website').customPage}*/
module.exports = {
  method: 'POST',

  run: async function (res, req) {
    const reply = await this.voteSystem.approve(req.body.featureId, req.user?.id);
    return res.status(reply.errorCode ?? 200).json(reply);
  }
};