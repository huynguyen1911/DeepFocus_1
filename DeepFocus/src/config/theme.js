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

export const spacing = {
  tiny: 4,
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
  xxlarge: 48,
};

export const fontSize = {
  tiny: 10,
  small: 12,
  medium: 14,
  large: 16,
  xlarge: 20,
  xxlarge: 24,
  huge: 32,
};

export const shadows = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
};

// Export complete theme with spacing, fontSize, and shadows
theme.spacing = spacing;
theme.fontSize = fontSize;
theme.shadows = shadows;
