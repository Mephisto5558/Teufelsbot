/** @import { customPage } from '#types/locals' */

const
  { HTTP_STATUS_OK, HTTP_STATUS_INTERNAL_SERVER_ERROR } = require('node:http2').constants,
  { gitpull } = require('#Utils');


/** @type {customPage} */
module.exports = {
  run: async res => res.sendStatus((await gitpull()).message == 'OK' ? HTTP_STATUS_OK : HTTP_STATUS_INTERNAL_SERVER_ERROR)
};