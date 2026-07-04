import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { db } from '@/lib/firebase';
import type { GroupMembership, GroupRole } from '@/types/group';
import type { UserProfile } from '@/types/user';

export interface GroupMember {
  userId: string;
  role: GroupRole;
  displayName: string;
  avatarUrl: string | null;
}

export function useGroupMembers(groupId: string | undefined) {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    const membershipsQuery = query(collection(db, 'groupMemberships'), where('groupId', '==', groupId));
    const unsubscribe = onSnapshot(membershipsQuery, async (snapshot) => {
      const results = await Promise.all(
        snapshot.docs.map(async (membershipDoc) => {
          const membership = membershipDoc.data() as GroupMembership;
          const userSnap = await getDoc(doc(db, 'users', membership.userId));
          const profile = userSnap.exists() ? (userSnap.data() as UserProfile) : null;
          return {
            userId: membership.userId,
            role: membership.role,
            displayName: profile?.displayName ?? 'Plank Challenger',
            avatarUrl: profile?.avatarUrl ?? null,
          };
        })
      );
      setMembers(results);
      setLoading(false);
    });

    return unsubscribe;
  }, [groupId]);

  return { members, loading };
}
