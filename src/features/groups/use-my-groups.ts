import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { useAuth } from '@/features/auth/auth-context';
import { db } from '@/lib/firebase';
import type { Group, GroupMembership, GroupWithMembership } from '@/types/group';

export function useMyGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<GroupWithMembership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setGroups([]);
      setLoading(false);
      return;
    }

    const membershipsQuery = query(collection(db, 'groupMemberships'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(membershipsQuery, async (snapshot) => {
      const results = await Promise.all(
        snapshot.docs.map(async (membershipDoc) => {
          const membership = membershipDoc.data() as GroupMembership;
          const groupSnap = await getDoc(doc(db, 'groups', membership.groupId));
          if (!groupSnap.exists()) return null;
          return { id: groupSnap.id, ...(groupSnap.data() as Group), role: membership.role };
        })
      );
      setGroups(results.filter((group): group is GroupWithMembership => group !== null));
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  return { groups, loading };
}
