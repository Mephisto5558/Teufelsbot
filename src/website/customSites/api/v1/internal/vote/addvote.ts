import { CustomPage } from '#types/locals';
import { FeatureRequest } from '@mephisto5558/bot-website';
import { constants } from 'node:http2';

const { HTTP_STATUS_OK } = constants;

export default {
  method: 'POST',

  async run(res, req) {
    const reply = await this.voteSystem.addVote(req.body?.featureId, req.user?.id, 'up');
    return res.status('errorCode' in reply ? reply.errorCode : HTTP_STATUS_OK).json(reply);
  }
} satisfies CustomPage<{ featureId?: FeatureRequest['id'] }>;