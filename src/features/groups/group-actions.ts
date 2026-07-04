import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import type { Group } from '@/types/group';

const INVITE_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous 0/O/1/I

function generateInviteCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += INVITE_CODE_CHARS[Math.floor(Math.random() * INVITE_CODE_CHARS.length)];
  }
  return code;
}

function membershipId(userId: string, groupId: string): string {
  return `${userId}_${groupId}`;
}

export async function createGroup(userId: string, name: string): Promise<string> {
  const groupRef = doc(collection(db, 'groups'));
  const batch = writeBatch(db);
  batch.set(groupRef, {
    name,
    creatorId: userId,
    inviteCode: generateInviteCode(),
    createdAt: serverTimestamp(),
  });
  batch.set(doc(db, 'groupMemberships', membershipId(userId, groupRef.id)), {
    groupId: groupRef.id,
    userId,
    role: 'creator',
    joinedAt: serverTimestamp(),
  });
  await batch.commit();
  return groupRef.id;
}

export async function joinGroupByInviteCode(userId: string, inviteCode: string): Promise<string> {
  const normalized = inviteCode.trim().toUpperCase();
  const matches = await getDocs(query(collection(db, 'groups'), where('inviteCode', '==', normalized)));
  const groupDoc = matches.docs[0];
  if (!groupDoc) {
    throw new Error('That invite code doesn’t match any group.');
  }

  const membershipRef = doc(db, 'groupMemberships', membershipId(userId, groupDoc.id));
  const existing = await getDoc(membershipRef);
  if (existing.exists()) {
    return groupDoc.id;
  }

  await setDoc(membershipRef, {
    groupId: groupDoc.id,
    userId,
    role: 'member',
    joinedAt: serverTimestamp(),
  });
  return groupDoc.id;
}

export async function leaveGroup(userId: string, groupId: string): Promise<void> {
  await deleteDoc(doc(db, 'groupMemberships', membershipId(userId, groupId)));
}

export async function renameGroup(groupId: string, name: string): Promise<void> {
  await updateDoc(doc(db, 'groups', groupId), { name });
}

export async function removeMember(groupId: string, memberUserId: string): Promise<void> {
  await deleteDoc(doc(db, 'groupMemberships', membershipId(memberUserId, groupId)));
}

export async function deleteGroup(groupId: string): Promise<void> {
  const memberships = await getDocs(query(collection(db, 'groupMemberships'), where('groupId', '==', groupId)));
  const batch = writeBatch(db);
  memberships.docs.forEach((membershipDoc) => batch.delete(membershipDoc.ref));
  batch.delete(doc(db, 'groups', groupId));
  await batch.commit();
}

export async function getGroup(groupId: string): Promise<(Group & { id: string }) | null> {
  const snap = await getDoc(doc(db, 'groups', groupId));
  return snap.exists() ? { id: snap.id, ...(snap.data() as Group) } : null;
}
