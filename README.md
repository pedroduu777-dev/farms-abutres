# Abutres · Painel de Farm e Auditoria FiveM

Painel completo de gestão, envio de comprovantes de farm, auditoria e sincronização em tempo real (Supabase + Webhook do Discord com menção de cargo/membro) para a organização **Abutres** no FiveM.

---

## 🚀 Como Executar no GitHub / Localmente

Quando você clona este repositório do GitHub em sua máquina ou ambiente de desenvolvimento, para garantir que todas as dependências do `package.json` sejam instaladas automaticamente e o aplicativo nunca fique em tela branca:

1. **Instalar as dependências automaticamente**:
   ```bash
   npm install
   ```
2. **Iniciar o servidor de desenvolvimento (Local)**:
   ```bash
   npm run dev
   ```
   Abra o navegador em `http://localhost:3000`.

3. **Gerar build de produção**:
   ```bash
   npm run build
   ```

---

## ⚙️ Configurações Integradas

- **Banco de Dados (Supabase)**: Já conectado ao banco configurado para persistência das entregas (`deliveries`), metas e logs.
- **Webhook do Discord**: Configurado com envio automático para o canal da organização e menção ao responsável (`<@1528141958856442052>`).
- **Proteção contra Tela Branca**: O aplicativo possui um `ErrorBoundary` global robusto que captura qualquer exceção e permite limpar o cache e recarregar a aplicação de forma segura.
