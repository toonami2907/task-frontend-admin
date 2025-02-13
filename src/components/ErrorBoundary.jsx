// src/components/ErrorBoundary.jsx
import PropTypes from "prop-types";
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";

export class RulesErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Rules list error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive">
          <AlertDescription>
            Something went wrong loading the rules list. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

RulesErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};