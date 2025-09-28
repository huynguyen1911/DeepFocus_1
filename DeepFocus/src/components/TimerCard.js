import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";

const TimerCard = ({
  time = "25:00",
  title = "Pomodoro",
  isActive = false,
  style = {},
}) => {
  const theme = useTheme();

  const cardStyle = [
    styles.card,
    {
      backgroundColor: isActive
        ? theme.colors.primaryContainer
        : theme.colors.surface,
      borderColor: isActive ? theme.colors.primary : theme.colors.outline,
    },
    style,
  ];

  return (
    <Card style={cardStyle}>
      <Card.Content style={styles.content}>
        <Text
          variant="headlineSmall"
          style={[
            styles.title,
            {
              color: isActive
                ? theme.colors.onPrimaryContainer
                : theme.colors.onSurface,
            },
          ]}
        >
          {title}
        </Text>
        <Text
          variant="displayMedium"
          style={[
            styles.time,
            { color: isActive ? theme.colors.primary : theme.colors.onSurface },
          ]}
        >
          {time}
        </Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderRadius: 16,
    elevation: 4,
  },
  content: {
    alignItems: "center",
    paddingVertical: 20,
  },
  title: {
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "500",
  },
  time: {
    fontWeight: "bold",
    fontFamily: "monospace",
  },
});

export default TimerCard;
