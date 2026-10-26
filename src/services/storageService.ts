import {
  AuditStatus,
  CreateDeliveryPayload,
  DiscordWebhookConfig,
  FarmCategory,
  FarmDelivery,
  WebhookSyncStatus,
} from '../types/farm';
import { dispatchDeliveryToDiscord } from './discordService';

const DELIVERIES_KEY = 'fazendalog_deliveries_store_v1';
const CONFIG_KEY = 'fazendalog_config_store_v1';
const WIPE_FLAG_KEY = 'fazendalog_reset_clean_v2';

const DEFAULT_WEBHOOK_URL =
  'https://discord.com/api/webhooks/1564322368573415568/717AXX9zSrC6Q_XlKJpYPoZtRC4kuQ5W76mMnZ4QMlK5pYf4ONKnVmcRVeAzzfGZ4lWu';

const DEFAULT_CONFIG: DiscordWebhookConfig = {
  webhookUrl: DEFAULT_WEBHOOK_URL,
  botName: 'Abutres · Auditoria FiveM',
  embedColor: '#4F46E5',
  serverName: 'Abutres',
  roleMention: '<@1528141958856442052>',
  autoSend: true,
  weeklyGoalPerMember: 2500,
  adminPin: '0604',
};

export function clearAllDeliveries(): void {
  try {
    localStorage.removeItem(DELIVERIES_KEY);
  } catch (e) {
    console.warn('Erro ao zerar entregas:', e);
  }
}

export function loadStoredDeliveries(): FarmDelivery[] {
  try {
    // If not yet wiped to zero, wipe legacy data once
    if (!localStorage.getItem(WIPE_FLAG_KEY)) {
      localStorage.removeItem(DELIVERIES_KEY);
      localStorage.setItem(WIPE_FLAG_KEY, 'true');
      return [];
    }

    const raw = localStorage.getItem(DELIVERIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Erro ao ler entregas do localStorage:', e);
  }
  return [];
}

export function saveStoredDeliveries(deliveries: FarmDelivery[]): void {
  try {
    localStorage.setItem(DELIVERIES_KEY, JSON.stringify(deliveries));
  } catch (e) {
    console.warn('Erro ao salvar entregas no localStorage, tentando otimização de imagens:', e);
    try {
      // Fallback if localStorage quota is exceeded: keep full photoUrl for 5 recent deliveries, strip large base64 for older ones
      const optimized = deliveries.map((d, idx) => {
        if (idx > 5 && d.photoUrl && d.photoUrl.startsWith('data:image/')) {
          return { ...d, photoUrl: 'seed:herbs' };
        }
        return d;
      });
      localStorage.setItem(DELIVERIES_KEY, JSON.stringify(optimized));
    } catch (err2) {
      console.error('Falha crítica ao salvar entregas no localStorage:', err2);
    }
  }
}

export function loadStoredConfig(): DiscordWebhookConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
        const serverName =
          !parsed.serverName || parsed.serverName === 'Organização Setor Norte'
            ? 'Abutres'
            : parsed.serverName;
        const adminPin =
          !parsed.adminPin || parsed.adminPin === '1234'
            ? '0604'
            : parsed.adminPin;
        const roleMention =
          !parsed.roleMention || parsed.roleMention.trim() === ''
            ? '<@1528141958856442052>'
            : parsed.roleMention;
        const webhookUrl =
          !parsed.webhookUrl || parsed.webhookUrl.trim() === ''
            ? DEFAULT_WEBHOOK_URL
            : parsed.webhookUrl.trim();
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          webhookUrl,
          serverName,
          botName:
            !parsed.botName || parsed.botName === 'FazendaLog · Auditoria FiveM'
              ? 'Abutres · Auditoria FiveM'
              : parsed.botName,
          adminPin,
          roleMention,
        };
    }
  } catch (e) {
    console.warn('Erro ao ler config do localStorage:', e);
  }
  return DEFAULT_CONFIG;
}

export function saveStoredConfig(config: DiscordWebhookConfig): void {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Erro ao salvar config no localStorage:', e);
  }
}

export async function processAndSaveNewDelivery(
  payload: CreateDeliveryPayload,
  currentDeliveries: FarmDelivery[],
  config: DiscordWebhookConfig
): Promise<{ delivery: FarmDelivery; updatedList: FarmDelivery[] }> {
  const nextNum = 1001 + currentDeliveries.length;
  const newDelivery: FarmDelivery = {
    id: `FRM-${nextNum}`,
    playerName: payload.playerName,
    passportId: payload.passportId,
    discordId: payload.discordId,
    itemName: payload.itemName,
    category: payload.category,
    quantity: payload.quantity,
    unit: payload.unit,
    chestLocation: payload.chestLocation,
    deliveredAt: payload.deliveredAt,
    createdAt: new Date().toISOString(),
    photoUrl: payload.photoUrl,
    notes: payload.notes,
    auditStatus: AuditStatus.PENDENTE,
    webhookStatus: WebhookSyncStatus.AGUARDANDO_CONFIG,
  };

  if (config.autoSend && config.webhookUrl.trim()) {
    const webhookRes = await dispatchDeliveryToDiscord(newDelivery, config);
    newDelivery.webhookStatus = webhookRes.status;
    newDelivery.webhookHttpCode = webhookRes.httpCode;
    newDelivery.webhookError = webhookRes.error;
    if (webhookRes.ok) {
      newDelivery.webhookSentAt = new Date().toISOString();
    }
  }

  const updatedList = [newDelivery, ...currentDeliveries];
  saveStoredDeliveries(updatedList);

  return { delivery: newDelivery, updatedList };
}
