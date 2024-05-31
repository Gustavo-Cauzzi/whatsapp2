export const groupBy = <T, K extends PropertyKey>(
  list: T[],
  grouper: (item: T) => K,
) =>
  list.reduce((acc, cur) => {
    const key = grouper(cur);
    return {...acc, [key]: [...(acc[key] ?? []), cur]};
  }, {} as Record<K, T[] | undefined>) as Record<K, T[]>;

export const groupByAndMap = <T, K extends PropertyKey, R>(
  list: T[],
  grouper: (item: T) => K,
  mapper: (item: T, mappedItem?: R) => R,
) =>
  list.reduce((acc, cur) => {
    const key = grouper(cur);
    return {...acc, [key]: mapper(cur, acc[key])};
  }, {} as Record<K, R | undefined>) as Record<K, R>;

export function mapToArray<K extends PropertyKey, V, R>(
  m: Record<K, V>,
  transformer: (key: K, item: V) => R,
) {
  return Array.from(Object.entries(m)).map(([key, value]) =>
    transformer(key as K, value as V),
  );
}
