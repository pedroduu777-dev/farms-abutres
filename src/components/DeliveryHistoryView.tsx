import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  LayoutGrid,
  List,
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  Plus,
  Eye,
} from 'lucide-react';
import {
  AuditStatus,
  FarmCategory,
  FarmDelivery,
  WebhookSyncStatus,
} from '../types/farm';
import {
  exportDeliveriesToCsv,
  formatExactDateTime,
  formatRelativeTime,
} from '../utils/farmHelpers';
import { ProofImage } from './ProofImage';

interface DeliveryHistoryViewProps {
  deliveries: FarmDelivery[];
  isLoading: boolean;
  resendingId: string | null;
  onSelectDelivery: (delivery: FarmDelivery) => void;
  onResendWebhook: (id: string) => Promise<void>;
  onUpdateAudit: (id: string, status: AuditStatus) => Promise<void>;
  onGoToNewDelivery: () => void;
}

export const DeliveryHistoryView: React.FC<DeliveryHistoryViewProps> = ({
  deliveries,
  isLoading,
  resendingId,
  onSelectDelivery,
  onResendWebhook,
  onUpdateAudit,
  onGoToNewDelivery,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'today' | '7d'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'gallery'>('table');

  const filteredDeliveries = useMemo(() => {
    const now = Date.now();
    const q = searchQuery.trim().toLowerCase();

    return deliveries.filter((d) => {
      if (categoryFilter !== 'ALL' && d.category !== categoryFilter) {
        return false;
      }

      if (periodFilter === 'today') {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        if (new Date(d.deliveredAt).getTime() < startOfToday.getTime()) {
          return false;
        }
      } else if (periodFilter === '7d') {
        if (now - new Date(d.deliveredAt).getTime() > 7 * 24 * 60 * 60 * 1000) {
          return false;
        }
      }

      if (!q) return true;
      return (
        d.playerName.toLowerCase().includes(q) ||
        d.passportId.toLowerCase().includes(q) ||
        d.itemName.toLowerCase().includes(q) ||
        d.chestLocation.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q)
      );
    });
  }, [deliveries, searchQuery, categoryFilter, periodFilter]);

  const metrics = useMemo(() => {
    const totalUnits = filteredDeliveries.reduce((acc, item) => acc + item.quantity, 0);
    const syncedCount = filteredDeliveries.filter(
      (d) => d.webhookStatus === WebhookSyncStatus.ENVIADO
    ).length;
    const approvedCount = filteredDeliveries.filter(
      (d) => d.auditStatus === AuditStatus.APROVADO
    ).length;
    const uniquePlayers = new Set(filteredDeliveries.map((d) => d.passportId)).size;

    return {
      count: filteredDeliveries.length,
      totalUnits,
      syncedCount,
      approvedCount,
      uniquePlayers,
    };
  }, [filteredDeliveries]);

  return (
    <div className="space-y-6">
      {/* 4-Column Structured KPI Strip */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        <div className="p-5">
          <span className="text-xs text-slate-400 block">Entregas com Foto</span>
          <p className="text-2xl font-semibold font-mono tabular-nums text-slate-100 mt-1">
            {metrics.count.toLocaleString('pt-BR')}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">
            {metrics.uniquePlayers} membros ativos no filtro
          </span>
        </div>

        <div className="p-5">
          <span className="text-xs text-slate-400 block">Volume Total de Farm</span>
          <p className="text-2xl font-semibold font-mono tabular-nums text-indigo-400 mt-1">
            {metrics.totalUnits.toLocaleString('pt-BR')}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Unidades contabilizadas</span>
        </div>

        <div className="p-5">
          <span className="text-xs text-slate-400 block">Logs Enviados ao Discord</span>
          <p className="text-2xl font-semibold font-mono tabular-nums text-slate-100 mt-1">
            {metrics.syncedCount} / {metrics.count}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Via Webhook automático</span>
        </div>

        <div className="p-5">
          <span className="text-xs text-slate-400 block">Aprovados na Auditoria</span>
          <p className="text-2xl font-semibold font-mono tabular-nums text-emerald-400 mt-1">
            {metrics.approvedCount}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Prints conferidos no baú</span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar jogador, #passaporte, item ou baú..."
              className="w-full pl-10 pr-4 py-2 bg-[#111827] border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-lg text-sm text-slate-100 placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#111827] border border-slate-800 rounded-lg self-start">
            {(
              [
                { id: 'all', label: 'Todo período' },
                { id: 'today', label: 'Hoje' },
                { id: '7d', label: '7 dias' },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriodFilter(p.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  periodFilter === p.id
                    ? 'bg-slate-800 text-slate-100'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filtrar por categoria"
            className="px-3 py-2 bg-[#111827] border border-slate-800 rounded-lg text-xs font-medium text-slate-200 focus:border-indigo-500 focus:outline-none"
          >
            <option value="ALL">Todas as categorias</option>
            {Object.values(FarmCategory).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 p-1 bg-[#111827] border border-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === 'table'
                  ? 'bg-slate-800 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Tabela
            </button>
            <button
              type="button"
              onClick={() => setViewMode('gallery')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === 'gallery'
                  ? 'bg-slate-800 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Galeria de Fotos
            </button>
          </div>

          <button
            type="button"
            disabled={filteredDeliveries.length === 0}
            onClick={() => exportDeliveriesToCsv(filteredDeliveries)}
            className="px-3.5 py-2 bg-[#111827] hover:bg-slate-800 disabled:opacity-40 border border-slate-800 rounded-lg text-xs font-medium text-slate-200 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Data Content Area */}
      {isLoading ? (
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-3">
          {[1, 2, 3, 4].map((row) => (
            <div
              key={row}
              className="h-12 bg-slate-900/80 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : filteredDeliveries.length === 0 ? (
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-12 text-center space-y-4">
          <h3 className="text-base font-semibold text-slate-200">
            Nenhuma entrega encontrada para este filtro
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Assim que um jogador registrar um farm com foto comprovante, horário e quantidade, o registro aparecerá aqui e será enviado ao Discord.
          </p>
          <button
            type="button"
            onClick={onGoToNewDelivery}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Registrar Entrega Agora
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-medium text-slate-400 bg-[#0D131F]">
                  <th className="py-3 px-4">Foto</th>
                  <th className="py-3 px-4">Jogador & Passaporte</th>
                  <th className="py-3 px-4">Item & Baú</th>
                  <th className="py-3 px-4 text-right">Quantidade</th>
                  <th className="py-3 px-4">Quando Foi Entregue</th>
                  <th className="py-3 px-4">Webhook Discord</th>
                  <th className="py-3 px-4">Auditoria</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-sm">
                {filteredDeliveries.map((d) => {
                  const isResending = resendingId === d.id;
                  return (
                    <tr
                      key={d.id}
                      className="hover:bg-slate-800/35 transition-colors"
                    >
                      <td className="py-2.5 px-4">
                        <button
                          type="button"
                          onClick={() => onSelectDelivery(d)}
                          className="w-16 h-11 rounded-md overflow-hidden border border-slate-700 bg-[#070A10] block relative group cursor-pointer"
                          title="Ampliar foto comprovante"
                        >
                          <ProofImage
                            photoUrl={d.photoUrl}
                            alt={`Comprovante ${d.id}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-150"
                          />
                        </button>
                      </td>

                      <td className="py-2.5 px-4">
                        <div className="font-medium text-slate-100 whitespace-nowrap">
                          {d.playerName}
                        </div>
                        <div className="text-xs font-mono tabular-nums text-slate-400">
                          #{d.passportId} · {d.id}
                        </div>
                      </td>

                      <td className="py-2.5 px-4">
                        <div className="font-medium text-slate-200 whitespace-nowrap">
                          {d.itemName}
                        </div>
                        <div className="text-xs text-slate-400 whitespace-nowrap">
                          {d.chestLocation} · {d.category}
                        </div>
                      </td>

                      <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-indigo-300 whitespace-nowrap">
                        {d.quantity.toLocaleString('pt-BR')}{' '}
                        <span className="text-xs font-normal text-slate-400">{d.unit}</span>
                      </td>

                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <div className="text-xs font-mono tabular-nums text-slate-200">
                          {formatExactDateTime(d.deliveredAt)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {formatRelativeTime(d.deliveredAt)}
                        </div>
                      </td>

                      <td className="py-2.5 px-4 whitespace-nowrap">
                        {d.webhookStatus === WebhookSyncStatus.ENVIADO && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Enviado ao canal
                          </span>
                        )}
                        {d.webhookStatus === WebhookSyncStatus.AGUARDANDO_CONFIG && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-amber-400">
                            <Clock className="w-3.5 h-3.5" />
                            Aguardando URL
                          </span>
                        )}
                        {d.webhookStatus === WebhookSyncStatus.ERRO && (
                          <span
                            className="inline-flex items-center gap-1.5 text-xs text-rose-400"
                            title={d.webhookError}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Erro no envio
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-4 whitespace-nowrap">
                        {d.auditStatus === AuditStatus.APROVADO && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Aprovado
                          </span>
                        )}
                        {d.auditStatus === AuditStatus.PENDENTE && (
                          <button
                            type="button"
                            onClick={() => onUpdateAudit(d.id, AuditStatus.APROVADO)}
                            className="text-xs text-slate-400 hover:text-emerald-300 underline decoration-slate-700 underline-offset-4 cursor-pointer"
                          >
                            Aprovar print
                          </button>
                        )}
                        {d.auditStatus === AuditStatus.RECUSADO && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-rose-400">
                            <XCircle className="w-3.5 h-3.5" />
                            Recusado
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectDelivery(d)}
                            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md text-xs text-slate-200 inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            Ver Foto
                          </button>
                          <button
                            type="button"
                            disabled={isResending}
                            onClick={() => onResendWebhook(d.id)}
                            title="Enviar comprovante para o canal do Discord"
                            className="px-2.5 py-1.5 bg-slate-900 hover:bg-indigo-600/20 border border-slate-800 hover:border-indigo-500/40 rounded-md text-xs text-slate-300 hover:text-indigo-200 inline-flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <Send className="w-3.5 h-3.5" />
                            {isResending ? '...' : 'Discord'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDeliveries.map((d) => (
            <div
              key={d.id}
              onClick={() => onSelectDelivery(d)}
              className="bg-[#111827] border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden cursor-pointer group transition-colors"
            >
              <div className="aspect-4/3 bg-[#070A10] relative overflow-hidden border-b border-slate-800">
                <ProofImage
                  photoUrl={d.photoUrl}
                  alt={`Foto da entrega de ${d.playerName}`}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-200"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-4 pt-10 flex items-end justify-between gap-2">
                  <span className="text-xs font-mono tabular-nums text-slate-200">
                    {formatExactDateTime(d.deliveredAt)}
                  </span>
                  <span className="text-sm font-mono tabular-nums font-semibold text-indigo-300">
                    +{d.quantity.toLocaleString('pt-BR')} {d.unit}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-slate-100 truncate">
                    {d.itemName}
                  </h4>
                  <span className="text-xs font-mono tabular-nums text-slate-400 shrink-0">
                    {d.id}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate">
                  <span className="text-slate-200 font-medium">{d.playerName}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">#{d.passportId}</span>
                  <span aria-hidden="true">·</span>
                  <span className="truncate">{d.chestLocation}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
