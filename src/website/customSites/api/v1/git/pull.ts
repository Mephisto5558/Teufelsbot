import { constants } from 'node:http2';
import { gitpull } from '#utils';
import type { CustomPage } from '#types/locals';

const { HTTP_STATUS_OK, HTTP_STATUS_INTERNAL_SERVER_ERROR } = constants;


export default {
  run: async (res): Promise<unknown> => res.sendStatus((await gitpull()).message == 'OK' ? HTTP_STATUS_OK : HTTP_STATUS_INTERNAL_SERVER_ERROR)
} satisfies CustomPage;