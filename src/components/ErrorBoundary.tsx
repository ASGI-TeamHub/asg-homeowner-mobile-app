import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-elements';

interface State { hasError: boolean }

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error): void {
    // eslint-disable-next-line no-console
    console.error('Unhandled render error', error);
  }

  private reset = () => this.setState({ hasError: false });

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text h4>Something went wrong</Text>
          <Text style={styles.text}>Please try reloading the app.</Text>
          <Button title="Retry" onPress={this.reset} accessibilityLabel="Retry rendering app" />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  text: { marginVertical: 10 },
});
