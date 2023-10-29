const { appendFile, access, mkdir } = require('fs/promises');

module.exports = class Log extends Function {
  constructor() {
    access('./Logs').catch(() => mkdir('./Logs'));
    super('...str', 'return this.log(...str)');

    this.type = null;
    this.date = new Date().toLocaleDateString('en', { day: '2-digit', month: '2-digit', year: 'numeric' }).replaceAll('/', '-');

    return this.bind(this); //NOSONAR
  }

  log(...str) { return this._log('log', ...str); }
  warn(...str) { return this._log('warn', ...str); }
  error(...str) { return this._log('error', ...str); }
  debug(...str) { return this._log('debug', ...str); }

  setType(type) {
    this.type = type;
    return this;
  }

  _log(file = 'log', ...str) {
    const
      txt = `${new Date().toISOString()} ${this.type ?? 'Bot'} | `,
      log = console[file] || console.log;

    if (arguments.length) {
      if (file != 'debug') log(txt + str.join(' '));
      appendFile(`./Logs/${this.date}_${file}.log`, `${txt}${str}\n`);
      return this;
    }

    if (file != 'debug') log('\n');
    appendFile(`./Logs/${this.date}_${file}.log`, '\n');
    return this;
  }
};