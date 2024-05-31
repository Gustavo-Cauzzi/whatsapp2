import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export const snapshotToArray = <T>(
  querySnapshot: void | FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>,
): T[] => {
  if (!querySnapshot) return [];
  return querySnapshot.docs.map(doc => doc.data()) as T[];
};

export const snapshotToOne = <T>(
  querySnapshot: void | FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>,
): T | undefined => {
  return snapshotToArray<T>(querySnapshot)[0];
};

export const snapshotGroupedBy =
  <TEntity, TGrouper extends string | number | symbol>(
    groupedBy: (value: TEntity) => TGrouper,
  ) =>
  (
    querySnapshot: void | FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>,
  ) => {
    if (!querySnapshot) return {} as Record<TGrouper, TEntity[]>;
    const map = {} as Record<TGrouper, TEntity[]>;
    querySnapshot.forEach(doc => {
      const entity = doc.data() as TEntity;
      const key = groupedBy(entity);
      if (key in map) map[key].push(entity);
      else map[key] = [entity];
    });
    return map;
  };

export const snapshotToMap =
  <TEntity, TGrouper extends string | number | symbol>(
    groupedBy: (value: TEntity) => TGrouper,
  ) =>
  (
    querySnapshot: void | FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>,
  ) => {
    if (!querySnapshot) return {} as Record<TGrouper, TEntity>;
    const map = {} as Record<TGrouper, TEntity>;
    querySnapshot.forEach(doc => {
      const entity = doc.data() as TEntity;
      map[groupedBy(entity)] = entity;
    });
    return map;
  };
