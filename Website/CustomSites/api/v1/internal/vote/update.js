const { HTTP_STATUS_OK } = require('node:http2').constants;

/** @type {import('#types/locals').customPage} */
module.exports = {
  method: 'POST',

  async run(res, req) {
    const reply = await this.voteSystem.update(req.body, req.user?.id);
    return res.status(reply.success ? HTTP_STATUS_OK : reply.code).json(reply);
  }
};