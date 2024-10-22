const { HTTP_STATUS_OK } = require('node:http2').constants;

/** @type {import('@mephisto5558/bot-website').customPage}*/
module.exports = {
  method: 'POST',

  async run(res, req) {
    const reply = await this.voteSystem.update(req.body, req.user?.id);
    return res.status(reply.errorCode ?? HTTP_STATUS_OK).json(reply);
  }
};