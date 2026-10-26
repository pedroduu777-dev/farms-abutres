# Abutres · Painel de Farm e Auditoria FiveM

Painel completo de gestão, envio de comprovantes de farm, auditoria e sincronização em tempo real (Supabase + Webhook do Discord com menção de cargo/membro) para a organização **Abutres** no FiveM.

---

## 🚀 Como Publicar no GitHub e Abrir o Site Automaticamente

Este repositório já vem configurado com **GitHub Actions** (`.github/workflows/deploy.yml`) para publicar o site automaticamente no **GitHub Pages** sempre que você enviar (`push`) suas alterações.

### 🌐 Passos para ativar no seu GitHub:
1. Suba este código para o seu repositório no GitHub.
2. No seu repositório no GitHub, vá em **Settings** (Configurações) > **Pages**.
3. Em **Build and deployment**, selecione **Source** como **GitHub Actions**.
4. Faça um pequeno commit ou aguarde o action rodar. O link oficial do seu site (ex: `https://seu-usuario.github.io/nome-do-repo/`) abrirá diretamente o site funcional, sem telas brancas!

---

## 💻 Desenvolvimento Local

1. **Instalar dependências**:
   ```bash
   npm install
   ```
2. **Executar em desenvolvimento**:
   ```bash
   npm run dev
   ```
3. **Gerar build de produção**:
   ```bash
   npm run build
   ```
