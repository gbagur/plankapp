import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { db } from '@/lib/firebase';
import type { Group } from '@/types/group';

export function useGroup(groupId: string | undefined) {
  const [group, setGroup] = useState<(Group & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) {
      setGroup(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    return onSnapshot(doc(db, 'groups', groupId), (snap) => {
      setGroup(snap.exists() ? { id: snap.id, ...(snap.data() as Group) } : null);
      setLoading(false);
    });
  }, [groupId]);

  return { group, loading };
}
