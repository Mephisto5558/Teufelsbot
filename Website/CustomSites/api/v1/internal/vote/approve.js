const { HTTP_STATUS_OK } = require('node:http2').constants;

/** @type {import('@mephisto5558/bot-website').customPage}*/
module.exports = {
  method: 'POST',

  async run(res, req) {
    const reply = await this.voteSystem.approve(req.body.featureId, req.user?.id);
    return res.status(reply.errorCode ?? HTTP_STATUS_OK).json(reply);
  }
};