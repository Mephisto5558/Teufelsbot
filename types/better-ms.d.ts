declare module 'better-ms' {
  function ms<T extends string | number>(val: T, options: { long: boolean }): (T extends string ? number : string) | undefined;
  function getMilliseconds<T extends string | number>(val: T, options: { long: boolean }): (T extends string ? number : string) | undefined;

  class Duration {
    constructor(pattern: string);

    dateFrom(date: Date): Date;

    get fromNow(): Date;
    offset: number;

    static toNow(earlier: Date | number | string, showIn: boolean): string;

    static readonly regex: RegExp;
    static readonly commas: RegExp;
    static readonly aan: RegExp;
  }
}