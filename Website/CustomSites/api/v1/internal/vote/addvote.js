module.exports = {
  /**@this Client @param {Res}res @param {Req}req*/
  run: async function (res, req) {
    const reply = await this.voteSystem.addVote(req.query.featureId, req.user?.id, 'up');
    return res.status(reply.errorCode || 200).json(reply);
  }
};