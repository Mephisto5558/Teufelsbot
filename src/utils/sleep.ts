import { promisify } from 'node:util';

/* eslint-disable-next-line @typescript-eslint/strict-void-return -- not fixable */
export default promisify(setTimeout);