# Hướng Dẫn Migration Localization cho DeepFocus

## Tổng Quan

File này hướng dẫn cách migrate các screen và component từ hardcoded Vietnamese text sang hệ thống đa ngôn ngữ với `useLanguage()` hook.

## Bước 1: Import useLanguage Hook

```javascript
import { useLanguage } from "../contexts/LanguageContext";

// Trong component
const { t, language, changeLanguage } = useLanguage();
```

## Bước 2: Thay Thế Hardcoded Text

### Pattern Cơ Bản

**Trước:**

```javascript
<Text>Trang Chủ</Text>
```

**Sau:**

```javascript
<Text>{t("navigation.home")}</Text>
```

### Pattern với Interpolation

**Trước:**

```javascript
<Text>Sau {pomodorosUntilLongBreak} pomodoro sẽ có nghỉ dài</Text>
```

**Sau:**

```javascript
<Text>
  {t("settings.pomodorosUntilLongBreakDesc", {
    count: pomodorosUntilLongBreak,
  })}
</Text>
```

### Pattern với Conditional

**Trước:**

```javascript
<Text>{testMode ? "5 giây" : `${shortBreakDuration} phút`}</Text>
```

**Sau:**

```javascript
<Text>
  {testMode
    ? `5 ${t("settings.seconds")}`
    : `${shortBreakDuration} ${t("settings.minutes")}`}
</Text>
```

## Bước 3: Migration Checklist cho SettingsScreen

### Test Mode Section

```javascript
// Line ~972-989
<Text variant="bodyLarge">
  {t('settings.testMode')} 🧪
</Text>
<Text variant="bodySmall">
  {t('settings.testModeDesc')}
</Text>
<Text variant="bodySmall">
  ⚠️ {t('settings.testModeWarning')}
</Text>
```

### Timer Settings

```javascript
// Line ~998
<Card.Title title={`⏱️ ${t('settings.timerSettings')}`} />

// Work Duration (~1002-1010)
<Text variant="bodyLarge">{t('settings.workDuration')}</Text>
<Text>{testMode ? `10 ${t('stats.seconds')}` : `${workDuration} ${t('settings.minutes')}`}</Text>

// Short Break (~1036-1044)
<Text variant="bodyLarge">{t('settings.shortBreakDuration')}</Text>
<Text>{testMode ? `5 ${t('stats.seconds')}` : `${shortBreakDuration} ${t('settings.minutes')}`}</Text>

// Long Break (~1067-1075)
<Text variant="bodyLarge">{t('settings.longBreakDuration')}</Text>
<Text>{testMode ? `10 ${t('stats.seconds')}` : `${longBreakDuration} ${t('settings.minutes')}`}</Text>
```

### Break Interval Section

```javascript
// Line ~1113
<Card.Title title={`🔄 ${t('settings.behaviorSettings')}`} />

<Text>{t('settings.pomodorosUntilLongBreak')}</Text>
<Text>{t('settings.pomodorosUntilLongBreakDesc', { count: pomodorosUntilLongBreak })}</Text>
```

### Goal Settings

```javascript
<Text>{t('settings.dailyGoalLabel')}</Text>
<Text>{t('settings.dailyGoalDesc')}</Text>
<Text>{`${dailyGoal} ${t('settings.goalPomodoros')}`}</Text>
```

### Auto-Start Section

```javascript
// Line ~1184
<Card.Title title={`🚀 ${t('settings.behaviorSettings')}`} />

<Text>{t('settings.autoStartBreaks')}</Text>
<Text>{t('settings.autoStartBreaksDesc')}</Text>

<Text>{t('settings.autoStartPomodoros')}</Text>
<Text>{t('settings.autoStartPomodorosDesc')}</Text>
```

### Notification Section

```javascript
// Line ~1226
<Card.Title title={`🔔 ${t('settings.notificationSettings')}`} />

<Text>{t('settings.enableNotifications')}</Text>
<Text>{t('settings.enableNotificationsDesc')}</Text>

<Text>{t('settings.soundEnabled')}</Text>
<Text>{t('settings.soundEnabledDesc')}</Text>

<Text>{t('settings.vibrationEnabled')}</Text>
<Text>{t('settings.vibrationEnabledDesc')}</Text>
```

### Account Section

```javascript
// Line ~1316
<Card.Title title={`👤 ${t('settings.accountSettings')}`} />

<Text>{user?.username || t('settings.username')}</Text>
<Text>{user?.email || t('settings.email')}</Text>

<Button onPress={handleLogout}>
  {t('settings.logout')}
</Button>
```

### App Info Section

```javascript
// Line ~1362
<Card.Title title={`ℹ️ ${t('settings.appInfo')}`} />

<List.Item title={t('settings.version')} />
<List.Item title={t('settings.aboutApp')} />
<List.Item title={t('settings.privacyPolicy')} />
<List.Item title={t('settings.termsOfService')} />
```

### Action Buttons

```javascript
// Bottom buttons
<Button onPress={handleSaveSettings}>
  {t('settings.saveSettings')}
</Button>

<Button onPress={handleResetSettings}>
  {t('settings.resetToDefault')}
</Button>

<Button onPress={handleDiscardChanges}>
  {t('settings.discardChanges')}
</Button>
```

### Alert Dialogs

```javascript
// Reset confirmation
Alert.alert(
  t("alerts.resetSettings.title"),
  t("alerts.resetSettings.message"),
  [
    {
      text: t("alerts.resetSettings.cancel"),
      style: "cancel",
    },
    {
      text: t("alerts.resetSettings.confirm"),
      style: "destructive",
      onPress: () => {
        // Reset logic
        setSnackbarMessage(t("settings.settingsReset"));
      },
    },
  ]
);

// Logout confirmation
Alert.alert(t("alerts.logout.title"), t("alerts.logout.message"), [
  {
    text: t("alerts.logout.cancel"),
    style: "cancel",
  },
  {
    text: t("alerts.logout.confirm"),
    style: "destructive",
    onPress: logout,
  },
]);

// Unsaved changes
Alert.alert(
  t("alerts.unsavedChanges.title"),
  t("alerts.unsavedChanges.message"),
  [
    {
      text: t("alerts.unsavedChanges.discard"),
      style: "destructive",
      onPress: handleDiscard,
    },
    {
      text: t("alerts.unsavedChanges.save"),
      onPress: handleSave,
    },
  ]
);
```

### Snackbar Messages

```javascript
setSnackbarMessage(t("settings.settingsSaved"));
setSnackbarMessage(t("settings.settingsReset"));
```

## Bước 4: Language Selector UI (NEW)

Thêm Language section trong SettingsScreen:

```javascript
{
  /* Language Settings Section - NEW */
}
<Card style={styles.card}>
  <Card.Title
    title={`🌐 ${t("settings.languageSettings")}`}
    titleStyle={styles.cardTitle}
  />
  <Card.Content>
    <List.Item
      title={t("settings.vietnamese")}
      description="Tiếng Việt"
      right={() =>
        language === "vi" && (
          <List.Icon icon="check" color={theme.colors.primary} />
        )
      }
      onPress={() => changeLanguage("vi")}
      style={styles.languageItem}
    />
    <Divider />
    <List.Item
      title={t("settings.english")}
      description="English"
      right={() =>
        language === "en" && (
          <List.Icon icon="check" color={theme.colors.primary} />
        )
      }
      onPress={() => changeLanguage("en")}
      style={styles.languageItem}
    />
  </Card.Content>
</Card>;
```

Add styles:

```javascript
languageItem: {
  paddingVertical: 8,
},
```

## Bước 5: Update Utility Functions

Khi sử dụng helpers, truyền language parameter:

```javascript
import { formatDate, formatWorkTime, formatNumber } from "../utils/helpers";

// Usage
const formattedDate = formatDate(new Date(), language);
const workTime = formatWorkTime(totalSeconds, language);
const number = formatNumber(count, language);
```

## Bước 6: Migration Pattern cho Các Screen Khác

### HomeScreen.js

```javascript
import { useLanguage } from "../contexts/LanguageContext";

const HomeScreen = () => {
  const { t } = useLanguage();

  return (
    <View>
      <Text variant="headlineLarge">{t("home.title")}</Text>
      <Button>{t("home.start")}</Button>
      <Button>{t("home.pause")}</Button>
      <Text>{t("home.dailyProgress")}</Text>
      <Text>{t("home.pomodorosToday")}</Text>
    </View>
  );
};
```

### TasksScreen.js

```javascript
const { t } = useLanguage();

<Button>{t('tasks.addTask')}</Button>
<TextInput placeholder={t('tasks.taskTitlePlaceholder')} />
<Text>{t('tasks.priority')}: {t(`tasks.priority${priority}`)}</Text>
<Button>{t('tasks.save')}</Button>
<Button>{t('tasks.cancel')}</Button>
```

### StatisticsScreen.js

```javascript
const { t, language } = useLanguage();

<Text>{t('stats.statistics')}</Text>
<Text>{t('stats.totalPomodoros')}: {formatNumber(total, language)}</Text>
<Text>{t('stats.focusTime')}: {formatWorkTime(seconds, language)}</Text>
<Text>{t('stats.today')}</Text>
<Text>{t('stats.thisWeek')}</Text>
```

### LoginScreen.js / RegisterScreen.js

```javascript
const { t } = useLanguage();

<TextInput placeholder={t('auth.emailPlaceholder')} />
<TextInput placeholder={t('auth.passwordPlaceholder')} />
<Button>{t('auth.login')}</Button>
<Button>{t('auth.register')}</Button>
<Text>{t('auth.forgotPassword')}</Text>
```

## Bước 7: Test Checklist

- [ ] All screens load without errors
- [ ] All text displays correctly in Vietnamese (default)
- [ ] Language switch works (Vietnamese ↔ English)
- [ ] Language preference persists after app restart
- [ ] No console warnings about missing translations
- [ ] Date/time formats correctly for each language
- [ ] Numbers format correctly (1,000 vs 1.000)
- [ ] Alert dialogs show translated text
- [ ] Snackbar messages show translated text
- [ ] Navigation labels show translated text
- [ ] Placeholders show translated text

## Translation Keys Structure

```
translations.vi/en
├── navigation (home, statistics, settings, tasks)
├── home (title, start, pause, resume, etc.)
├── timer (workSession, breakTime, completed)
├── tasks (addTask, editTask, save, delete, etc.)
├── stats (statistics, totalPomodoros, focusTime)
├── settings (all settings keys)
├── auth (login, register, email, password)
├── completion (excellent, wellDone, pomodoroComplete)
├── motivation (start, keepGoing, goalAchieved)
├── general (loading, saving, error, success)
├── dateTime (today, yesterday, monday, january)
├── taskSelector (title, selectTask, search)
├── errors (generic, network, timeout)
└── alerts (deleteTask, logout, resetSettings)
```

## Best Practices

1. **Always use t() function** - Never hardcode text
2. **Group related translations** - Use dot notation (e.g., `settings.workDuration`)
3. **Use string interpolation** - For dynamic values: `t('key', {count: 5})`
4. **Provide fallbacks** - Key returns if translation missing
5. **Console warnings** - Check for missing translations during development
6. **Test both languages** - Ensure all text translates correctly
7. **Update translations.js** - When adding new features, add keys immediately
8. **Use language parameter** - Pass to utility functions for formatting

## Example: Complete Component Migration

**Before:**

```javascript
const TaskCard = ({ task }) => {
  return (
    <Card>
      <Text>Nhiệm vụ: {task.title}</Text>
      <Text>Độ ưu tiên: {task.priority}</Text>
      <Button>Chỉnh sửa</Button>
      <Button>Xóa</Button>
    </Card>
  );
};
```

**After:**

```javascript
import { useLanguage } from "../contexts/LanguageContext";

const TaskCard = ({ task }) => {
  const { t } = useLanguage();

  return (
    <Card>
      <Text>
        {t("tasks.taskTitle")}: {task.title}
      </Text>
      <Text>
        {t("tasks.priority")}: {t(`tasks.priority${task.priority}`)}
      </Text>
      <Button>{t("tasks.edit")}</Button>
      <Button>{t("tasks.delete")}</Button>
    </Card>
  );
};
```

## Kết Luận

Hệ thống localization đã được thiết lập hoàn chỉnh với:

- ✅ Complete translation files (Vietnamese & English)
- ✅ LanguageContext with AsyncStorage persistence
- ✅ t() function với string interpolation
- ✅ Utility functions hỗ trợ formatting theo locale
- ✅ Migration pattern rõ ràng cho tất cả components
- ✅ Language selector UI trong Settings

Tiếp tục migrate từng screen theo pattern trên để hoàn thiện hệ thống!
