const { HTTP_STATUS_OK } = require('node:http2').constants;

/** @type {import('#types/locals').customPage} */
module.exports = {
  method: 'POST',

  async run(res, req) {
    const reply = await this.voteSystem.approve(req.body.featureId, req.user?.id);
    return res.status(reply.errorCode ?? HTTP_STATUS_OK).json(reply);
  }
};