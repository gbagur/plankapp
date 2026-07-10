# Software Requirements Specification: PlankChallenge

## 1. Overview

PlankChallenge is a cross-platform (mobile + web) application that helps users build a daily plank habit by competing in small friend groups. Each user performs one plank per day, held until failure, timed by the app. Progress is tracked individually and compared within the group through shared stats and leaderboards.

**Platform:** iOS, Android, and Web (responsive), sharing one backend.

**v1 scope decisions:**
- No cheat-verification (honor system) — users self-report by starting/stopping the in-app timer.
- No social layer beyond stats and leaderboards (no comments, reactions, or badges in v1).

---

## 2. User Roles

| Role | Description |
|---|---|
| Registered User | Any authenticated person. Can create groups, join groups, log planks, view own and group stats. |
| Group Member | A user who has joined a specific group. Can log a daily plank for that group and view other members' stats within it. |
| Group Creator/Admin | The user who created a group. Can manage group settings (name, invite link, remove members). |

There is no separate "super admin" role required for v1 beyond basic backend/support access.

---

## 3. Functional Requirements

### 3.1 Account & Authentication
- FR-1.1: Users can sign up and log in via email/password and google OAuth provider.
- FR-1.2: Users have a profile with display name and optional avatar (use google avatar as default if available).
- FR-1.3: Users can reset their password.

### 3.2 Group Management
- FR-2.1: Any user can create a challenge group, giving it a name.
- FR-2.2: Group creation generates a shareable invite link/code.
- FR-2.3: Users can join a group via invite link/code.
- FR-2.4: A user can belong to multiple groups simultaneously.
- FR-2.5: Group creator can rename the group, add/remove members, or delete the group.
- FR-2.6: Any member can leave a group voluntarily.
- FR-2.7: Group has a defined member list visible to all members.

### 3.3 Plank Logging (Core Feature)
- FR-3.1: Each user can log one plank attempt per day shared accross all its groups (if in multiple groups, the same plank time apply to all groups)
- FR-3.2: The app provides a Start button that begins timing and a Stop button that ends timing.
- FR-3.3: While timing is active, the app displays the elapsed time live (updating at least every second).
- FR-3.4: Timing must continue accurately if the app is backgrounded (mobile) and resume displaying correctly when foregrounded.
- FR-3.5: On Stop, the app records: user ID, timestamp/date, duration (to 0.1s precision), and associated group(s).
- FR-3.6: A user cannot log a second plank for the same calendar day (per their local timezone).
- FR-3.7: If a user misses a day, that day is recorded as "no attempt" (0 or null) for streak/statistics purposes.
- FR-3.8: Users can view a history log of their own past attempts (date + duration). As a table and chart (default).
- FR-3.9: The app should prevent the phone to go to turn off the screen during the duration of the plank.
- FR-3.10: After today's plank is logged, the Timer screen offers a Delete action that, on user confirmation, removes today's attempt both locally and from Firestore (so it disappears from the user's history/stats and all their groups). Deleting clears the "one per day" lock (FR-3.6), returning the Timer to the idle state so the user can record a new plank for the same day.

### 3.4 Statistics & Progress Tracking
- FR-4.1: Each user has a personal stats view showing:
  - Current streak (consecutive days with a logged attempt)
  - Longest streak
  - Personal best duration
  - Daily duration over time (chart)
  - Week-over-week % change
  - Month-over-month % change
- FR-4.2: Aggregation periods: daily, weekly, monthly, all-time.
- FR-4.3: Trends are visualized with a line or bar chart of duration over the selected period.

### 3.5 Group Stats & Leaderboard
- FR-5.1: Any member of a group can view the stats/history of every other member in that group (durations, streaks, trend).
- FR-5.2: The group view includes a leaderboard ranking members by a selectable metric:
  - Today's time
  - Current streak
  - Weekly average
  - Personal best
- FR-5.3: Leaderboard updates in real time or near-real time (e.g., on refresh/within a few minutes) as members log attempts.
- FR-5.4: Group view shows a completion indicator for "who has/hasn't logged today."

### 3.6 Notifications (recommended, not blocking for v1)
- FR-6.1: Daily reminder notification if the user hasn't logged a plank yet.
- FR-6.2: Optional notification when a group member sets a new personal best.

---

## 4. Non-Functional Requirements

- NFR-1 (Accuracy): Timer must be accurate to within 0.1 seconds and unaffected by UI thread lag.
- NFR-2 (Reliability): A plank attempt in progress must not be lost due to app backgrounding, minor connectivity loss, or accidental navigation; only an explicit Stop or app kill ends it, and local persistence should allow recovery of an in-progress session after an unexpected app close.
- NFR-3 (Sync): Logged attempts sync across devices for the same account within a few seconds of connectivity being available.
- NFR-4 (Offline support): Users can start/stop and record a plank while offline; the result syncs when connectivity returns.
- NFR-5 (Scalability): Backend should support groups of at least 50 members without degraded leaderboard load times.
- NFR-6 (Performance): Group stats/leaderboard screens should load within 2 seconds under normal network conditions.
- NFR-7 (Privacy): Plank stats are visible only to members of the shared group(s); non-members cannot see a user's data.
- NFR-8 (Cross-platform consistency): Timer behavior and recorded values must be identical in logic between mobile and web clients.
- NFR-9 (Timezones): Daily boundaries are computed in each user's local timezone.

---

## 5. Data Model (high level)

**User**
- id, name, email, avatar_url, timezone, created_at

**Group**
- id, name, description, creator_id, invite_code, created_at

**GroupMembership**
- id, group_id, user_id, joined_at, role (creator/member)

**PlankAttempt**
- id, user_id, date, duration_seconds, started_at, ended_at, created_at
- Note: not tied to a single group_id if attempts are shared across all of a user's groups (per FR-3.1 default); otherwise add group_id.

---

## 6. Assumptions & Open Points to Confirm

- **One attempt shared across all groups vs. one per group**: **Confirmed (2026-07-04)** — one global daily attempt, visible in all of the user's groups. `PlankAttempt` has no `group_id`, matching the data model in Section 5.
- No verification/anti-cheat means stats integrity relies entirely on user honesty — worth stating explicitly in-app.
- No monetization, ads, or payment requirements specified — assumed out of scope for v1.
- No specified minimum/maximum group size — assumed unlimited unless stated otherwise.
- **Week-over-week / month-over-month % change (FR-4.1)**: computed on average daily duration for the period (missed days count as 0 toward the average, consistent with FR-3.7).
- **Streak calculation (FR-4.1)**: a missed day breaks the current streak, resetting it to 0.
- **Invite link/code (FR-2.2/2.3)**: implemented as a deep link with a web-URL fallback, so the same link works whether opened on a device with the app installed or in a browser.

---

## 7. Out of Scope for v1
- Video/camera or motion-sensor verification of plank form.
- Comments, reactions, badges, or achievement systems.
- Public/global leaderboards outside of a user's own groups.
- Coaching content, workout plans beyond the daily plank.

---

## 8. Technical Decisions (2026-07-04)

- **Delivery scope**: Mobile (iOS/Android) and Web built together from v1, not phased.
- **Client stack**: Expo (React Native + `react-native-web`), giving one TypeScript codebase for all three targets and satisfying NFR-8 (identical timer logic across platforms).
- **Backend**: Firebase (Firestore + Auth, incl. Google OAuth), chosen to cover NFR-3 (sync), NFR-4 (offline support via Firestore's built-in offline cache), and FR-5.3 (near-real-time leaderboard via Firestore listeners) without a hand-built sync layer. **Updated 2026-07-04**, switched from the originally planned Supabase — same rationale, different provider. Uses the Firebase JS SDK (not `@react-native-firebase`) so the app keeps running unmodified in Expo Go, without requiring a custom dev client build.
- **Infra/accounts**: No hosting or Firebase project exists yet — these will be created as development reaches the point of needing them.
- **Source control**: https://github.com/gbagur/plankapp (public).
