export type GroupRole = 'creator' | 'member';

export interface Group {
  name: string;
  creatorId: string;
  inviteCode: string;
  createdAt: unknown;
}

export interface GroupMembership {
  groupId: string;
  userId: string;
  role: GroupRole;
  joinedAt: unknown;
}

export interface GroupWithMembership extends Group {
  id: string;
  role: GroupRole;
}
