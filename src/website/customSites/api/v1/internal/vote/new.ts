import { CustomPage } from '#types/locals';
import { constants } from 'node:http2';

const { HTTP_STATUS_OK } = constants;

export default {
  method: 'POST',

  async run(res, req) {
    const reply = await this.voteSystem.add(req.body?.title, req.body?.description, req.user?.id);
    return res.status('errorCode' in reply ? reply.errorCode : HTTP_STATUS_OK).json(reply);
  }
} satisfies CustomPage<{ title?: string, description?: string }>;