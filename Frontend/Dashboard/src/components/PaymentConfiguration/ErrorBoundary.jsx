// // src/components/ErrorBoundary.jsx
// import React from 'react';
// import { FiAlertTriangle } from 'react-icons/fi';

// class ErrorBoundary extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = { hasError: false, error: null };
//   }

//   static getDerivedStateFromError(error) {
//     return { hasError: true, error };
//   }

//   componentDidCatch(error, errorInfo) {
//     console.error('Payment Configuration Error:', error, errorInfo);
//   }

//   render() {
//     if (this.state.hasError) {
//       return (
//         <div className="min-h-screen flex items-center justify-center bg-gray-50">
//           <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
//             <FiAlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
//             <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
//             <p className="text-gray-600 mb-4">
//               We encountered an error while loading the payment configuration.
//             </p>
//             <button
//               onClick={() => window.location.reload()}
//               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//             >
//               Reload Page
//             </button>
//           </div>
//         </div>
//       );
//     }

//     return this.props.children;
//   }
// }

// export default ErrorBoundary;








// src/components/PaymentConfiguration/ErrorBoundary.jsx
import React from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Payment Configuration Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-indigo-900 p-4 transition-colors duration-300">
          <div className="max-w-md w-full bg-white dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl p-8 text-center transition-all duration-300">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                <FiAlertTriangle className="h-12 w-12 text-red-500 dark:text-red-400" />
              </div>
            </div>
            
            {/* Error Title */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Configuration Error
            </h2>
            
            {/* Error Message */}
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              We encountered an unexpected error while loading the payment configuration. 
              This might be due to a temporary issue or configuration problem.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                <FiRefreshCw className="mr-2 h-5 w-5" />
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                Reload Page
              </button>
            </div>

            {/* Additional Help Text */}
            <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="mb-2">
                <strong>Need help?</strong> Contact support if the problem persists.
              </p>
              <p className="text-xs">
                Error ID: {this.state.error?.name || 'Unknown'}
              </p>
            </div>

            {/* Development Error Details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left border-t border-gray-200 dark:border-gray-700 pt-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Technical Details (Development)
                </summary>
                <div className="mt-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <pre className="text-xs text-red-700 dark:text-red-300 overflow-auto max-h-40 font-mono">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack && `\n\nComponent Stack:\n${this.state.errorInfo.componentStack}`}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;