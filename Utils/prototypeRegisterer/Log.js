const { appendFile, access, mkdir } = require('fs/promises');

module.exports = class Log extends Function {
  constructor() {
    access('./Logs').catch(() => mkdir('./Logs'));
    super('...args', 'return this.log(...args)');

    this.type = null;
    this.date = new Date().toLocaleDateString('en', { day: '2-digit', month: '2-digit', year: 'numeric' }).replaceAll('/', '-');
  }

  log(...str) { return this.#log('log', ...str); }
  error(...str) { return this.#log('error', ...str); }
  debug(...str) { return this.#log('debug', ...str); }

  setType(type) {
    this.type = type;
    return this;
  }

  #log(file = 'log', ...str) {
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