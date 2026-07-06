import { constants } from 'node:http2';
import type { CustomPage } from '#types/locals';

const { HTTP_STATUS_OK } = constants;

export default {
  async run(res, req) {
    const reply = await this.voteSystem.getMany(
      Number.parseInt(req.query.amount, 10) || undefined, Number.parseInt(req.query.offset ?? 0, 10), req.query.filter,
      req.query.includePending == 'true', req.user?.id
    );
    return res.status('errorCode' in reply ? reply.errorCode : HTTP_STATUS_OK).json(reply);
  }
} satisfies CustomPage;