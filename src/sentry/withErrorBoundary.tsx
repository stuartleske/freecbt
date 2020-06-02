import React from "react";
import Sentry from "../platform/sentry";

class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Don't send errors to sentry in development
    if (__DEV__) {
      console.error(error, errorInfo);
      return;
    }

    if (errorInfo) {
      // @ts-ignore
      Sentry.captureException(error, {
        extra: errorInfo,
      });
    }

    Sentry.captureException(error);
  }

  render() {
    const { children } = this.props;
    return children;
  }
}

export default Component => {
  return class extends React.Component {
    render() {
      return (
        <ErrorBoundary>
          <Component />
        </ErrorBoundary>
      );
    }
  };
};
