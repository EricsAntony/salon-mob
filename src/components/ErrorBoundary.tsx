import React from 'react';
import { Text } from 'react-native';

type Props = { children: React.ReactNode };

type State = { hasError: boolean };

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('ErrorBoundary caught an error', error);
  }

  render() {
    if (this.state.hasError) {
      return <Text>Something went wrong.</Text>;
    }
    return this.props.children as any;
  }
}
