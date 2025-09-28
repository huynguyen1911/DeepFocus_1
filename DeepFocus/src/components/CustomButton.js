import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";

const CustomButton = ({
  title,
  onPress,
  mode = "contained",
  disabled = false,
  style = {},
  textStyle = {},
}) => {
  const theme = useTheme();

  const buttonStyles = [
    styles.button,
    mode === "contained"
      ? {
          backgroundColor: disabled
            ? theme.colors.surfaceDisabled
            : theme.colors.primary,
        }
      : {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: disabled
            ? theme.colors.surfaceDisabled
            : theme.colors.primary,
        },
    style,
  ];

  const textStyles = [
    styles.text,
    mode === "contained"
      ? {
          color: disabled
            ? theme.colors.onSurfaceDisabled
            : theme.colors.onPrimary,
        }
      : {
          color: disabled
            ? theme.colors.onSurfaceDisabled
            : theme.colors.primary,
        },
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={textStyles} variant="labelLarge">
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  text: {
    fontWeight: "600",
  },
});

export default CustomButton;
