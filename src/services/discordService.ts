import { DiscordWebhookConfig, FarmDelivery, WebhookSyncStatus } from '../types/farm';

export function isValidDiscordWebhookUrl(urlStr: string): boolean {
  if (!urlStr) return false;
  try {
    const parsed = new URL(urlStr.trim());
    if (parsed.protocol !== 'https:') return false;
    const validHosts = [
      'discord.com',
      'www.discord.com',
      'discordapp.com',
      'www.discordapp.com',
      'ptb.discord.com',
      'canary.discord.com',
    ];
    return (
      validHosts.includes(parsed.hostname.toLowerCase()) &&
      parsed.pathname.startsWith('/api/webhooks/')
    );
  } catch {
    return false;
  }
}

function hexToDiscordInt(hex: string): number {
  const cleaned = hex.replace('#', '').trim();
  const parsed = parseInt(cleaned, 16);
  return Number.isNaN(parsed) ? 0x4f46e5 : parsed;
}

function formatPtBrTimestamp(isoStr: string): string {
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return isoStr;
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function dataUrlToBlob(dataUrl: string): { blob: Blob; ext: string } | null {
  const match = dataUrl.match(/^data:(image\/([a-zA-Z0-9+.-]+));base64,(.+)$/);
  if (!match) return null;
  const mimeType = match[1];
  const rawExt = match[2].toLowerCase();
  const ext = rawExt === 'png' ? 'png' : rawExt === 'webp' ? 'webp' : 'jpg';
  const base64Data = match[3];

  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i += 1) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });
  return { blob, ext };
}

export async function dispatchDeliveryToDiscord(
  delivery: FarmDelivery,
  config: DiscordWebhookConfig
): Promise<{
  ok: boolean;
  status: WebhookSyncStatus;
  httpCode?: number;
  error?: string;
}> {
  const url = (config.webhookUrl || '').trim();
  if (!url) {
    return {
      ok: false,
      status: WebhookSyncStatus.AGUARDANDO_CONFIG,
      error: 'URL do Webhook do Discord ainda não configurada.',
    };
  }

  if (!isValidDiscordWebhookUrl(url)) {
    return {
      ok: false,
      status: WebhookSyncStatus.ERRO,
      error: 'URL inválida. Use um link oficial https://discord.com/api/webhooks/...',
    };
  }

  const deliveredDate = new Date(delivery.deliveredAt);
  const unixSeconds = Number.isNaN(deliveredDate.getTime())
    ? Math.floor(Date.now() / 1000)
    : Math.floor(deliveredDate.getTime() / 1000);

  let fileBlob: Blob | null = null;
  let attachmentFileName = `comprovante_${delivery.id.toLowerCase()}.jpg`;

  if (delivery.photoUrl.startsWith('data:image/')) {
    const converted = dataUrlToBlob(delivery.photoUrl);
    if (converted) {
      fileBlob = converted.blob;
      attachmentFileName = `comprovante_${delivery.id.toLowerCase()}.${converted.ext}`;
    }
  }

  let userMention = '';
  if (delivery.discordId && delivery.discordId.trim()) {
    const raw = delivery.discordId.trim();
    if (raw.startsWith('<@') && raw.endsWith('>')) {
      userMention = raw;
    } else {
      const digitsOnly = raw.replace(/[^0-9]/g, '');
      if (digitsOnly) {
        userMention = `<@${digitsOnly}>`;
      }
    }
  }

  const playerFieldValue = userMention
    ? `**${delivery.playerName}** (${userMention})\nPassaporte: \`#${delivery.passportId}\``
    : `**${delivery.playerName}**\nPassaporte: \`#${delivery.passportId}\``;

  const embed: Record<string, unknown> = {
    title: `Registro de Entrega de Farm · ${delivery.id}`,
    color: hexToDiscordInt(config.embedColor),
    fields: [
      {
        name: '👤 Jogador',
        value: playerFieldValue,
        inline: true,
      },
      {
        name: '🌾 Item Entregue',
        value: `**${delivery.itemName}**\n${delivery.category}`,
        inline: true,
      },
      {
        name: '📦 Quantidade',
        value: `\`${delivery.quantity.toLocaleString('pt-BR')} ${delivery.unit}\``,
        inline: true,
      },
      {
        name: '🕒 Quando Foi Entregue',
        value: `<t:${unixSeconds}:F> (<t:${unixSeconds}:R>)\n\`${formatPtBrTimestamp(delivery.deliveredAt)}\``,
        inline: false,
      },
      {
        name: '🗄️ Baú / Local de Depósito',
        value: delivery.chestLocation,
        inline: true,
      },
    ],
    footer: {
      text: `${config.serverName} • Painel FazendaLog FiveM`,
    },
    timestamp: new Date(delivery.deliveredAt).toISOString(),
  };

  if (delivery.notes && delivery.notes.trim()) {
    (embed.fields as Array<Record<string, unknown>>).push({
      name: '📝 Observação',
      value: delivery.notes.trim(),
      inline: false,
    });
  }

  if (fileBlob) {
    embed.image = { url: `attachment://${attachmentFileName}` };
  } else if (delivery.photoUrl.startsWith('http://') || delivery.photoUrl.startsWith('https://')) {
    embed.image = { url: delivery.photoUrl };
  }

  const mentionsList: string[] = [];
  if (userMention) mentionsList.push(userMention);
  if (config.roleMention && config.roleMention.trim()) mentionsList.push(config.roleMention.trim());

  const uniqueMentions = Array.from(new Set(mentionsList));

  const contentMessage = uniqueMentions.length > 0
    ? `${uniqueMentions.join(' ')} Nova entrega de farm registrada:`
    : undefined;

  const discordPayload: Record<string, unknown> = {
    username: config.botName || 'FazendaLog · Auditoria FiveM',
    content: contentMessage,
    embeds: [embed],
  };

  try {
    const targetEndpoint = url.includes('?') ? `${url}&wait=true` : `${url}?wait=true`;
    let response: Response;

    if (fileBlob) {
      const formData = new FormData();
      formData.append('payload_json', JSON.stringify(discordPayload));
      formData.append('files[0]', fileBlob, attachmentFileName);
      response = await fetch(targetEndpoint, {
        method: 'POST',
        body: formData,
      });
    } else {
      response = await fetch(targetEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordPayload),
      });
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return {
        ok: false,
        status: WebhookSyncStatus.ERRO,
        httpCode: response.status,
        error: `Discord retornou HTTP ${response.status}${errText ? `: ${errText.slice(0, 140)}` : ''}`,
      };
    }

    return {
      ok: true,
      status: WebhookSyncStatus.ENVIADO,
      httpCode: response.status,
    };
  } catch (err) {
    return {
      ok: false,
      status: WebhookSyncStatus.ERRO,
      error: err instanceof Error ? err.message : 'Falha de rede ao contatar o Discord.',
    };
  }
}
