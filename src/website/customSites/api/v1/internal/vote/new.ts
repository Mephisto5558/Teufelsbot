import { constants } from 'node:http2';
import type { CustomPage } from '#types/locals';

const { HTTP_STATUS_OK } = constants;

export default {
  method: 'POST',

  async run(res, req): Promise<unknown> {
    const reply = await this.voteSystem.add(req.body?.title, req.body?.description, req.user?.id);
    return res.status('errorCode' in reply ? reply.errorCode : HTTP_STATUS_OK).json(reply);
  }
} satisfies CustomPage<{ RunReqBody: { title?: string; description?: string } }>;