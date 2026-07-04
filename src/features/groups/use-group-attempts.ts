import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import type { AttemptLike } from '@/features/stats/compute-stats';
import { db } from '@/lib/firebase';

interface AttemptDoc extends AttemptLike {
  userId: string;
}

const FIRESTORE_IN_LIMIT = 30;

/** Firestore's `in` operator caps at 30 values, so groups near NFR-5's 50-member scale are chunked. */
export function useGroupAttempts(memberIds: string[]): Record<string, AttemptLike[]> {
  const [attemptsByUser, setAttemptsByUser] = useState<Record<string, AttemptLike[]>>({});
  const memberIdsKey = memberIds.join(',');

  useEffect(() => {
    if (memberIds.length === 0) {
      setAttemptsByUser({});
      return;
    }

    const chunks: string[][] = [];
    for (let i = 0; i < memberIds.length; i += FIRESTORE_IN_LIMIT) {
      chunks.push(memberIds.slice(i, i + FIRESTORE_IN_LIMIT));
    }

    const chunkDocs: AttemptDoc[][] = chunks.map(() => []);
    const unsubscribes = chunks.map((chunk, index) =>
      onSnapshot(query(collection(db, 'plankAttempts'), where('userId', 'in', chunk)), (snapshot) => {
        chunkDocs[index] = snapshot.docs.map((docSnap) => docSnap.data() as AttemptDoc);
        const grouped: Record<string, AttemptLike[]> = {};
        for (const attempt of chunkDocs.flat()) {
          (grouped[attempt.userId] ??= []).push(attempt);
        }
        setAttemptsByUser(grouped);
      })
    );

    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberIdsKey]);

  return attemptsByUser;
}
