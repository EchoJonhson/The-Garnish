import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误信息
    console.error('❌ ErrorBoundary捕获到错误:', error);
    console.error('📍 错误详情:', errorInfo);
    console.error('🔍 组件堆栈:', errorInfo.componentStack);
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // 如果有自定义的fallback UI，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认的错误UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                页面加载出错
              </h2>
              
              <p className="text-gray-600 mb-6">
                抱歉，页面遇到了一个错误。请尝试刷新页面或联系技术支持。
              </p>
              
              {/* 错误详情（仅在开发环境显示） */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">错误详情:</h3>
                  <pre className="text-xs text-red-600 overflow-auto max-h-32">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <>
                      <h3 className="text-sm font-medium text-gray-700 mt-4 mb-2">组件堆栈:</h3>
                      <pre className="text-xs text-gray-600 overflow-auto max-h-32">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              )}
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={this.handleRetry}
                  className="btn-primary flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  重试
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="btn-secondary"
                >
                  刷新页面
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;