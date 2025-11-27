/** @import { customPage } from '#types/locals' */

const { HTTP_STATUS_OK } = require('node:http2').constants;

/** @type {customPage} */
module.exports = {
  async run(res, req) {
    const reply = await this.voteSystem.getMany(
      Number.parseInt(req.query.amount) || undefined, Number.parseInt(req.query.offset ?? 0), req.query.filter,
      req.query.includePending == 'true', req.user?.id
    );
    return res.status('errorCode' in reply ? reply.errorCode : HTTP_STATUS_OK).json(reply);
  }
};