const { appendFile, access, mkdir } = require('node:fs/promises');

module.exports = class Log extends Function {
  constructor() {
    access('./Logs').catch(() => mkdir('./Logs'));
    super('...str', 'return this.log(...str)');

    const bound = this.bind(this);
    this.date = new Date().toLocaleDateString('en', { day: '2-digit', month: '2-digit', year: 'numeric' }).replaceAll('/', '-');
    bound.date = this.date;

    /* eslint-disable-next-line no-constructor-return */
    return bound; // NOSONAR
  }

  log(...str) { return this._log({ file: 'log' }, ...str); }
  warn(...str) { return this._log({ file: 'warn' }, ...str); }
  error(...str) { return this._log({ file: 'error' }, ...str); }
  debug(...str) { return this._log({ file: 'debug' }, ...str); }

  _log({ file = 'log', type = 'Bot' }, ...str) {
    const
      txt = `${new Date().toISOString()} ${type} | `,

      /** @type {typeof console.log} */
      log = console[file] ?? console.log;

    if (str.length) {
      if (file != 'debug') log(txt + str.join(' '));
      appendFile(`./Logs/${this.date}_${file}.log`, `${txt}${str}\n`);
      return this;
    }

    log('\n');
    appendFile(`./Logs/${this.date}_${file}.log`, '\n');
    return this;
  }
};