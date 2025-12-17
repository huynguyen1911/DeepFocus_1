# Quick Start: Migrating Screens to Localization

## 1. HomeScreen.js Example

```javascript
import React from "react";
import { View, Text, Button } from "react-native";
import { useLanguage } from "../contexts/LanguageContext";
import { formatDate, formatNumber } from "../utils/helpers";

const HomeScreen = () => {
  const { t, language } = useLanguage();
  const [pomodorosToday, setPomodorosToday] = useState(3);
  const dailyGoal = 8;

  return (
    <View>
      {/* Title */}
      <Text variant="headlineLarge">{t("home.title")}</Text>
      <Text variant="bodyMedium">{t("home.subtitle")}</Text>

      {/* Timer Controls */}
      <Button onPress={handleStart}>
        {isRunning ? t("home.pause") : t("home.start")}
      </Button>
      <Button onPress={handleReset}>{t("home.reset")}</Button>
      <Button onPress={handleSkip}>{t("home.skip")}</Button>

      {/* Timer Mode */}
      <Text>
        {mode === "work" && t("home.focus")}
        {mode === "shortBreak" && t("home.shortBreak")}
        {mode === "longBreak" && t("home.longBreak")}
      </Text>

      {/* Daily Progress */}
      <Text>{t("home.dailyProgress")}</Text>
      <Text>
        {formatNumber(pomodorosToday, language)} /{" "}
        {formatNumber(dailyGoal, language)} {t("home.pomodorosToday")}
      </Text>

      {/* Task Selection */}
      <Button onPress={openTaskSelector}>
        {currentTask ? currentTask.title : t("home.selectTask")}
      </Button>

      {/* Working on... */}
      {currentTask && (
        <Text>
          {t("home.workingOn")}: {currentTask.title}
        </Text>
      )}
      {!currentTask && <Text>{t("home.noTaskSelected")}</Text>}
    </View>
  );
};
```

## 2. TasksScreen.js Example

```javascript
import React, { useState } from "react";
import { View, FlatList, TextInput, Button } from "react-native";
import { useLanguage } from "../contexts/LanguageContext";
import { formatDate, getRelativeTime } from "../utils/helpers";

const TasksScreen = () => {
  const { t, language } = useLanguage();
  const [filter, setFilter] = useState("all");

  const renderTask = ({ item }) => (
    <View>
      <Text>{item.title}</Text>

      {/* Priority */}
      <Text>
        {t("tasks.priority")}: {t(`tasks.priority${item.priority}`)}
      </Text>

      {/* Status */}
      <Text>
        {item.completed ? t("tasks.completed") : t("tasks.inProgress")}
      </Text>

      {/* Due Date */}
      {item.dueDate && (
        <Text>
          {t("tasks.dueDate")}: {getRelativeTime(item.dueDate, language)}
        </Text>
      )}

      {/* Pomodoros */}
      <Text>
        {item.completedPomodoros} / {item.estimatedPomodoros}{" "}
        {t("stats.pomodoros")}
      </Text>

      {/* Actions */}
      <Button onPress={() => handleEdit(item)}>{t("tasks.edit")}</Button>
      <Button onPress={() => handleDelete(item)}>{t("tasks.delete")}</Button>
      <Button onPress={() => toggleComplete(item)}>
        {item.completed ? t("tasks.markIncomplete") : t("tasks.markComplete")}
      </Button>
    </View>
  );

  return (
    <View>
      {/* Header */}
      <Text variant="headlineMedium">{t("tasks.myTasks")}</Text>

      {/* Filter Buttons */}
      <Button
        onPress={() => setFilter("all")}
        mode={filter === "all" ? "contained" : "outlined"}
      >
        {t("tasks.all")}
      </Button>
      <Button
        onPress={() => setFilter("incomplete")}
        mode={filter === "incomplete" ? "contained" : "outlined"}
      >
        {t("tasks.incomplete")}
      </Button>
      <Button
        onPress={() => setFilter("completed")}
        mode={filter === "completed" ? "contained" : "outlined"}
      >
        {t("tasks.completed")}
      </Button>

      {/* Search */}
      <TextInput
        placeholder={t("home.searchTasks")}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Task List */}
      <FlatList
        data={filteredTasks}
        renderItem={renderTask}
        ListEmptyComponent={
          <View>
            <Text>{t("tasks.noTasks")}</Text>
            <Text>{t("tasks.noTasksDescription")}</Text>
          </View>
        }
      />

      {/* Add Task Button */}
      <Button onPress={handleAddTask}>{t("tasks.addTask")}</Button>
    </View>
  );
};
```

## 3. AddTaskScreen.js Example

```javascript
import React, { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { useLanguage } from "../contexts/LanguageContext";

const AddTaskScreen = ({ route, navigation }) => {
  const { t } = useLanguage();
  const isEditing = route.params?.task;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(4);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert(t("general.error"), t("tasks.taskRequired"));
      return;
    }

    // Save logic...

    Alert.alert(
      t("general.success"),
      isEditing ? t("tasks.taskUpdated") : t("tasks.taskCreated")
    );
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert(t("alerts.deleteTask.title"), t("alerts.deleteTask.message"), [
      { text: t("alerts.deleteTask.cancel"), style: "cancel" },
      {
        text: t("alerts.deleteTask.confirm"),
        style: "destructive",
        onPress: async () => {
          // Delete logic...
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <View>
      {/* Title */}
      <Text variant="headlineMedium">
        {isEditing ? t("tasks.editTask") : t("tasks.addTask")}
      </Text>

      {/* Task Title Input */}
      <TextInput
        label={t("tasks.taskTitle")}
        placeholder={t("tasks.taskTitlePlaceholder")}
        value={title}
        onChangeText={setTitle}
      />

      {/* Description Input */}
      <TextInput
        label={t("tasks.taskDescription")}
        placeholder={t("tasks.taskDescriptionPlaceholder")}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {/* Priority Selector */}
      <Text>{t("tasks.priority")}</Text>
      <Button
        onPress={() => setPriority("Low")}
        mode={priority === "Low" ? "contained" : "outlined"}
      >
        {t("tasks.priorityLow")}
      </Button>
      <Button
        onPress={() => setPriority("Medium")}
        mode={priority === "Medium" ? "contained" : "outlined"}
      >
        {t("tasks.priorityMedium")}
      </Button>
      <Button
        onPress={() => setPriority("High")}
        mode={priority === "High" ? "contained" : "outlined"}
      >
        {t("tasks.priorityHigh")}
      </Button>

      {/* Estimated Pomodoros */}
      <Text>
        {t("tasks.estimatedPomodoros")}: {estimatedPomodoros}
      </Text>
      <Slider
        value={estimatedPomodoros}
        onValueChange={setEstimatedPomodoros}
        minimumValue={1}
        maximumValue={20}
        step={1}
      />

      {/* Action Buttons */}
      <Button mode="contained" onPress={handleSave}>
        {t("tasks.save")}
      </Button>
      <Button mode="outlined" onPress={() => navigation.goBack()}>
        {t("tasks.cancel")}
      </Button>
      {isEditing && (
        <Button mode="text" onPress={handleDelete} textColor="red">
          {t("tasks.delete")}
        </Button>
      )}
    </View>
  );
};
```

## 4. StatisticsScreen.js Example

```javascript
import React, { useState } from "react";
import { View, Text } from "react-native";
import { useLanguage } from "../contexts/LanguageContext";
import { formatWorkTime, formatNumber, getDayName } from "../utils/helpers";

const StatisticsScreen = () => {
  const { t, language } = useLanguage();
  const [period, setPeriod] = useState("today");

  const stats = {
    totalPomodoros: 45,
    focusTimeSeconds: 67500, // 18.75 hours
    dailyAverage: 8,
    streak: 7,
  };

  return (
    <View>
      {/* Title */}
      <Text variant="headlineLarge">{t("stats.statistics")}</Text>

      {/* Period Selector */}
      <Button
        onPress={() => setPeriod("today")}
        mode={period === "today" ? "contained" : "outlined"}
      >
        {t("stats.today")}
      </Button>
      <Button
        onPress={() => setPeriod("week")}
        mode={period === "week" ? "contained" : "outlined"}
      >
        {t("stats.thisWeek")}
      </Button>
      <Button
        onPress={() => setPeriod("month")}
        mode={period === "month" ? "contained" : "outlined"}
      >
        {t("stats.thisMonth")}
      </Button>

      {/* Overview Cards */}
      <View>
        <Text variant="titleMedium">{t("stats.overview")}</Text>

        {/* Total Pomodoros */}
        <Card>
          <Text>{t("stats.totalPomodoros")}</Text>
          <Text variant="displaySmall">
            {formatNumber(stats.totalPomodoros, language)}
          </Text>
        </Card>

        {/* Focus Time */}
        <Card>
          <Text>{t("stats.focusTime")}</Text>
          <Text variant="displaySmall">
            {formatWorkTime(stats.focusTimeSeconds, language)}
          </Text>
        </Card>

        {/* Daily Average */}
        <Card>
          <Text>{t("stats.dailyAverage")}</Text>
          <Text variant="displaySmall">
            {formatNumber(stats.dailyAverage, language)} {t("stats.pomodoros")}
          </Text>
        </Card>

        {/* Streak */}
        <Card>
          <Text>{t("stats.streak")}</Text>
          <Text variant="displaySmall">
            {formatNumber(stats.streak, language)} {t("stats.days")}
          </Text>
        </Card>
      </View>

      {/* Empty State */}
      {stats.totalPomodoros === 0 && (
        <View>
          <Text>{t("stats.noData")}</Text>
          <Text>{t("stats.noDataDescription")}</Text>
        </View>
      )}

      {/* Chart (with localized labels) */}
      <BarChart
        data={chartData}
        xAxisLabel={language === "vi" ? "Ngày" : "Day"}
        yAxisLabel={t("stats.pomodoros")}
      />
    </View>
  );
};
```

## 5. LoginScreen.js Example

```javascript
import React, { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { useLanguage } from "../contexts/LanguageContext";

const LoginScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // Validation
    if (!email.trim()) {
      Alert.alert(t("general.error"), t("auth.invalidEmail"));
      return;
    }
    if (password.length < 6) {
      Alert.alert(t("general.error"), t("auth.passwordTooShort"));
      return;
    }

    setIsLoading(true);
    try {
      // Login logic...
      Alert.alert(t("general.success"), t("auth.loginSuccess"));
    } catch (error) {
      Alert.alert(t("general.error"), t("auth.loginError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View>
      {/* Welcome */}
      <Text variant="headlineLarge">{t("auth.welcomeBack")}</Text>
      <Text variant="bodyLarge">{t("auth.login")}</Text>

      {/* Email Input */}
      <TextInput
        label={t("auth.email")}
        placeholder={t("auth.emailPlaceholder")}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password Input */}
      <TextInput
        label={t("auth.password")}
        placeholder={t("auth.passwordPlaceholder")}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Forgot Password */}
      <Button mode="text" onPress={handleForgotPassword}>
        {t("auth.forgotPassword")}
      </Button>

      {/* Login Button */}
      <Button
        mode="contained"
        onPress={handleLogin}
        loading={isLoading}
        disabled={isLoading}
      >
        {isLoading ? t("auth.loggingIn") : t("auth.login")}
      </Button>

      {/* Register Link */}
      <View>
        <Text>{t("auth.noAccount")}</Text>
        <Button mode="text" onPress={() => navigation.navigate("Register")}>
          {t("auth.registerNow")}
        </Button>
      </View>
    </View>
  );
};
```

## 6. RegisterScreen.js Example

```javascript
import React, { useState } from "react";
import { View, TextInput, Button, Alert, Switch } from "react-native";
import { useLanguage } from "../contexts/LanguageContext";

const RegisterScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (password !== confirmPassword) {
      Alert.alert(t("general.error"), t("auth.passwordsNotMatch"));
      return;
    }
    if (!agreeTerms) {
      Alert.alert(t("general.error"), t("auth.mustAgreeTerms"));
      return;
    }

    setIsLoading(true);
    try {
      // Register logic...
      Alert.alert(t("general.success"), t("auth.registerSuccess"));
    } catch (error) {
      if (error.message.includes("email exists")) {
        Alert.alert(t("general.error"), t("auth.emailExists"));
      } else {
        Alert.alert(t("general.error"), t("auth.registerError"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View>
      {/* Welcome */}
      <Text variant="headlineLarge">{t("auth.welcome")}</Text>
      <Text variant="bodyLarge">{t("auth.register")}</Text>

      {/* Username */}
      <TextInput
        label={t("auth.username")}
        placeholder={t("auth.usernamePlaceholder")}
        value={username}
        onChangeText={setUsername}
      />

      {/* Email */}
      <TextInput
        label={t("auth.email")}
        placeholder={t("auth.emailPlaceholder")}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password */}
      <TextInput
        label={t("auth.password")}
        placeholder={t("auth.passwordPlaceholder")}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Confirm Password */}
      <TextInput
        label={t("auth.confirmPassword")}
        placeholder={t("auth.confirmPasswordPlaceholder")}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {/* Terms Agreement */}
      <View>
        <Switch value={agreeTerms} onValueChange={setAgreeTerms} />
        <Text>{t("auth.agreeTerms")}</Text>
      </View>

      {/* Register Button */}
      <Button
        mode="contained"
        onPress={handleRegister}
        loading={isLoading}
        disabled={isLoading}
      >
        {isLoading ? t("auth.registering") : t("auth.register")}
      </Button>

      {/* Login Link */}
      <View>
        <Text>{t("auth.haveAccount")}</Text>
        <Button mode="text" onPress={() => navigation.navigate("Login")}>
          {t("auth.loginNow")}
        </Button>
      </View>
    </View>
  );
};
```

## 7. CompletionModal.js Example

```javascript
import React from "react";
import { Modal, View, Text, Button } from "react-native";
import { useLanguage } from "../contexts/LanguageContext";
import { formatNumber } from "../utils/helpers";

const CompletionModal = ({ visible, onClose, pomodorosToday, isLongBreak }) => {
  const { t, language } = useLanguage();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View>
        {/* Celebration */}
        <Text variant="headlineLarge">{t("completion.excellent")}</Text>
        <Text variant="titleLarge">{t("completion.wellDone")}</Text>

        {/* Message */}
        <Text>{t("completion.pomodoroComplete")}</Text>

        {/* Progress */}
        <Text>
          {t("completion.totalToday")}: {formatNumber(pomodorosToday, language)}{" "}
          {t("completion.pomodorosToday")}
        </Text>

        {/* Break Type */}
        <Text>
          {t("completion.timeForBreak")}{" "}
          {isLongBreak ? t("completion.longBreak") : t("completion.shortBreak")}
        </Text>

        {/* Actions */}
        <Button mode="contained" onPress={onStartBreak}>
          {t("completion.startBreak")}
        </Button>
        <Button mode="outlined" onPress={onContinueWorking}>
          {t("completion.continueWorking")}
        </Button>
        <Button mode="text" onPress={onClose}>
          {t("completion.skipBreak")}
        </Button>
      </View>
    </Modal>
  );
};
```

## Common Patterns Summary

### 1. Import useLanguage

```javascript
import { useLanguage } from "../contexts/LanguageContext";
const { t, language } = useLanguage();
```

### 2. Simple Translation

```javascript
<Text>{t("home.title")}</Text>
```

### 3. Translation with Interpolation

```javascript
<Text>{t("settings.pomodorosUntilLongBreakDesc", { count: 4 })}</Text>
```

### 4. Conditional Translation

```javascript
<Text>{isCompleted ? t("tasks.completed") : t("tasks.inProgress")}</Text>
```

### 5. Dynamic Key Translation

```javascript
<Text>{t(`tasks.priority${task.priority}`)}</Text>
// Translates to: tasks.priorityLow, tasks.priorityMedium, or tasks.priorityHigh
```

### 6. Alert with Translation

```javascript
Alert.alert(t("alerts.deleteTask.title"), t("alerts.deleteTask.message"), [
  { text: t("alerts.deleteTask.cancel"), style: "cancel" },
  {
    text: t("alerts.deleteTask.confirm"),
    style: "destructive",
    onPress: handleDelete,
  },
]);
```

### 7. Format Functions with Language

```javascript
const formattedDate = formatDate(new Date(), language);
const formattedNumber = formatNumber(1000, language);
const formattedTime = formatWorkTime(3600, language);
```

### 8. Inline Conditional for Descriptions

```javascript
<Text>{language === "vi" ? "Mô tả tiếng Việt" : "English description"}</Text>
```

---

## Next Steps

1. ✅ LanguageContext created and integrated
2. ✅ Translations file complete
3. ✅ SettingsScreen migrated with language selector
4. 🔄 Migrate remaining screens (HomeScreen, TasksScreen, StatisticsScreen, etc.)
5. 🔄 Test all screens in both languages
6. 🔄 Fix any missing translations
7. ✅ Update utility functions for locale support

Follow these examples to migrate all remaining screens!
