const
  { appendFile, access, mkdir } = require('node:fs/promises'),
  { join } = require('node:path');

const logLevels = {
  /* eslint-disable @typescript-eslint/no-magic-numbers -- this is like an enum */
  debug: 0,
  log: 1,
  info: 2,
  warn: 3,
  error: 4
  /* eslint-enable @typescript-eslint/no-magic-numbers */
};

module.exports = class Log extends Function {
  constructor(logLevel = 'log', logFilesDir = './Logs') {
    /* eslint-disable-next-line custom/no-async-constructor -- constructor functions cannot be async and we don't want an extra `init` function.
    We just hope the system has enough time to create the dir. */
    access(logFilesDir).catch(err => {
      if (err.code != 'ENOENT') throw err;

      void mkdir(logFilesDir);
    });

    super('...str', 'return this.log(...str)');

    /** @type {this} */
    const bound = this.bind(this);

    /* eslint-disable no-multi-assign -- this just makes more sense. */
    /* Setting it to `this` is required for top-level calls,
       Setting it to `bound` is required for chained calls */
    this.date = bound.date = new Date().toISOString().split('T')[0];
    this.logLevel = bound.logLevel = logLevel;
    this.logFilesDir = bound.logFilesDir = logFilesDir;
    /* eslint-enable no-multi-assign */

    /* eslint-disable-next-line no-constructor-return -- That return is required for the code to work. */
    return bound;
  }

  debug(...str) { return this._log({ file: 'debug' }, ...str); }
  log(...str) { return this._log({ file: 'log' }, ...str); }
  info(...str) { return this._log({ file: 'info' }, ...str); }
  warn(...str) { return this._log({ file: 'warn' }, ...str); }
  error(...str) { return this._log({ file: 'error' }, ...str); }

  /** @type {import('.').LogInterface['_logToConsole']} */
  _logToConsole({ file = 'log', type = 'Bot', prefix = `${new Date().toISOString()} ${type} | ` } = {}, ...str) {
    const log = console[file];

    if (!str.length) log('\n');
    else if (logLevels[file] >= logLevels[this.logLevel]) log(prefix + str.join(' '));

    return this;
  }

  /** @type {import('.').LogInterface['_logToFile']} */
  _logToFile({ file = 'log', type = 'Bot', prefix = `${new Date().toISOString()} ${type} | ` } = {}, ...str) {
    void appendFile(join(this.logFilesDir, `${this.date}_${file}.log`), str.length ? `${prefix}${str.join(' ')}\n` : '\n');
    return this;
  }

  /** @type {import('.').LogInterface['_log']} */
  _log({ file = 'log', type = 'Bot', prefix = `${new Date().toISOString()} ${type} | ` } = {}, ...str) {
    this._logToConsole({ file, type, prefix }, ...str);
    this._logToFile({ file, type, prefix }, ...str);

    return this;
  }
};