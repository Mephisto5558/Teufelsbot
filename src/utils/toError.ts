export default function toError<E extends Error>(err: E): E;

/** Coverts `err` to an error instance, or uses `defaultVal` if `err` is `undefined`. */
export default function toError(err: unknown, defaultVal?: unknown): Error;

export default function toError(err: unknown, defaultVal?: unknown): Error {
  return Error.isError(err) ? err : new Error(String(err ?? defaultVal));
}