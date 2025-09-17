const { HTTP_STATUS_OK } = require('node:http2').constants;

/** @type {import('#types/locals').customPage<{ featureId?: import('@mephisto5558/bot-website').FeatureRequest['id'] }>} */
module.exports = {
  method: 'DELETE',

  async run(res, req) {
    const reply = await this.voteSystem.delete(req.body?.featureId, req.user?.id);
    return res.status('errorCode' in reply ? reply.errorCode : HTTP_STATUS_OK).json(reply);
  }
};