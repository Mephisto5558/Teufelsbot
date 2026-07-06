import { CustomPage } from '#types/locals';
import { constants } from 'node:http2';
import { gitpull } from '#utils';

const { HTTP_STATUS_OK, HTTP_STATUS_INTERNAL_SERVER_ERROR } = constants;


export default {
  run: async res => res.sendStatus((await gitpull()).message == 'OK' ? HTTP_STATUS_OK : HTTP_STATUS_INTERNAL_SERVER_ERROR)
} satisfies CustomPage;