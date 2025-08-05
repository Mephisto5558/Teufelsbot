const { HTTP_STATUS_OK } = require('node:http2').constants;

/** @type {import('#types/locals').customPage<{title?: string, description?: string}>} */
module.exports = {
  method: 'POST',

  async run(res, req) {
    const reply = await this.voteSystem.add(req.body?.title, req.body?.description, req.user?.id);
    return res.status('errorCode' in reply ? reply.errorCode : HTTP_STATUS_OK).json(reply);
  }
};