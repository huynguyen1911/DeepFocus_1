import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, Card, useTheme } from "react-native-paper";

/**
 * Error Boundary Component
 * Catches JavaScript errors in child component tree and displays fallback UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error("💥 Error Boundary caught an error:");
    console.error("Error:", error);
    console.error("Error Info:", errorInfo);

    // Store error details in state
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // TODO: Send error to logging service (Sentry, Crashlytics, etc.)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    // Reset error state to retry rendering
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <View style={styles.container}>
          <Card style={styles.card}>
            <Card.Content style={styles.content}>
              <Text style={styles.emoji}>😕</Text>

              <Text variant="headlineSmall" style={styles.title}>
                Oops! Có lỗi xảy ra
              </Text>

              <Text variant="bodyMedium" style={styles.message}>
                Đừng lo lắng! Dữ liệu của bạn vẫn được lưu an toàn. Hãy thử làm
                mới để tiếp tục.
              </Text>

              {__DEV__ && this.state.error && (
                <View style={styles.errorDetails}>
                  <Text variant="bodySmall" style={styles.errorTitle}>
                    Chi tiết lỗi (Development mode):
                  </Text>
                  <Text variant="bodySmall" style={styles.errorText}>
                    {this.state.error.toString()}
                  </Text>
                  {this.state.errorInfo && (
                    <Text variant="bodySmall" style={styles.errorStack}>
                      {this.state.errorInfo.componentStack}
                    </Text>
                  )}
                </View>
              )}

              <Button
                mode="contained"
                onPress={this.handleReset}
                style={styles.button}
                icon="refresh"
              >
                Thử lại
              </Button>
            </Card.Content>
          </Card>
        </View>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    elevation: 4,
    borderRadius: 12,
  },
  content: {
    alignItems: "center",
    padding: 24,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    color: "#d32f2f",
  },
  message: {
    textAlign: "center",
    color: "#666",
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    minWidth: 150,
  },
  errorDetails: {
    width: "100%",
    marginTop: 16,
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#fff3e0",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#ff9800",
  },
  errorTitle: {
    fontWeight: "bold",
    color: "#e65100",
    marginBottom: 8,
  },
  errorText: {
    color: "#bf360c",
    fontFamily: "monospace",
    marginBottom: 8,
  },
  errorStack: {
    color: "#666",
    fontSize: 11,
    fontFamily: "monospace",
  },
});

export default ErrorBoundary;
