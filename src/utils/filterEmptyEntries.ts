const isEmpty = (e: unknown): boolean => e === undefined || e === null || (Array.isArray(e) && !e.length) || (typeof e === 'object' && !e.__count__);

/**
 * Removes `null`, `undefined`, empty arrays and empty objects recursively from an object or array.
 * @returns an empty object `{}` for any non-object input (e.g. primitives, `null`). */
export default function filterEmptyEntries(obj: unknown): Record<PropertyKey, unknown> {
  if (typeof obj !== 'object' || obj === null) return {};

  return Object.entries(obj as Record<PropertyKey, unknown>).reduce<Record<PropertyKey, unknown>>((acc, [k, v]) => {
    if (isEmpty(v)) return acc;
    if (v instanceof Object) {
      const newValue = filterEmptyEntries(v);
      if (isEmpty(newValue)) return acc;
      acc[k] = Array.isArray(v) ? Object.values(newValue) : newValue;
    }
    else acc[k] = v;

    return acc;
  }, {});
}