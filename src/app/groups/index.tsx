import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import { createGroup, joinGroupByInviteCode } from '@/features/groups/group-actions';
import { useMyGroups } from '@/features/groups/use-my-groups';

export default function GroupsScreen() {
  const { user } = useAuth();
  const { groups, loading } = useMyGroups();
  const [newGroupName, setNewGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!user || !newGroupName.trim()) return;
    setError(null);
    setBusy(true);
    try {
      const groupId = await createGroup(user.uid, newGroupName.trim());
      setNewGroupName('');
      router.push({ pathname: '/groups/[id]', params: { id: groupId } });
    } catch {
      setError('Could not create the group. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = async () => {
    if (!user || !inviteCode.trim()) return;
    setError(null);
    setBusy(true);
    try {
      const groupId = await joinGroupByInviteCode(user.uid, inviteCode.trim());
      setInviteCode('');
      router.push({ pathname: '/groups/[id]', params: { id: groupId } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not join that group.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="subtitle">Groups</ThemedText>

          {groups.map((group) => (
            <Pressable
              key={group.id}
              onPress={() => router.push({ pathname: '/groups/[id]', params: { id: group.id } })}>
              <ThemedView type="backgroundElement" style={styles.groupRow}>
                <ThemedText type="smallBold">{group.name}</ThemedText>
                <ThemedText themeColor="textSecondary" type="small">
                  {group.role === 'creator' ? 'Creator' : 'Member'}
                </ThemedText>
              </ThemedView>
            </Pressable>
          ))}

          {!loading && groups.length === 0 && (
            <ThemedText themeColor="textSecondary">You're not in any groups yet.</ThemedText>
          )}

          {error && <ThemedText style={styles.error}>{error}</ThemedText>}

          <ThemedView style={styles.formSection}>
            <ThemedText type="smallBold">Create a group</ThemedText>
            <ThemedTextInput
              placeholder="Group name"
              value={newGroupName}
              onChangeText={setNewGroupName}
            />
            <Pressable onPress={handleCreate} disabled={busy || !newGroupName.trim()}>
              <ThemedView type="backgroundSelected" style={styles.actionButton}>
                <ThemedText type="link">Create</ThemedText>
              </ThemedView>
            </Pressable>
          </ThemedView>

          <ThemedView style={styles.formSection}>
            <ThemedText type="smallBold">Join a group</ThemedText>
            <ThemedTextInput
              placeholder="Invite code"
              autoCapitalize="characters"
              value={inviteCode}
              onChangeText={setInviteCode}
            />
            <Pressable onPress={handleJoin} disabled={busy || !inviteCode.trim()}>
              <ThemedView type="backgroundSelected" style={styles.actionButton}>
                <ThemedText type="link">Join</ThemedText>
              </ThemedView>
            </Pressable>
          </ThemedView>
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
    paddingTop: Spacing.six,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.three,
  },
  groupRow: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.half,
  },
  formSection: {
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
  actionButton: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
    alignItems: 'center',
  },
  error: {
    color: '#E5484D',
  },
});
