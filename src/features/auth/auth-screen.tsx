import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { resetPassword, signIn, signUp } from '@/features/auth/auth-actions';
import { friendlyAuthError } from '@/features/auth/auth-errors';

type Mode = 'sign-in' | 'sign-up' | 'forgot-password';

export function AuthScreen() {
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'sign-in') {
        await signIn(email.trim(), password);
      } else if (mode === 'sign-up') {
        await signUp(email.trim(), password, displayName.trim() || email.trim());
      } else {
        await resetPassword(email.trim());
        setResetSent(true);
      }
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setResetSent(false);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Plank Challenge
        </ThemedText>

        <ThemedView style={styles.form}>
          {mode === 'sign-up' && (
            <ThemedTextInput
              placeholder="Display name"
              autoCapitalize="words"
              value={displayName}
              onChangeText={setDisplayName}
            />
          )}

          <ThemedTextInput
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          {mode !== 'forgot-password' && (
            <ThemedTextInput
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          )}

          {error && (
            <ThemedText themeColor="text" style={styles.error}>
              {error}
            </ThemedText>
          )}

          {resetSent && (
            <ThemedText themeColor="textSecondary">
              If that email is registered, a reset link is on its way.
            </ThemedText>
          )}

          <Pressable onPress={submit} disabled={submitting}>
            <ThemedView type="backgroundSelected" style={styles.submitButton}>
              {submitting ? (
                <ActivityIndicator />
              ) : (
                <ThemedText type="link">
                  {mode === 'sign-in' ? 'Sign in' : mode === 'sign-up' ? 'Create account' : 'Send reset email'}
                </ThemedText>
              )}
            </ThemedView>
          </Pressable>

          {mode === 'sign-in' && (
            <>
              <Pressable onPress={() => switchMode('forgot-password')}>
                <ThemedText type="link" themeColor="textSecondary">
                  Forgot password?
                </ThemedText>
              </Pressable>
              <Pressable onPress={() => switchMode('sign-up')}>
                <ThemedText type="link">Need an account? Sign up</ThemedText>
              </Pressable>
            </>
          )}

          {mode === 'sign-up' && (
            <Pressable onPress={() => switchMode('sign-in')}>
              <ThemedText type="link">Already have an account? Sign in</ThemedText>
            </Pressable>
          )}

          {mode === 'forgot-password' && (
            <Pressable onPress={() => switchMode('sign-in')}>
              <ThemedText type="link">Back to sign in</ThemedText>
            </Pressable>
          )}
        </ThemedView>
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
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.five,
    maxWidth: MaxContentWidth,
    width: '100%',
  },
  title: {
    textAlign: 'center',
  },
  form: {
    gap: Spacing.three,
  },
  submitButton: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
    alignItems: 'center',
  },
  error: {
    color: '#E5484D',
  },
});
