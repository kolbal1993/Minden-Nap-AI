/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * useFirestoreCollection — generic Firestore collection hook.
 *
 * Subscribes to a Firestore collection via onSnapshot (realtime) by default,
 * or fetches once via getDocs (one-shot). Returns loading, error, and the
 * normalized array of docs (each doc carries its `id` plus all fields).
 *
 * No mock/fallback data — if the collection is empty, `data` will be [].
 * This is intentional: the admin panels must show EmptyState, NOT fake
 * numbers, when Firestore has nothing.
 *
 * Usage:
 *   const { data, loading, error } = useFirestoreCollection('users', { orderBy: 'createdAt' });
 *   const { data, loading, error } = useFirestoreCollection('courses', { realtime: false });
 */
import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  type QueryConstraint,
  type DocumentData,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export interface FirestoreDoc {
  id: string;
  [key: string]: unknown;
}

interface UseFirestoreCollectionOptions {
  /** Order by a field (default: no ordering) */
  orderBy?: string;
  /** Order direction (default: 'desc') */
  orderDirection?: 'asc' | 'desc';
  /** Max docs to fetch (default: 500) */
  max?: number;
  /** Realtime via onSnapshot (default: true). Set false for one-shot getDocs. */
  realtime?: boolean;
  /** Where filters — single field-equality pair per entry: [field, op, value]. */
  filters?: Array<[string, '==' | '!=' | '>=' | '<=', unknown]>;
}

interface UseFirestoreCollectionResult {
  data: FirestoreDoc[];
  loading: boolean;
  error: Error | null;
}

export function useFirestoreCollection(
  collectionName: string,
  options: UseFirestoreCollectionOptions = {},
): UseFirestoreCollectionResult {
  const realtime = options.realtime !== false;
  const [data, setData] = useState<FirestoreDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!collectionName) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    const buildQuery = () => {
      const ref = collection(db, collectionName);
      const constraints: QueryConstraint[] = [];

      if (options.filters) {
        for (const [field, op, value] of options.filters) {
          constraints.push(where(field, op, value));
        }
      }
      if (options.orderBy) {
        constraints.push(orderBy(options.orderBy, options.orderDirection || 'desc'));
      }
      if (options.max) {
        constraints.push(limit(options.max));
      }
      return query(ref, ...constraints);
    };

    const handleSnapshot = (docs: DocumentData[], mapIds: boolean) => {
      const items: FirestoreDoc[] = docs.map((snap) => {
        const raw = snap.data ? snap.data() : snap;
        return { id: snap.id, ...raw };
      });
      if (isMounted) {
        setData(items);
        setLoading(false);
      }
      void mapIds;
    };

    try {
      if (realtime) {
        const q = buildQuery();
        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const docs = snapshot.docs.map((d) => d);
            handleSnapshot(docs as unknown as DocumentData[], true);
          },
          (err) => {
            console.error(`[useFirestoreCollection:${collectionName}] snapshot error:`, err);
            handleFirestoreError(err, OperationType.LIST, collectionName);
            if (isMounted) {
              setError(err instanceof Error ? err : new Error(String(err)));
              setLoading(false);
            }
          },
        );
      } else {
        // One-shot read
        (async () => {
          try {
            const q = buildQuery();
            const snap = await getDocs(q);
            const docs = snap.docs.map((d) => d);
            handleSnapshot(docs as unknown as DocumentData[], true);
          } catch (err) {
            console.error(`[useFirestoreCollection:${collectionName}] getDocs error:`, err);
            try {
              handleFirestoreError(err, OperationType.LIST, collectionName);
            } catch (rethrown) {
              if (isMounted) {
                setError(rethrown instanceof Error ? rethrown : new Error(String(rethrown)));
                setLoading(false);
              }
            }
            if (isMounted) setLoading(false);
          }
        })();
      }
    } catch (err) {
      console.error(`[useFirestoreCollection:${collectionName}] setup error:`, err);
      if (isMounted) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, options.realtime ? 'rt' : 'oneshot', options.orderBy, options.orderDirection, options.max]);

  return { data, loading, error };
}
