import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  Bot,
  ExternalLink,
  Copy,
  Check,
  Send,
  Zap,
} from 'lucide-react';

interface DiscordBotGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToWebhookTab: () => void;
}

export const DiscordBotGuideModal: React.FC<DiscordBotGuideModalProps> = ({
  isOpen,
  onClose,
  onGoToWebhookTab,
}) => {
  const [activeTab, setActiveTab] = useState<'webhook' | 'pinned' | 'bot'>('webhook');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentOrigin =
    typeof window !== 'undefined' ? window.location.origin : 'https://seu-painel.run.app';

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const pinnedMessageText = `📋 **PAINEL DE ENTREGA DE FARM · FACÇÃO**
Para entregar o seu farm e bater a meta da semana, acesse o link abaixo:

🔗 **Link de Entrega:** ${currentOrigin}

📌 **Regras de Envio:**
1. Tire print do baú com o inventário aberto mostrando o depósito.
2. Informe seu **Nome** e **Passaporte (#ID)**.
3. Cole o print com **Ctrl+V** ou envie a foto.
4. O comprovante será enviado automaticamente para este canal de logs!`;

  const botJsCode = `// Código pronto para Bot do Discord (discord.js v14)
// Envia um botão no canal #entregar-farm que abre o link do painel
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', async () => {
  console.log(\`Bot online como \${client.user.tag}\`);
});

// Comando para enviar a mensagem fixada no canal
client.on('messageCreate', async (message) => {
  if (message.content === '!setupfarm' && message.member.permissions.has('Administrator')) {
    const embed = new EmbedBuilder()
      .setTitle('🌾 Central de Entrega de Farm FiveM')
      .setDescription('Clique no botão abaixo para registrar sua entrega com foto comprovante, horário exato e quantidade.')
      .setColor('#4F46E5')
      .setFooter({ text: 'Logs enviados automaticamente para a gerência' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('📦 Abrir Painel de Farm')
        .setStyle(ButtonStyle.Link)
        .setURL('${currentOrigin}')
    );

    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

client.login('SEU_DISCORD_BOT_TOKEN');`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 md:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Como colocar no canal do Discord"
    >
      <div
        className="w-full max-w-3xl bg-[#111827] border border-slate-800 rounded-xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                Como colocar isso num canal do Discord?
              </h3>
              <p className="text-xs text-slate-400">
                Escolha o método mais prático para o seu servidor FiveM
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

        {/* Tab Selector */}
        <div className="px-6 pt-3 border-b border-slate-800 flex items-center gap-2 bg-[#0D121C]">
          <button
            type="button"
            onClick={() => setActiveTab('webhook')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'webhook'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Canal de Logs (Webhook) ⭐ Mais Fácil
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pinned')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'pinned'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Mensagem com Link no Canal
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bot')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'bot'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Bot com Botão no Discord
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm flex-1">
          {activeTab === 'webhook' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-950/20 border border-indigo-900/50 rounded-lg flex items-start gap-3">
                <Zap className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-indigo-200">
                  <strong>Como funciona:</strong> Toda vez que qualquer jogador ou membro envia um farm aqui no painel, o sistema posta <strong>automaticamente dentro do canal do Discord</strong> com a foto do print anexada, quantidade, horário e passaporte!
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Passo a Passo (Leva menos de 1 minuto):
                </h4>
                <ol className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-mono shrink-0">
                      1
                    </span>
                    <span>
                      No seu servidor do Discord, crie ou escolha o canal desejado (ex: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-indigo-300">#logs-farm</code> ou <code className="bg-slate-900 px-1.5 py-0.5 rounded text-indigo-300">#entregas-bau</code>).
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-mono shrink-0">
                      2
                    </span>
                    <span>
                      Passe o mouse no canal e clique na engrenagem <strong>Editar Canal (⚙️)</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-mono shrink-0">
                      3
                    </span>
                    <span>
                      Vá na aba <strong>Integrações</strong> e clique em <strong>Webhooks</strong> &gt; <strong>Novo Webhook</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-mono shrink-0">
                      4
                    </span>
                    <span>
                      Dê um nome para o bot (ex: <span className="text-slate-100 font-semibold">FazendaLog</span>) e clique no botão <strong>Copiar URL do Webhook</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-mono shrink-0">
                      5
                    </span>
                    <span>
                      Cole o link copiado na aba <strong>Webhook Discord</strong> deste painel e clique em Salvar!
                    </span>
                  </li>
                </ol>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onGoToWebhookTab();
                  }}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Ir para a aba Webhook Discord e colar a URL agora
                </button>
              </div>
            </div>
          )}

          {activeTab === 'pinned' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Você pode criar um canal chamado <code className="bg-slate-900 px-1.5 py-0.5 rounded text-indigo-300">#como-entregar-farm</code> no Discord e fixar a mensagem abaixo. Os membros só precisam clicar no link, que abre direto tanto no PC quanto no celular!
              </p>

              <div className="relative">
                <pre className="p-4 bg-[#070A10] border border-slate-800 rounded-lg text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {pinnedMessageText}
                </pre>
                <button
                  type="button"
                  onClick={() => copyToClipboard(pinnedMessageText, 'pinned')}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-xs font-medium text-slate-200 flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedCode === 'pinned' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      Copiar Texto
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'bot' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Se o seu servidor já possui um Bot próprio no Discord, você pode usar este script simples em <strong>discord.js</strong> para enviar uma mensagem permanente com um botão oficial do Discord:
              </p>

              <div className="relative">
                <pre className="p-4 bg-[#070A10] border border-slate-800 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-64">
                  <code>{botJsCode}</code>
                </pre>
                <button
                  type="button"
                  onClick={() => copyToClipboard(botJsCode, 'bot')}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-xs font-medium text-slate-200 flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedCode === 'bot' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      Copiar Script do Bot
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#0D121C] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 rounded-lg cursor-pointer"
          >
            Fechar Guia
          </button>
        </div>
      </div>
    </div>
  );
};
