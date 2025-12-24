import { Component, type ErrorInfo, type ReactNode } from 'react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  msg?: string;
}

interface State {
  hasError: boolean;
}

/**
 * @author sonion
 * @description 错误边界组件，用于捕获子组件的错误并显示自定义的回退内容
 * @param {ErrorBoundaryProps} props - 组件的属性
 * @param {ReactNode} props.fallback - 错误发生时显示的回退内容
 * @param {string} [props.msg='组件加载失败'] - 错误信息的提示文本
 * @param {ReactNode} props.children - 子组件，可能会触发错误
 * @returns {import('react').JSX.Element} - 组件节点
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  state: State = { hasError: false };
  private msg: string = this.props.msg ?? '组件加载失败';

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`${this.msg}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

type ErrorBoundaryType = typeof ErrorBoundary;

export type { ErrorBoundaryType };
export default ErrorBoundary;
