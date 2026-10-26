import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Erro capturado pelo ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#111827] border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 bg-rose-950/50 border border-rose-800/60 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight text-white">Ops! Algo deu errado.</h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                O aplicativo encontrou um erro inesperado ao carregar. Para evitar tela em branco, o sistema de segurança interceptou a falha.
              </p>
              {this.state.error?.message && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-rose-300 text-left overflow-auto max-h-24">
                  {this.state.error.message}
                </div>
              )}
            </div>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              <span>Limpar Cache e Recarregar</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
