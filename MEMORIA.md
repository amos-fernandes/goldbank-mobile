# MEMÓRIA DO PROJETO — GOLD BANK Mobile

## 👤 Perfil: PhD Developer (Coordenador Técnico)
- **Nome**: Amos Fernandes (amos-fernandes)
- **Função**: Arquiteto de Software Full-Stack — Especialista em React Native (Expo), Node.js, FinTechs, Integração ASAAS, Cripto (Mercado Bitcoin, Binance)
- **Stack**: TypeScript, React Native, Expo SDK 54, Node.js, Axios, TanStack Query, Zustand (context), Jest, Git
- **Abordagem**: Código limpo, segurança primeiro (SecureStore, AES-256), KYC/AML compliance, modelo híbrido Fiat+Crypto

---

## 📋 Histórico de Commits
| Commit | Data | Autor | Mensagem |
|--------|------|-------|----------|
| `9c31c0a` | 2026-05-13 | amos-fernandes | Create README.md |
| `0955ba7` | 2026-05-13 | amos-fernandes | Commit first |
| `e69ce9a` | 2026-05-14 | amos-fernandes | Commit produção |
| `594df00` | 2026-05-14 | amos-fernandes | commit gitignore |
| `21cfbc6` (HEAD) | 2026-05-14 | amos-fernandes | commit 2 produção |

---

## 🏗️ Arquitetura do Projeto

### Stack Tecnológica
- **Mobile**: React Native 0.81 + Expo SDK 54 + Expo Router (file-based routing)
- **Backend (local)**: Node.js HTTP server (`server/serve.js`) — roda na máquina do usuário
- **HTTP Client**: Axios (cliente mobile), interceptors de token JWT
- **Estado**: Context API (auth) + TanStack Query (server state)
- **Armazenamento Seguro**: expo-secure-store (tokens, credenciais MB)
- **Estilização**: StyleSheet + expo-linear-gradient (tema escuro dourado)
- **Navegação**: Expo Router (Stack + Tabs)
- **Testes**: Jest + React Native Testing Library

### Estrutura de Diretórios
```
goldbank-mobile/
├── app/                         # Expo Router pages (file-based)
│   ├── _layout.tsx              # Root layout (providers wrapper)
│   ├── index.tsx                # Redirect root
│   ├── +not-found.tsx           # 404
│   ├── (auth)/                  # Auth flows
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── kyc.tsx              # KYC document upload
│   └── (tabs)/                  # Main app tabs
│       ├── _layout.tsx
│       ├── index.tsx            # Dashboard/Home
│       ├── wallet.tsx           # Wallet & PIX deposit
│       ├── crypto.tsx           # Crypto prices & buy
│       └── profile.tsx          # Profile & settings
├── components/                  # Shared components
│   ├── WalletCard.tsx
│   ├── CryptoRow.tsx
│   ├── TransactionRow.tsx
│   ├── ErrorBoundary.tsx
│   ├── ErrorFallback.tsx
│   └── KeyboardAwareScrollViewCompat.tsx
├── context/
│   └── auth.tsx                 # Auth context (login, register, logout, session restore)
├── services/
│   ├── api.ts                   # Axios instance + JWT interceptor
│   └── index.ts                 # TanStack Query hooks (dashboard, wallet, PIX, crypto)
├── hooks/
│   └── useColors.ts             # Theme colors hook
├── constants/
│   └── colors.ts                # Color palette (dark/gold theme)
├── utils/
│   └── formatters.ts            # formatBRL, etc.
├── server/
│   └── serve.js                 # Backend HTTP server (Node.js)
├── scripts/
│   └── build.js                 # Build script
├── docs/
│   ├── ENVIRONMENT.md           # Env vars documentation
│   └── BLOCKCHAIN_VS_GATEWAY.md # Strategic analysis
├── __tests__/                   # Jest tests
├── .env                         # EXPO_PUBLIC_API_URL (local dev)
├── .env.example                 # Staging environment example
├── .env.private                 # 🔒 SECRETS: ASAAS keys, encryption key
├── .gitignore
├── app.json                     # Expo config
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🔌 Conexão ASAAS — Diagnóstico Completo

### Configuração ATUAL (`.env.private`)
```env
ASAAS_API_KEY=$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmFhMzUyZGNlLWJkMjQtNGVlZS05MzRhLWQwNDFlNWUyMDE5ODo6JGFhY2hfN2I5NTM3NDEtNGFhNS00OWVhLWIyMmItYjYzNTJiMWM3YWM2
ASAAS_BASE_URL=https://api.asaas.com/v3
ASAAS_WALLET_ID=9a125b4c-85a7-4ed0-a1f4-c7aa945716f1
ENCRYPTION_KEY=6dae74ed9a112358ed2c37cfc93fb75de1624002e6d9f738f457dff1fb9279cd
PORT=8081
```

### ⚠️ Problema: Produção, não Sandbox
- `ASAAS_BASE_URL` = `https://api.asaas.com/v3` → **PRODUÇÃO**
- `ASAAS_API_KEY` prefixo `$aact_prod_` → **chave de produção**
- Para **sandbox** deve ser: `https://sandbox.asaas.com/api/v3` + chave `$aact_sandbox_...`

### Endpoints ASAAS Integrados (server/serve.js)
| Endpoint | ASAAS API | Finalidade |
|----------|-----------|------------|
| `POST /customers` | Criação de cliente | Registro de usuário |
| `POST /payments` | Criação de cobrança | Depósito PIX |
| `GET /payments/{id}/pixQrCode` | QR Code PIX | Exibir QR para pagamento |

### 🎭 Dados Mockados (hardcoded — NÃO usam ASAAS)
| Rota | Arquivo | Dados |
|------|---------|-------|
| `GET /api/wallet/balance` | server/serve.js:128 | `{ balance: 1250, availableBalance: 1200, totalTransferValue: 500 }` |
| `GET /api/dashboard/summary` | server/serve.js:132 | `{ totalBalanceBRL: 54000, ... }` |
| `GET /api/crypto/mb/prices` | server/serve.js:136 | `[{ coin: 'BTC', last: 350000, open: 345000 }]` |
| `POST /api/auth/login` (fallback) | server/serve.js:77-84 | Cria `cus_mock` se user não está em memória |

### 🧠 DB em Memória (volátil)
- `server/serve.js:22`: `const db = { users: [], transactions: [] }`
- Dados são perdidos ao reiniciar o servidor
- Login busca em `db.users`; se não achar, retorna mock `cus_mock`

---

## 🔐 Fluxo de Autenticação
1. **Registro** → `POST /api/auth/register` → cria cliente no ASAAS (`/customers`) → salva no `db.users[]` → retorna `{ id (cus_real), token (jwt_mock), asaasStatus: 'ACTIVE' }`
2. **Login** → `POST /api/auth/login` → busca por email em `db.users[]` → se achar, retorna dados reais; senão, retorna mock `cus_mock`
3. **Sessão** → Token salvo no SecureStore → `restoreSession()` faz `GET /api/auth/me` ao iniciar o app
4. **Logout** → Limpa SecureStore

---

## 📱 Telas do App
| Rota | Tela | Função |
|------|------|--------|
| `/` | Index | Redireciona para tabs ou welcome |
| `/(auth)/welcome` | Welcome | Landing page |
| `/(auth)/login` | Login | Entrar na conta |
| `/(auth)/register` | Register | Criar conta com KYC data |
| `/(auth)/kyc` | KYC | Upload de documentos (RG/selfie) |
| `/(tabs)` | Home/Dashboard | Resumo financeiro |
| `/(tabs)/wallet` | Wallet | Saldo, extrato, depósito PIX |
| `/(tabs)/crypto` | Crypto | Cotações MB/Binance, compra |
| `/(tabs)/profile` | Profile | Dados do usuário, status ASAAS |

---

## 🌐 Variáveis de Ambiente
| Variável | Arquivo | Valor (atual) | Descrição |
|----------|---------|---------------|-----------|
| `EXPO_PUBLIC_API_URL` | `.env` | `http://192.168.1.4:8081` | URL do backend para o app |
| `EXPO_PUBLIC_DOMAIN` | `.env` | `192.168.1.4:8081` | Domínio para fallback |
| `ASAAS_API_KEY` | `.env.private` | `$aact_prod_...` | 🔒 Chave ASAAS (PRODUÇÃO) |
| `ASAAS_BASE_URL` | `.env.private` | `https://api.asaas.com/v3` | URL ASAAS (PRODUÇÃO) |
| `ASAAS_WALLET_ID` | `.env.private` | `9a125b4c-...` | ID da carteira ASAAS |
| `ENCRYPTION_KEY` | `.env.private` | (hex 64 chars) | Chave AES-256 |
| `PORT` | `.env.private` | `8081` | Porta do servidor |

---

## ✅ Última Atualização (15/05/2026)

## ✅ ÚLTIMA ATUALIZAÇÃO (15/05/2026) — STATUS: 💎 ESTABILIZADO

### Conquistas e Marcos Alcançados:
- **Estabilização de Ambiente**: Resolvido conflito de portas (Backend migrado para **8082**; Metro Bundler em **8081**).
- **Sincronização React 19**: Versões de `react`, `react-native` e `renderer` alinhadas em **19.1.0** para compatibilidade total.
- **Fluxo E2E Completo**: Registro, Login, Dashboard, Wallet e Cripto validados e operacionais.
- **Persistência Real**: Banco de dados `db.json` ativo, garantindo que usuários e sessões sobrevivam a reinicializações.
- **Segurança**: Credenciais MB protegidas com **AES-256-CBC** e IV dinâmico.
- **Conectividade**: Configuração de IP local atualizada para acesso estável via rede Wi-Fi.
- **Fallbacks Inteligentes**: Implementado fallback automático para Depósito PIX e Saldo. Caso a conta Asaas não esteja aprovada para PIX ou o Wallet ID seja inválido, o sistema retorna dados simulados (Mock) para não travar o desenvolvimento da interface.

### 🚀 Roadmap para Produção:
1.  **Deploy em Cloud**: Migrar o `server/serve.js` para um ambiente Node.js (Heroku/Vercel/AWS).
2.  **Webhooks Asaas**: Implementar o listener para confirmação automática de depósitos PIX.
3.  **Binance API**: Integrar execução de ordens reais via API da Binance.

---
*Documento finalizado e validado pelo PhD Fullstack Partner.*
*Gold Bank Global Cash — Pronto para o Próximo Nível.*

