# Removed Features Documentation

## Group Model (Removed during Code Audit - [Date])

### Reason for Removal

- Model was documented as "complete" but had no implementation
- No routes, controllers, or tests
- No usage anywhere in codebase
- Feature: Multi-member family groups for guardians

### Original Purpose

Group.js was designed for family groups where multiple guardians could monitor multiple children as a unit (e.g., 2 parents monitoring 3 kids). This differed from GuardianLink which handles 1:1 guardian-child relationships.

### Features Included

- Multi-member support (guardians + children)
- Group-level settings (min pomodoros, daily goals, peer viewing)
- Reward system configuration
- Join codes for inviting members
- Activity tracking
- Statistics aggregation

### Current Alternative

GuardianLink.js provides 1:1 guardian-child relationships with permissions system. For multi-child monitoring, guardians create separate links with each child.

### Future Restoration

If group functionality is needed:

1. Restore `backend/models/Group.js` from git history (commit before deletion)
2. Create `backend/routes/groups.js` and `backend/controllers/groupController.js`
3. Add tests in `backend/tests/unit/models/Group.test.js`
4. Update frontend to support group features
5. Consider database migration for existing GuardianLink data

### File Location in Git History

`backend/models/Group.js` - Last commit: [Will be added after deletion]

---

## Unused Frontend Components (Removed during Code Audit - [Date])

### NetworkStatusBar.js (REMOVED)

- **Reason:** Never imported or used anywhere in the app
- **Functionality:** Shows network connection status with animated banner
- **Alternative:** App works without explicit network status UI

### OfflineIndicator.js (REMOVED)

- **Reason:** Never imported or used anywhere in the app
- **Functionality:** Shows snackbar when offline using useNetworkStatus hook
- **Alternative:** App works without explicit offline indicator

### TimerCard.js (REMOVED)

- **Reason:** Never imported or used anywhere in the app
- **Functionality:** Card wrapper for timer display
- **Alternative:** Timer.js component used directly

### ActiveSessionTracker.js (REMOVED)

- **Reason:** Never imported or used anywhere in the app
- **Functionality:** Tracks active pomodoro sessions
- **Alternative:** PomodoroContext handles session tracking

All files can be restored from git history if needed.
