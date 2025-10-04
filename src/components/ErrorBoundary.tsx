import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ maxWidth: 920, margin: '40px auto', padding: 16 }}>
          <h1>⚠️ Application Error</h1>
          <div style={{ 
            padding: 20, 
            border: '2px solid #d32f2f', 
            borderRadius: 8, 
            backgroundColor: '#ffebee',
            marginTop: 20 
          }}>
            <h2>Something went wrong</h2>
            <p>The application encountered an unexpected error.</p>
            
            {this.state.error && (
              <details style={{ 
                marginTop: 20, 
                padding: 15, 
                backgroundColor: '#fff', 
                borderRadius: 4,
                fontFamily: 'monospace',
                fontSize: '0.9em'
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: 10 }}>
                  Error Details
                </summary>
                <div style={{ marginTop: 10 }}>
                  <strong>Error:</strong> {this.state.error.toString()}
                </div>
                {this.state.errorInfo && (
                  <div style={{ marginTop: 10 }}>
                    <strong>Component Stack:</strong>
                    <pre style={{ 
                      whiteSpace: 'pre-wrap', 
                      marginTop: 5, 
                      padding: 10, 
                      backgroundColor: '#f5f5f5',
                      borderRadius: 4,
                      overflow: 'auto'
                    }}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </details>
            )}

            <div style={{ marginTop: 20 }}>
              <button 
                onClick={() => window.location.reload()}
                style={{ 
                  padding: '10px 20px', 
                  fontSize: '16px',
                  cursor: 'pointer',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4
                }}
              >
                Reload Application
              </button>
            </div>

            <p style={{ marginTop: 20, padding: 15, backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: 4 }}>
              <strong>Need Help?</strong> Check the browser console (F12) for more detailed error messages, or refer to the documentation in the repository.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
