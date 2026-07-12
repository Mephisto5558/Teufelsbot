import { appendFile } from 'node:fs/promises';
import { join } from 'node:path';

export enum LogLevel {
  debug = 0,
  log = 1,
  info = 2,
  warn = 3,
  error = 4
}

type LogOptions = { level?: LogLevel; type?: string; prefix?: string };
export type LogInstance<DIR extends string | boolean = './Logs'> = Log<DIR> & ((...str: unknown[]) => Log<DIR>);

export default class Log<DIR extends string | boolean = './Logs'> extends Function implements CallableFunction {
  logLevel: LogLevel;
  logFilesDir: DIR extends string ? DIR : never;

  constructor(logLevel: LogLevel = LogLevel.log, logFilesDir: DIR = './Logs' as DIR) {
    super('...str', 'return this.log(...str)');

    /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- `this` is `this` */
    const bound = this.bind(this) as this;

    /* eslint-disable no-multi-assign -- this just makes more sense. */
    /* Setting it to `this` is required for top-level calls,
       Setting it to `bound` is required for chained calls. */
    this.logLevel = bound.logLevel = logLevel;
    if (logFilesDir) this.logFilesDir = bound.logFilesDir = logFilesDir;
    /* eslint-enable no-multi-assign */

    /* eslint-disable-next-line no-constructor-return -- This return is required to make the instance callable. */
    return bound;
  }

  debug(...str: unknown[]): this { return this.logToAll({ level: LogLevel.debug }, ...str); }
  log(...str: unknown[]): this { return this.logToAll({ level: LogLevel.log }, ...str); }
  info(...str: unknown[]): this { return this.logToAll({ level: LogLevel.info }, ...str); }
  warn(...str: unknown[]): this { return this.logToAll({ level: LogLevel.warn }, ...str); }
  error(...str: unknown[]): this { return this.logToAll({ level: LogLevel.error }, ...str); }

  logToConsole(
    { level = LogLevel.log, type = 'Bot', prefix = `${Temporal.Now.instant().toString()} ${type} | ` }: LogOptions = {},
    ...str: unknown[]
  ): this {
    const log = console[LogLevel[level] as keyof typeof LogLevel];

    if (!str.length) log('\n');
    else if (level >= this.logLevel) log(prefix + str.join(' '));

    return this;
  }

  logToFile(
    { level = LogLevel.log, type = 'Bot', prefix = `${Temporal.Now.instant().toString()} ${type} | ` }: LogOptions = {},
    ...str: unknown[]
  ): this {
    if (this.logFilesDir) {
      const filename = `${Temporal.Now.plainDateISO().toString()}_${LogLevel[level]}.log`;
      void appendFile(join(this.logFilesDir, filename), str.length ? `${prefix}${str.join(' ')}\n` : '\n');
    }

    return this;
  }

  logToAll(
    { level = LogLevel.log, type = 'Bot', prefix = `${Temporal.Now.instant().toString()} ${type} | ` }: LogOptions = {},
    ...str: unknown[]
  ): this {
    this.logToConsole({ level, type, prefix }, ...str);
    this.logToFile({ level, type, prefix }, ...str);

    return this;
  }
}