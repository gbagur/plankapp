import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import {
  deleteGroup,
  leaveGroup,
  removeMember,
  renameGroup,
} from '@/features/groups/group-actions';
import { useGroup } from '@/features/groups/use-group';
import { useGroupMembers } from '@/features/groups/use-group-members';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { group } = useGroup(id);
  const { members } = useGroupMembers(id);
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [busy, setBusy] = useState(false);

  if (!group || !user) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} />
      </ThemedView>
    );
  }

  const isCreator = group.creatorId === user.uid;

  const shareInvite = () => {
    Share.share({
      message: `Join my Plank Challenge group "${group.name}"! Use invite code ${group.inviteCode} in the app.`,
    });
  };

  const startRename = () => {
    setNameDraft(group.name);
    setRenaming(true);
  };

  const saveRename = async () => {
    if (!nameDraft.trim()) return;
    setBusy(true);
    try {
      await renameGroup(group.id, nameDraft.trim());
      setRenaming(false);
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = async () => {
    setBusy(true);
    try {
      await leaveGroup(user.uid, group.id);
      router.back();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deleteGroup(group.id);
      router.back();
    } finally {
      setBusy(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renaming ? (
            <ThemedView style={styles.renameRow}>
              <ThemedTextInput style={styles.renameInput} value={nameDraft} onChangeText={setNameDraft} />
              <Pressable onPress={saveRename} disabled={busy}>
                <ThemedText type="link">Save</ThemedText>
              </Pressable>
            </ThemedView>
          ) : (
            <Pressable onPress={isCreator ? startRename : undefined}>
              <ThemedText type="subtitle">{group.name}</ThemedText>
            </Pressable>
          )}

          <Pressable onPress={shareInvite}>
            <ThemedView type="backgroundElement" style={styles.inviteCard}>
              <ThemedText themeColor="textSecondary" type="small">
                Invite code
              </ThemedText>
              <ThemedText type="title" style={styles.inviteCode}>
                {group.inviteCode}
              </ThemedText>
              <ThemedText type="link">Share</ThemedText>
            </ThemedView>
          </Pressable>

          <ThemedText type="smallBold">Members</ThemedText>
          {members.map((member) => (
            <ThemedView key={member.userId} type="backgroundElement" style={styles.memberRow}>
              <ThemedText>{member.displayName}</ThemedText>
              {isCreator && member.userId !== user.uid && (
                <Pressable onPress={() => removeMember(group.id, member.userId)} disabled={busy}>
                  <ThemedText themeColor="textSecondary" type="small">
                    Remove
                  </ThemedText>
                </Pressable>
              )}
            </ThemedView>
          ))}

          <Pressable onPress={handleLeave} disabled={busy}>
            <ThemedView type="backgroundElement" style={styles.dangerButton}>
              <ThemedText type="link">Leave group</ThemedText>
            </ThemedView>
          </Pressable>

          {isCreator && (
            <Pressable onPress={handleDelete} disabled={busy}>
              <ThemedView type="backgroundElement" style={styles.dangerButton}>
                <ThemedText style={styles.deleteText}>Delete group</ThemedText>
              </ThemedView>
            </Pressable>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.four,
  },
  renameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  renameInput: {
    flex: 1,
  },
  inviteCard: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
    gap: Spacing.one,
  },
  inviteCode: {
    letterSpacing: 4,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  dangerButton: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
    alignItems: 'center',
  },
  deleteText: {
    color: '#E5484D',
  },
});
