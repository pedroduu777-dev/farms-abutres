import React, { useState } from 'react';
import {
  ShieldAlert,
  LogOut,
  History,
  Trophy,
  Webhook,
  Lock,
  KeyRound,
  Save,
  CheckCircle2,
  AlertCircle,
  Users,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import {
  AuditStatus,
  DiscordWebhookConfig,
  FarmDelivery,
  MemberAccount,
} from '../types/farm';
import { loadStoredMembers, saveStoredMembers } from '../services/storageService';
import { DeliveryHistoryView } from './DeliveryHistoryView';
import { LeaderboardView } from './LeaderboardView';
import { WebhookSettingsView } from './WebhookSettingsView';

interface AdminPortalViewProps {
  config: DiscordWebhookConfig;
  deliveries: FarmDelivery[];
  isLoading: boolean;
  resendingId: string | null;
  onSelectDelivery: (delivery: FarmDelivery) => void;
  onResendWebhook: (id: string) => Promise<void>;
  onUpdateAudit: (id: string, status: AuditStatus) => Promise<void>;
  onSaveConfig: (nextConfig: DiscordWebhookConfig) => Promise<void>;
  onTestWebhook: (webhookUrl: string) => Promise<{ message: string }>;
  onExitAdmin: () => void;
  onGoToNewDelivery: () => void;
  onOpenDiscordGuide: () => void;
  onResetAll?: () => void;
}

type AdminTab = 'audit' | 'ranking' | 'config' | 'security';

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  config,
  deliveries,
  isLoading,
  resendingId,
  onSelectDelivery,
  onResendWebhook,
  onUpdateAudit,
  onSaveConfig,
  onTestWebhook,
  onExitAdmin,
  onGoToNewDelivery,
  onOpenDiscordGuide,
  onResetAll,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('audit');
  const [newPin, setNewPin] = useState(config.adminPin || '0604');
  const [isSavingPin, setIsSavingPin] = useState(false);
  const [pinFeedback, setPinFeedback] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);

  const [members, setMembers] = useState<MemberAccount[]>(() => loadStoredMembers());

  const handleDeleteMember = (id: string) => {
    if (window.confirm(`Deseja remover o cadastro do membro com ID #${id}? Ele precisará se cadastrar novamente.`)) {
      const updated = members.filter((m) => m.id !== id);
      setMembers(updated);
      saveStoredMembers(updated);
    }
  };

  const pendingCount = deliveries.filter(
    (d) => d.auditStatus === AuditStatus.PENDENTE
  ).length;

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin.trim()) return;

    setPinFeedback(null);
    setIsSavingPin(true);
    try {
      await onSaveConfig({
        ...config,
        adminPin: newPin.trim(),
      });
      setPinFeedback({
        type: 'success',
        msg: 'PIN de Administrador atualizado com sucesso!',
      });
    } catch (err) {
      setPinFeedback({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Falha ao salvar novo PIN.',
      });
    } finally {
      setIsSavingPin(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Secret Admin Bar */}
      <div className="bg-gradient-to-r from-rose-950/40 via-[#111827] to-[#111827] border border-rose-800/40 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100">
                Painel da Gerência · Acesso Restrito
              </h2>
              <span className="text-[11px] font-mono text-rose-300 bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded">
                ADM ATIVO
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Controle total de auditoria, aprovações, exclusões e webhook do Discord.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onExitAdmin}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto whitespace-nowrap"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-400" />
          <span>Bloquear e Sair do ADM</span>
        </button>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#111827] border border-slate-800 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveAdminTab('audit')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'audit'
              ? 'bg-rose-600 text-white'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Fila de Auditoria & Prints</span>
          {pendingCount > 0 && (
            <span className="bg-rose-950 text-rose-200 border border-rose-700 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
              {pendingCount} pendentes
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('ranking')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'ranking'
              ? 'bg-rose-600 text-white'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Metas & Ranking Geral</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('config')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'config'
              ? 'bg-rose-600 text-white'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
          }`}
        >
          <Webhook className="w-3.5 h-3.5" />
          <span>Configuração Discord</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('security')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'security'
              ? 'bg-rose-600 text-white'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Segurança & PIN</span>
        </button>
      </div>

      {/* Admin Tab Viewport */}
      {activeAdminTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 px-1">
            <span>
              Você tem permissão de gerência para aprovar, recusar e reenviar logs para o Discord.
            </span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-slate-300">
                Total: {deliveries.length} registros
              </span>
              {onResetAll && deliveries.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Tem certeza que deseja zerar e apagar todos os registros de entregas?')) {
                      onResetAll();
                    }
                  }}
                  className="px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-[11px] font-medium rounded transition-colors cursor-pointer"
                >
                  Zerar Tudo
                </button>
              )}
            </div>
          </div>

          <DeliveryHistoryView
            deliveries={deliveries}
            isLoading={isLoading}
            resendingId={resendingId}
            onSelectDelivery={onSelectDelivery}
            onResendWebhook={onResendWebhook}
            onUpdateAudit={onUpdateAudit}
            onGoToNewDelivery={onGoToNewDelivery}
          />
        </div>
      )}

      {activeAdminTab === 'ranking' && (
        <LeaderboardView
          deliveries={deliveries}
          config={config}
          onOpenSettings={() => setActiveAdminTab('config')}
        />
      )}

      {activeAdminTab === 'config' && (
        <WebhookSettingsView
          config={config}
          onSaveConfig={onSaveConfig}
          onTestWebhook={onTestWebhook}
          onOpenDiscordGuide={onOpenDiscordGuide}
        />
      )}

      {activeAdminTab === 'security' && (
        <div className="max-w-xl bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-rose-400" />
              <span>Alterar PIN Secreto de Administrador</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Somente membros com este PIN poderão abrir o Painel da Liderança.
            </p>
          </div>

          {pinFeedback && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                pinFeedback.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-800 text-rose-200'
              }`}
            >
              {pinFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{pinFeedback.msg}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePin} className="space-y-4">
            <div>
              <label
                htmlFor="new-admin-pin"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Novo PIN de Acesso
              </label>
              <input
                id="new-admin-pin"
                type="text"
                required
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Ex: 8842"
                className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-800 focus:border-rose-500 focus:outline-none rounded-lg text-sm font-mono tracking-widest text-slate-100"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Anote este código com a liderança para não perder o acesso ao modo ADM.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSavingPin || !newPin.trim()}
              className="py-2.5 px-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingPin ? 'Salvando...' : 'Atualizar PIN Secreto'}</span>
            </button>
          </form>

          {/* Membros Cadastrados */}
          <div className="border-t border-slate-800 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>Membros Cadastrados ({members.length})</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Jogadores com nome, passaporte e senha de 4 dígitos cadastrados.
                </p>
              </div>
            </div>

            {members.length === 0 ? (
              <div className="p-4 bg-[#0B0F17] border border-slate-800/80 rounded-lg text-center text-xs text-slate-500">
                Nenhum membro se cadastrou ainda. O cadastro é feito ao clicar em "Entregar Farm".
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 bg-[#0B0F17] border border-slate-800 rounded-lg flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{m.name}</span>
                        <span className="font-mono text-slate-400">#{m.id}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        PIN: <span className="text-slate-400 tracking-widest font-semibold">{m.pin}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteMember(m.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                      title="Excluir cadastro do membro"
                      aria-label="Excluir cadastro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
