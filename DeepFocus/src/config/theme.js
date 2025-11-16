import { MD3LightTheme as DefaultTheme } from "react-native-paper";

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#FF5252", // Work - Đỏ
    primaryContainer: "#FFCDD2",
    secondary: "#66BB6A", // Short Break - Xanh lá
    secondaryContainer: "#C8E6C9",
    tertiary: "#5C6BC0", // Long Break - Xanh dương/Tím
    tertiaryContainer: "#C5CAE9",
    accent: "#FF9800", // Accent - Cam
    surface: "#FFFFFF",
    surfaceVariant: "#FAFAFA",
    background: "#FFFFFF",
    error: "#B71C1C",
    onPrimary: "#FFFFFF",
    onSecondary: "#FFFFFF",
    onTertiary: "#FFFFFF",
    onSurface: "#212121",
    onBackground: "#212121",
  },
};

export const colors = {
  primary: "#FF5252",
  secondary: "#F44336",
  background: "#FFFFFF",
  surface: "#FFFFFF",
  text: "#212121",
  textSecondary: "#757575",
  border: "#E0E0E0",
  error: "#B71C1C",
  success: "#4CAF50",
  warning: "#FF9800",
};
