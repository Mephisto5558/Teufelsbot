/* eslint-disable no-extend-native, @typescript-eslint/consistent-type-definitions, sonarjs/no-built-in-override -- setting custom globals */

import { randomInt } from 'node:crypto';

const globalPropOptions = {
  enumerable: false,
  configurable: true
} as const;

declare global {
  interface Array<T> {
    /**
     * Gets a random array element by generating a cryptographically secure random number using
     * {@link https://nodejs.org/api/crypto.html node:crypto}.
     *
     * Returns undefined if the array is empty. */
    random(this: T[]): T | undefined;

    /** Returns an array with no duplicates by converting it to a `Set` and back to an array. */
    unique(this: T[]): T[];
  }
}
Object.defineProperties(Array.prototype, {
  random: {
    value: function random(): unknown {
      return this.length ? this[randomInt(this.length)] : undefined;
    } satisfies unknown[]['random'],
    ...globalPropOptions
  },
  unique: {
    value: function unique(): unknown[] {
      return [...new Set(this)];
    } satisfies unknown[]['unique'],
    ...globalPropOptions
  }
});

declare global {
  interface Number {
    limit(this: Number, options?: { min?: number; max?: number }): number;

    /** @returns If the number is more than `min` and less than `max`. */
    inRange(this: Number, min?: number, max?: number): boolean;
  }
}
Object.defineProperties(Number.prototype, {
  limit: {
    value: function limit({ min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY } = {}): number {
      return Math.min(Math.max(this.valueOf(), min), max);
    } satisfies number['limit'],
    ...globalPropOptions
  },
  inRange: {
    value: function inRange(min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY): boolean {
      return this.valueOf() > min && this.valueOf() < max;
    } satisfies number['inRange'],
    ...globalPropOptions
  }
});

declare global {
  interface Object {
    /** The amount of items in the object. */
    get __count__(): number;
  }
}
Object.defineProperties(Object.prototype, {
  __count__: {
    get: function __count__(this: object): number {
      return Object.keys(this).length;
    },
    ...globalPropOptions
  }
});
Object.defineProperty(BigInt.prototype, 'toJSON', {
  value: function toJSON(this: bigint) {
    return this.toString();
  },
  ...globalPropOptions
});