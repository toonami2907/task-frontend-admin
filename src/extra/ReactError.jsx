import React from "react";
import PropTypes from 'prop-types'
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state to display fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error("Error Boundary Caught an Error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800 px-4">
          <div className="max-w-lg w-full bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
            <div className="bg-red-500 text-white py-4 px-6">
              <h1 className="text-xl font-semibold">Application Error</h1>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Oops! Something went wrong. Please try refreshing the page or contact support if the problem persists.
              </p>
              <div className="bg-gray-100 p-4 rounded text-sm text-gray-600 overflow-auto">
                <p>
                  <span className="font-semibold">Error:</span> {this.state.error?.toString()}
                </p>
                {this.state.errorInfo?.componentStack && (
                  <pre className="mt-4 whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                )}
              </div>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    // Render children if no error occurred
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
