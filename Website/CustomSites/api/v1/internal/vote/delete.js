module.exports = {
  /**@this Client @param {Res}res @param {Req}req*/
  run: async function (res, req) {
    const reply = await this.voteSystem.delete(req.query.featureId, req.user?.id);
    return res.status(reply.errorCode || 200).json(reply);
  }
};