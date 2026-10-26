import React, { useMemo } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { AuditStatus, DiscordWebhookConfig, FarmDelivery } from '../types/farm';
import { formatExactDateTime } from '../utils/farmHelpers';

interface LeaderboardViewProps {
  deliveries: FarmDelivery[];
  config: DiscordWebhookConfig;
  onOpenSettings: () => void;
}

interface MemberRankingRow {
  passportId: string;
  playerName: string;
  totalQuantity: number;
  approvedQuantity: number;
  deliveriesCount: number;
  lastDeliveredAt: string;
  favoriteItem: string;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  deliveries,
  config,
  onOpenSettings,
}) => {
  const goal = Math.max(100, config.weeklyGoalPerMember || 2500);

  const ranking = useMemo<MemberRankingRow[]>(() => {
    const map = new Map<
      string,
      {
        passportId: string;
        playerName: string;
        totalQuantity: number;
        approvedQuantity: number;
        deliveriesCount: number;
        lastDeliveredAt: string;
        itemCounts: Record<string, number>;
      }
    >();

    for (const d of deliveries) {
      if (d.auditStatus === AuditStatus.RECUSADO) continue;

      const existing = map.get(d.passportId);
      if (!existing) {
        map.set(d.passportId, {
          passportId: d.passportId,
          playerName: d.playerName,
          totalQuantity: d.quantity,
          approvedQuantity: d.auditStatus === AuditStatus.APROVADO ? d.quantity : 0,
          deliveriesCount: 1,
          lastDeliveredAt: d.deliveredAt,
          itemCounts: { [d.itemName]: d.quantity },
        });
      } else {
        existing.totalQuantity += d.quantity;
        if (d.auditStatus === AuditStatus.APROVADO) {
          existing.approvedQuantity += d.quantity;
        }
        existing.deliveriesCount += 1;
        if (new Date(d.deliveredAt).getTime() > new Date(existing.lastDeliveredAt).getTime()) {
          existing.lastDeliveredAt = d.deliveredAt;
          existing.playerName = d.playerName;
        }
        existing.itemCounts[d.itemName] = (existing.itemCounts[d.itemName] || 0) + d.quantity;
      }
    }

    return Array.from(map.values())
      .map((entry) => {
        const topItem =
          Object.entries(entry.itemCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
        return {
          passportId: entry.passportId,
          playerName: entry.playerName,
          totalQuantity: entry.totalQuantity,
          approvedQuantity: entry.approvedQuantity,
          deliveriesCount: entry.deliveriesCount,
          lastDeliveredAt: entry.lastDeliveredAt,
          favoriteItem: topItem,
        };
      })
      .sort((a, b) => b.totalQuantity - a.totalQuantity);
  }, [deliveries]);

  const completedGoalMembers = ranking.filter((m) => m.totalQuantity >= goal).length;

  return (
    <div className="space-y-6">
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            Controle de Metas Semanais por Passaporte
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Meta individual configurada em{' '}
            <span className="font-mono tabular-nums text-slate-200 font-semibold">
              {goal.toLocaleString('pt-BR')} unidades
            </span>{' '}
            · {completedGoalMembers} de {ranking.length} membros atingiram a meta.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenSettings}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-medium text-slate-200 transition-colors self-start md:self-auto cursor-pointer whitespace-nowrap"
        >
          Alterar Meta Semanal
        </button>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
        {ranking.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Nenhuma entrega válida contabilizada ainda para gerar o ranking.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-medium text-slate-400 bg-[#0D131F]">
                  <th className="py-3 px-4 w-16">#</th>
                  <th className="py-3 px-4">Membro & Passaporte</th>
                  <th className="py-3 px-4">Principal Recurso</th>
                  <th className="py-3 px-4 text-right">Prints Enviados</th>
                  <th className="py-3 px-4 text-right">Volume Entregue</th>
                  <th className="py-3 px-4 w-64">Progresso da Meta</th>
                  <th className="py-3 px-4">Última Entrega</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-sm">
                {ranking.map((member, index) => {
                  const pct = Math.min(100, Math.round((member.totalQuantity / goal) * 100));
                  const reachedGoal = member.totalQuantity >= goal;

                  return (
                    <tr
                      key={member.passportId}
                      className="hover:bg-slate-800/35 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono tabular-nums text-xs text-slate-400">
                        {String(index + 1).padStart(2, '0')}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-medium text-slate-100">{member.playerName}</span>{' '}
                        <span className="text-xs font-mono tabular-nums text-slate-400">
                          #{member.passportId}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-300 whitespace-nowrap">
                        {member.favoriteItem}
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums text-xs text-slate-300">
                        {member.deliveriesCount}
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-indigo-300 whitespace-nowrap">
                        {member.totalQuantity.toLocaleString('pt-BR')} unid.
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="inline-flex items-center gap-1 text-slate-300">
                              {reachedGoal ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-400">Meta batida</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Em andamento</span>
                                </>
                              )}
                            </span>
                            <span className="font-mono tabular-nums text-slate-400">{pct}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-200 ${
                                reachedGoal ? 'bg-emerald-500' : 'bg-indigo-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono tabular-nums text-xs text-slate-300 whitespace-nowrap">
                        {formatExactDateTime(member.lastDeliveredAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
