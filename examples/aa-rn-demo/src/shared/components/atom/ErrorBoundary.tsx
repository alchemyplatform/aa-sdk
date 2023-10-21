import React, { type ReactElement, type ReactNode } from "react";
import { Text, View, type ImageStyle, type StyleProp } from "react-native";

type ErrorBoundaryState = {
  error?: Error;
};

export type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactElement;
  style?: StyleProp<ImageStyle>;
};

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(props: any) {
    super(props);
    this.state = { error: undefined };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static getDerivedStateFromError(error: any): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI.
    return { error };
  }

  componentDidCatch(error: Error): void {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary", error);
  }

  render(): ReactNode {
    if (this.state.error) {
      // You can render any custom fallback UI
      return (
        this.props.fallback || (
          <View
            style={[
              {
                width: "100%",
                height: "100%",
                alignItems: "center",
                flex: 1,
                justifyContent: "center",
              },
              this.props.style,
            ]}
          >
            <Text style={{ fontWeight: "bold" }}>Error</Text>
            <Text>{this.state.error.toString()}</Text>
          </View>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
