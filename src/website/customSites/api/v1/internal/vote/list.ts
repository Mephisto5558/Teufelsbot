import { constants } from 'node:http2';
import type { CustomPage } from '#types/locals';

const { HTTP_STATUS_OK } = constants;

export default {
  async run(res, req): Promise<unknown> {
    const reply = await this.voteSystem.getMany(
      Number.parseInt(req.query.amount, 10) || undefined,
      req.query.offset ? Number.parseInt(req.query.offset, 10) : 0, req.query.filter,
      req.query.includePending == 'true', req.user?.id
    );

    // @ts-expect-error general logic for all voting API routes
    return res.status('errorCode' in reply ? reply.errorCode : HTTP_STATUS_OK).json(reply);
  }
} satisfies CustomPage<{ RunReqParams: { amount: `${number}`; offset?: `${number}`; filter: string; includePending: `${boolean}` } }>;