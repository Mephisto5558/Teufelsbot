module.exports = {
  /**@this Client @param {Res}res @param {Req}req*/
  run: async function (res, req) {
    const reply = await this.voteSystem.getMany(parseInt(req.query.amount) || null, parseInt(req.query.offset) || 0, req.query.filter, req.query.includePending == 'true', req.user?.id);
    return res.status(reply.errorCode || 200).json(reply);
  }
};