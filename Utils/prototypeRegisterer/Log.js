const
  { appendFile, access, mkdir } = require('node:fs/promises'),
  /* eslint-disable-next-line @typescript-eslint/unbound-method -- not an issue with `node:path`*/
  { join } = require('node:path');

const logLevels = {
  debug: 0,
  log: 1,
  info: 2,
  warn: 3,
  error: 4
};

module.exports = class Log extends Function {
  constructor(logLevel = 'log', logFilesDir = './Logs') {
    access(logFilesDir).catch(() => mkdir(logFilesDir));
    super('...str', 'return this.log(...str)');

    /** @type {this}*/
    const bound = this.bind(this);

    /* eslint-disable no-multi-assign -- this just makes more sense.*/
    /* Setting it to `this` is required for top-level calls,
       Setting it to `bound` is required for chained calls */
    this.date = bound.date = new Date().toLocaleDateString('en', { day: '2-digit', month: '2-digit', year: 'numeric' }).replaceAll('/', '-');
    this.logLevel = bound.logLevel = logLevel;
    this.logFilesDir = bound.logFilesDir = logFilesDir;
    /* eslint-enable no-multi-assign */

    /* eslint-disable-next-line no-constructor-return -- That return is required for the code to work. */
    return bound; // NOSONAR
  }

  debug(...str) { return this._log({ file: 'debug' }, ...str); }
  log(...str) { return this._log({ file: 'log' }, ...str); }
  info(...str) { return this._log({ file: 'info' }, ...str); }
  warn(...str) { return this._log({ file: 'warn' }, ...str); }
  error(...str) { return this._log({ file: 'error' }, ...str); }

  /** @type {import('.').Log['_log']} */
  _log({ file = 'log', type = 'Bot' }, ...str) {
    const
      txt = `${new Date().toISOString()} ${type} | `,
      log = console[file];

    if (str.length) {
      if (logLevels[file] >= logLevels[this.logLevel]) log(txt + str.join(' '));
      void appendFile(join(this.logFilesDir, `${this.date}_${file}.log`), `${txt}${str.join(' ')}\n`);
      return this;
    }

    log('\n');
    void appendFile(join(this.logFilesDir, `${this.date}_${file}.log`), '\n');
    return this;
  }
};