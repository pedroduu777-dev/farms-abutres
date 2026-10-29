import {
  AuditStatus,
  CreateDeliveryPayload,
  DiscordWebhookConfig,
  FarmCategory,
  FarmDelivery,
  MemberAccount,
  WebhookSyncStatus,
} from '../types/farm';
import { dispatchDeliveryToDiscord } from './discordService';
import { syncDeliveryToSupabase } from './supabaseService';

const DELIVERIES_KEY = 'fazendalog_deliveries_store_v1';
const CONFIG_KEY = 'fazendalog_config_store_v1';
const WIPE_FLAG_KEY = 'fazendalog_reset_clean_v2';
const MEMBERS_STORAGE_KEY = 'fazendalog_members_accounts_v1';
const ACTIVE_MEMBER_KEY = 'fazendalog_active_member_session_v1';

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
  syncDeliveryToSupabase(newDelivery).catch(() => {});

  return { delivery: newDelivery, updatedList };
}

export function loadStoredMembers(): MemberAccount[] {
  try {
    const raw = localStorage.getItem(MEMBERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Erro ao ler membros do localStorage:', e);
  }
  return [];
}

export function saveStoredMembers(members: MemberAccount[]): void {
  try {
    localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members));
  } catch (e) {
    console.warn('Erro ao salvar membros no localStorage:', e);
  }
}

export function getActiveMember(): MemberAccount | null {
  try {
    const raw = localStorage.getItem(ACTIVE_MEMBER_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Erro ao ler membro ativo:', e);
  }
  return null;
}

export function setActiveMember(member: MemberAccount | null): void {
  try {
    if (member) {
      localStorage.setItem(ACTIVE_MEMBER_KEY, JSON.stringify(member));
    } else {
      localStorage.removeItem(ACTIVE_MEMBER_KEY);
    }
  } catch (e) {
    console.warn('Erro ao salvar membro ativo:', e);
  }
}

export function registerMember(
  name: string,
  passportId: string,
  pin: string
): { success: boolean; message: string; member?: MemberAccount } {
  const cleanName = name.trim();
  const cleanId = passportId.trim().replace(/^#/, '');
  const cleanPin = pin.trim();

  if (!cleanName) {
    return { success: false, message: 'Digite o seu nome ou nick no FiveM.' };
  }
  if (!cleanId) {
    return { success: false, message: 'Digite o seu ID / Passaporte.' };
  }
  if (!/^\d{4}$/.test(cleanPin)) {
    return { success: false, message: 'A senha deve conter exatamente 4 números (ex: 1234).' };
  }

  const members = loadStoredMembers();
  const existing = members.find((m) => m.id.toLowerCase() === cleanId.toLowerCase());

  if (existing) {
    // If PIN matches, log in directly and optionally update name if changed
    if (existing.pin === cleanPin) {
      const updated: MemberAccount = {
        ...existing,
        name: cleanName,
        lastLoginAt: new Date().toISOString(),
      };
      const updatedList = members.map((m) =>
        m.id.toLowerCase() === cleanId.toLowerCase() ? updated : m
      );
      saveStoredMembers(updatedList);
      setActiveMember(updated);
      return { success: true, message: `Bem-vindo de volta, ${updated.name}!`, member: updated };
    }
    return {
      success: false,
      message: `O ID #${cleanId} já está cadastrado. Insira a senha correta de 4 dígitos na aba "Já sou Cadastrado" ou altere o ID.`,
    };
  }

  const newMember: MemberAccount = {
    id: cleanId,
    name: cleanName,
    pin: cleanPin,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  members.push(newMember);
  saveStoredMembers(members);
  setActiveMember(newMember);

  return { success: true, message: `Cadastro realizado com sucesso! Olá, ${newMember.name}.`, member: newMember };
}

export function authenticateMember(
  passportId: string,
  pin: string
): { success: boolean; message: string; member?: MemberAccount } {
  const cleanId = passportId.trim().replace(/^#/, '');
  const cleanPin = pin.trim();

  if (!cleanId) {
    return { success: false, message: 'Digite o seu ID / Passaporte.' };
  }
  if (!/^\d{4}$/.test(cleanPin)) {
    return { success: false, message: 'A senha deve conter exatamente 4 números.' };
  }

  const members = loadStoredMembers();
  const found = members.find((m) => m.id.toLowerCase() === cleanId.toLowerCase());

  if (!found) {
    return {
      success: false,
      message: `Nenhum membro encontrado com o ID #${cleanId}. Faça seu cadastro na aba "Novo Cadastro".`,
    };
  }

  if (found.pin !== cleanPin) {
    return {
      success: false,
      message: 'Senha de 4 dígitos incorreta para este passaporte. Tente novamente.',
    };
  }

  const updated: MemberAccount = {
    ...found,
    lastLoginAt: new Date().toISOString(),
  };
  const updatedList = members.map((m) =>
    m.id.toLowerCase() === cleanId.toLowerCase() ? updated : m
  );
  saveStoredMembers(updatedList);
  setActiveMember(updated);

  return { success: true, message: `Acesso liberado! Olá, ${updated.name}.`, member: updated };
}

