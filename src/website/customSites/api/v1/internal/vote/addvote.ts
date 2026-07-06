import { constants } from 'node:http2';
import type { FeatureRequest } from '@mephisto5558/bot-website';
import type { CustomPage } from '#types/locals';

const { HTTP_STATUS_OK } = constants;

export default {
  method: 'POST',

  async run(res, req) {
    const reply = await this.voteSystem.addVote(req.body?.featureId, req.user?.id, 'up');
    return res.status('errorCode' in reply ? reply.errorCode : HTTP_STATUS_OK).json(reply);
  }
} satisfies CustomPage<{ featureId?: FeatureRequest['id'] }>;