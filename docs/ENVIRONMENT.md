# Configuração de Ambiente - Goldbank Mobile

## Variáveis Obrigatórias (Expo SDK 54)
O Expo Router no SDK 54 requer o prefixo `EXPO_PUBLIC_` para que as variáveis sejam expostas no bundle do cliente.

### 🚩 Staging (.env)
```env
EXPO_PUBLIC_API_URL=https://api-staging.goldbank.com.br
EXPO_PUBLIC_DOMAIN=staging.goldbank.com.br
```

### 🚩 Production (.env.production)
```env
EXPO_PUBLIC_API_URL=https://api.goldbank.com.br
EXPO_PUBLIC_DOMAIN=goldbank.com.br
```

## Como usar
Para rodar com um ambiente específico:
- **Staging:** `npx expo start` (carrega `.env` por padrão)
- **Produção:** `NODE_ENV=production npx expo start`

---
*Nota: Nunca comite segredos (API Keys, Secrets) nestes arquivos. Use segredos do provedor de CI/CD (GitHub Actions, EAS Secrets).*
