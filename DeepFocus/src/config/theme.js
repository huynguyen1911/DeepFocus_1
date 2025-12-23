import { MD3LightTheme as DefaultTheme } from "react-native-paper";

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#6C63FF", // DeepFocus Purple - Tím chủ đạo
    primaryContainer: "#E8E4FF",
    secondary: "#66BB6A", // Short Break - Xanh lá
    secondaryContainer: "#C8E6C9",
    tertiary: "#5C6BC0", // Long Break - Xanh dương/Tím
    tertiaryContainer: "#C5CAE9",
    accent: "#8F94FB", // Accent - Tím nhạt
    surface: "#FFFFFF",
    surfaceVariant: "#F3F0FF",
    background: "#FAFAFA",
    error: "#FF5252", // Chỉ dùng cho error/stop
    onPrimary: "#FFFFFF",
    onSecondary: "#FFFFFF",
    onTertiary: "#FFFFFF",
    onSurface: "#2D3436",
    onBackground: "#2D3436",
  },
};

export const colors = {
  primary: "#6C63FF",
  secondary: "#8F94FB",
  background: "#FAFAFA",
  surface: "#FFFFFF",
  text: "#2D3436",
  textSecondary: "#636E72",
  border: "#E8E4FF",
  error: "#FF5252",
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
