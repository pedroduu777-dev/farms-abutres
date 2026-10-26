import React, { useState } from 'react';
import { ShieldAlert, X, KeyRound, ArrowRight, Lock } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  expectedPin?: string;
  onClose: () => void;
  onSuccess: (token: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  expectedPin = '0604',
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const trimmedPin = pin.trim();
      const targetPin = (expectedPin || '0604').trim();

      if (trimmedPin === targetPin) {
        onSuccess('fazenda_adm_session_valid');
        onClose();
        setPin('');
      } else {
        throw new Error('PIN de Administrador incorreto.');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Falha na autenticação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Acesso Restrito - Administração"
    >
      <div
        className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-2xl p-6 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                Entrar no Menu do ADM
              </h3>
              <p className="text-xs text-slate-400">
                Digite o PIN da Liderança para acessar a gerência
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg text-xs text-rose-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="admin-pin-input"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              PIN de Segurança da Liderança
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-pin-input"
                type="password"
                autoFocus
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Ex: 0604"
                className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F17] border border-slate-800 focus:border-rose-500 focus:outline-none rounded-lg text-sm font-mono tracking-widest text-slate-100 placeholder:tracking-normal placeholder:text-slate-600"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              PIN inicial padrão: <strong className="text-slate-300 font-mono">0604</strong> (editável nas configurações do ADM).
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !pin.trim()}
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-rose-950/50"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Verificando...' : 'Entrar no Menu do ADM'}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </form>

        <div className="pt-2 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-500">
            Atalho secreto: pressione <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-slate-300 font-mono">Ctrl + Shift + A</kbd> a qualquer momento.
          </p>
        </div>
      </div>
    </div>
  );
};
