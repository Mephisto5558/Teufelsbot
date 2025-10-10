/**
 * @import { customPage } from '#types/locals'
 * @import { FeatureRequest } from '@mephisto5558/bot-website' */

const { HTTP_STATUS_OK } = require('node:http2').constants;

/** @type {customPage<{ featureId?: FeatureRequest['id'] }>} */
module.exports = {
  method: 'DELETE',

  async run(res, req) {
    const reply = await this.voteSystem.delete(req.body?.featureId, req.user?.id);
    return res.status('errorCode' in reply ? reply.errorCode : HTTP_STATUS_OK).json(reply);
  }
};