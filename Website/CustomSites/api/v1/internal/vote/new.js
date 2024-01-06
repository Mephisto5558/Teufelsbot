module.exports = {
  method: 'POST',

  /**@this Client @param {Res}res @param {Req}req*/
  run: async function (res, req) {
    const reply = await this.voteSystem.add(req.body?.title, req.body?.description, req.user?.id);
    return res.status(reply.errorCode || 200).json(reply);
  }
};