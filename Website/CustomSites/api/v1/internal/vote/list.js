const { HTTP_STATUS_OK } = require('node:http2').constants;

/** @type {import('#types/locals').customPage} */
module.exports = {
  run(res, req) {
    const reply = this.voteSystem.getMany(
      Number.parseInt(req.query.amount) || undefined, Number.parseInt(req.query.offset ?? 0), req.query.filter,
      req.query.includePending == 'true', req.user?.id
    );
    return res.status(reply.errorCode ?? HTTP_STATUS_OK).json(reply);
  }
};