import { constants } from 'node:http2';
import type { FeatureRequest } from '@mephisto5558/bot-website';
import type { CustomPage } from '#types/locals';

const { HTTP_STATUS_OK } = constants;

export default {
  method: 'DELETE',

  async run(res, req) {
    const reply = await this.voteSystem.delete(req.body?.featureId, req.user?.id);
    return res.status('errorCode' in reply ? reply.errorCode : HTTP_STATUS_OK).json(reply);
  }
} satisfies CustomPage<{ featureId?: FeatureRequest['id'] }>;