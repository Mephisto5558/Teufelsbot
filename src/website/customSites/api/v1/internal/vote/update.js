/**
 * @import { CustomPage } from '../../../../../../types/locals'
 * @import { FeatureRequest } from '@mephisto5558/bot-website' */

const { HTTP_STATUS_OK } = require('node:http2').constants;

/** @type {CustomPage<FeatureRequest | FeatureRequest[]>} */
module.exports = {
  method: 'POST',

  async run(res, req) {
    const reply = await this.voteSystem.update(req.body, req.user?.id);
    return res.status('errorCode' in reply ? reply.errorCode : HTTP_STATUS_OK).json(reply);
  }
};