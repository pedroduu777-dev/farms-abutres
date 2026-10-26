import React, { useState, useMemo } from 'react';
import {
  PackagePlus,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  Shield,
} from 'lucide-react';
import {
  AuditStatus,
  CreateDeliveryPayload,
  DiscordWebhookConfig,
  FarmDelivery,
} from '../types/farm';
import { formatExactDateTime, formatRelativeTime } from '../utils/farmHelpers';
import { NewDeliveryView } from './NewDeliveryView';
import { ProofImage } from './ProofImage';

interface UserPortalViewProps {
  config: DiscordWebhookConfig;
  deliveries: FarmDelivery[];
  savedPlayerName: string;
  savedPassportId: string;
  onSavePlayerIdentity: (name: string, passport: string) => void;
  onSubmitDelivery: (payload: CreateDeliveryPayload) => Promise<FarmDelivery>;
  onSelectDeliveryForModal: (delivery: FarmDelivery) => void;
  onOpenDiscordGuide: () => void;
  onOpenAdminLogin: () => void;
}

export const UserPortalView: React.FC<UserPortalViewProps> = ({
  config,
  deliveries,
  savedPlayerName,
  savedPassportId,
  onSavePlayerIdentity,
  onSubmitDelivery,
  onSelectDeliveryForModal,
  onOpenDiscordGuide,
  onOpenAdminLogin,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'deliver' | 'my_history'>('deliver');

  // Filter deliveries belonging to this player
  const myDeliveries = useMemo(() => {
    if (!savedPassportId || !savedPassportId.trim()) return deliveries;
    const cleanId = savedPassportId.trim().replace(/^#/, '').toLowerCase();
    if (!cleanId) return deliveries;
    return deliveries.filter(
      (d) => d.passportId.trim().replace(/^#/, '').toLowerCase() === cleanId
    );
  }, [deliveries, savedPassportId]);

  const goal = Math.max(100, config.weeklyGoalPerMember || 2500);

  const myWeeklyTotal = useMemo(() => {
    return myDeliveries
      .filter((d) => d.auditStatus !== AuditStatus.RECUSADO)
      .reduce((acc, d) => acc + d.quantity, 0);
  }, [myDeliveries]);

  const myProgressPct = Math.min(100, Math.round((myWeeklyTotal / goal) * 100));
  const hasReachedGoal = myWeeklyTotal >= goal;

  return (
    <div className="space-y-8">
      {/* Member Header Card & Personal Goal Progress */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Área do Membro · {config.serverName}
            </span>
            <h2 className="text-xl font-bold text-slate-100">
              {savedPlayerName ? (
                <>
                  Olá, <span className="text-indigo-300">{savedPlayerName}</span>{' '}
                  <span className="text-sm font-mono text-slate-400">#{savedPassportId}</span>
                </>
              ) : (
                'Portal de Entrega de Farm'
              )}
            </h2>
            <p className="text-xs text-slate-400">
              Registre o depósito do baú com print e acompanhe sua meta semanal aqui.
            </p>
          </div>

          {/* Member Weekly Quota Progress */}
          <div className="bg-[#0B0F17] border border-slate-800/90 rounded-lg p-4 min-w-[280px] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Sua Meta Semanal:</span>
              <span className="font-mono tabular-nums font-semibold text-slate-200">
                {myWeeklyTotal.toLocaleString('pt-BR')} / {goal.toLocaleString('pt-BR')} unid.
              </span>
            </div>

            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  hasReachedGoal ? 'bg-emerald-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${myProgressPct}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">
                {hasReachedGoal ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Meta Batida!
                  </span>
                ) : (
                  <span>Faltam {(goal - myWeeklyTotal).toLocaleString('pt-BR')} unid.</span>
                )}
              </span>
              <span className="font-mono text-slate-400">{myProgressPct}%</span>
            </div>
          </div>
        </div>

        {/* User Navigation Pills */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveSubTab('deliver')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
              activeSubTab === 'deliver'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <PackagePlus className="w-3.5 h-3.5" />
            <span>Fazer Nova Entrega</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('my_history')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
              activeSubTab === 'my_history'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Meus Comprovantes ({myDeliveries.length})</span>
          </button>
        </div>
      </div>

      {/* Sub-view: Deliver Farm Form */}
      {activeSubTab === 'deliver' && (
        <NewDeliveryView
          config={config}
          recentDeliveries={deliveries}
          savedPlayerName={savedPlayerName}
          savedPassportId={savedPassportId}
          onSavePlayerIdentity={onSavePlayerIdentity}
          onSubmitDelivery={onSubmitDelivery}
          onSelectDeliveryForModal={onSelectDeliveryForModal}
          onOpenWebhookSettings={onOpenAdminLogin}
          onOpenDiscordGuide={onOpenDiscordGuide}
        />
      )}

      {/* Sub-view: My Deliveries History */}
      {activeSubTab === 'my_history' && (
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-100">
              Histórico de Entregas Registradas por Você
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Passaporte #{savedPassportId || 'Não informado'}
            </span>
          </div>

          {!savedPassportId ? (
            <div className="p-8 text-center text-xs text-slate-400 space-y-2">
              <p>Você ainda não registrou nenhuma entrega neste navegador.</p>
              <button
                type="button"
                onClick={() => setActiveSubTab('deliver')}
                className="text-indigo-400 underline cursor-pointer"
              >
                Clique aqui para registrar sua primeira entrega de farm
              </button>
            </div>
          ) : myDeliveries.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 space-y-2">
              <p>Nenhuma entrega encontrada para o Passaporte #{savedPassportId}.</p>
              <button
                type="button"
                onClick={() => setActiveSubTab('deliver')}
                className="text-indigo-400 underline cursor-pointer"
              >
                Fazer nova entrega agora
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-medium text-slate-400 bg-[#0D131F]">
                    <th className="py-3 px-4">Comprovante</th>
                    <th className="py-3 px-4">Item & Categoria</th>
                    <th className="py-3 px-4 text-right">Quantidade</th>
                    <th className="py-3 px-4">Quando Entregou</th>
                    <th className="py-3 px-4">Baú Destino</th>
                    <th className="py-3 px-4">Auditoria da Gerência</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-sm">
                  {myDeliveries.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-800/35 transition-colors">
                      <td className="py-2.5 px-4">
                        <button
                          type="button"
                          onClick={() => onSelectDeliveryForModal(d)}
                          className="w-14 h-10 rounded-md overflow-hidden border border-slate-700 bg-[#070A10] block cursor-pointer"
                        >
                          <ProofImage
                            photoUrl={d.photoUrl}
                            alt={`Print ${d.id}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="font-medium text-slate-200">{d.itemName}</div>
                        <div className="text-xs text-slate-500">{d.category}</div>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-indigo-300">
                        {d.quantity.toLocaleString('pt-BR')} {d.unit}
                      </td>
                      <td className="py-2.5 px-4 text-xs font-mono tabular-nums text-slate-300">
                        {formatExactDateTime(d.deliveredAt)}
                      </td>
                      <td className="py-2.5 px-4 text-xs text-slate-300">{d.chestLocation}</td>
                      <td className="py-2.5 px-4 text-xs">
                        {d.auditStatus === AuditStatus.APROVADO && (
                          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Aprovado
                          </span>
                        )}
                        {d.auditStatus === AuditStatus.PENDENTE && (
                          <span className="inline-flex items-center gap-1.5 text-amber-400">
                            <Clock className="w-3.5 h-3.5" /> Em análise
                          </span>
                        )}
                        {d.auditStatus === AuditStatus.RECUSADO && (
                          <span className="inline-flex items-center gap-1.5 text-rose-400">
                            <XCircle className="w-3.5 h-3.5" /> Recusado
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectDeliveryForModal(d)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-xs text-slate-300 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>Ver Foto</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Subtle Footer with Hidden Admin Trigger */}
      <div className="pt-8 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
        <span>Painel do Membro · Organização Abutres</span>

        {/* Hidden/Secret Admin entrance button */}
        <button
          type="button"
          onClick={onOpenAdminLogin}
          className="opacity-15 hover:opacity-80 transition-opacity p-1 text-slate-500 hover:text-slate-200 cursor-pointer rounded"
          title="Acesso Secreto"
          aria-label="Acesso Secreto"
        >
          <Shield className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
