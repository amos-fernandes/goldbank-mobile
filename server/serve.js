const http = require('http');
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.private' });

const {
  ASAAS_API_KEY,
  ASAAS_BASE_URL,
  ASAAS_WALLET_ID,
  ENCRYPTION_KEY,
  PORT = 8081
} = process.env;

// Configuração do cliente Asaas
const asaas = axios.create({
  baseURL: ASAAS_BASE_URL,
  headers: {
    'access_token': ASAAS_API_KEY,
    'Content-Type': 'application/json'
  }
});

// Mock Database (Em produção, use um banco real como PostgreSQL/MongoDB)
const db = {
  users: [],
  transactions: []
};

// Funções de Criptografia (Para chaves de API do Mercado Bitcoin, etc)
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    try {
      const payload = body ? JSON.parse(body) : {};

      // --- ROTA: REGISTER ---
      if (req.url === '/api/auth/register') {
        console.log('[ASAAS] Criando cliente:', payload.email);
        
        // 1. Criar cliente no Asaas
        const asaasCustomer = await asaas.post('/customers', {
          name: payload.name,
          email: payload.email,
          cpfCnpj: payload.cpfCnpj,
          mobilePhone: payload.phone,
          notificationDisabled: true
        });

        const newUser = {
          id: asaasCustomer.data.id,
          name: payload.name,
          email: payload.email,
          asaasStatus: 'ACTIVE',
          walletId: ASAAS_WALLET_ID,
          token: 'jwt_mock_' + Date.now()
        };
        
        db.users.push(newUser);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newUser));
      }

      // --- ROTA: LOGIN ---
      else if (req.url === '/api/auth/login') {
        const user = db.users.find(u => u.email === payload.email) || {
          id: 'cus_default_123',
          name: 'Usuário Gold',
          email: payload.email,
          asaasStatus: 'ACTIVE',
          walletId: ASAAS_WALLET_ID,
          token: 'jwt_mock_' + Date.now()
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(user));
      }

      // --- ROTA: PIX DEPOSIT (REAL ASAAS) ---
      else if (req.url === '/api/pix/deposit') {
        console.log('[ASAAS] Gerando cobrança PIX:', payload.amount);
        
        // 1. Criar cobrança
        const payment = await asaas.post('/payments', {
          customer: payload.customerId || 'cus_default_123', // Em prod, pegar do token
          billingType: 'PIX',
          value: payload.amount,
          dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          description: payload.description
        });

        // 2. Obter QR Code
        const qrCode = await asaas.get(`/payments/${payment.data.id}/pixQrCode`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          qrCodeBase64: qrCode.data.encodedImage,
          qrCodePayload: qrCode.data.payload,
          value: payment.data.value,
          chargeId: payment.data.id
        }));
      }

      // --- ROTA: WALLET BALANCE ---
      else if (req.url === '/api/wallet/balance') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          balance: 0.00, // Integrar com saldo real do Asaas se necessário
          availableBalance: 0.00,
          totalTransferValue: 0.00,
          isDemo: false
        }));
      }

      // --- ROTA: DASHBOARD SUMMARY ---
      else if (req.url === '/api/dashboard/summary') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          totalBalanceBRL: 0.00,
          bankBalanceBRL: 0.00,
          cryptoBalanceBRL: 0.00,
          accountsCount: 1,
          monthlyInflow: 0.00,
          monthlyOutflow: 0.00
        }));
      }

      // --- ROTA: CRYPTO PRICES (MB) ---
      else if (req.url === '/api/crypto/mb/prices') {
        try {
          const mbRes = await axios.get('https://www.mercadobitcoin.net/api/BTC/ticker/');
          const ticker = mbRes.data.ticker;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify([{
            coin: 'BTC',
            last: parseFloat(ticker.last),
            open: parseFloat(ticker.open)
          }]));
        } catch (e) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify([{ coin: 'BTC', last: 350000.00, open: 345000.00 }]));
        }
      }

      else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Route not found' }));
      }

    } catch (error) {
      console.error('[SERVER ERROR]', error.response?.data || error.message);
      res.writeHead(error.response?.status || 500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.response?.data?.errors?.[0]?.description || 'Internal Server Error' }));
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n💎 GOLDBANK PRODUCTION BACKEND ATIVO 💎`);
  console.log(`Porta: ${PORT}`);
  console.log(`Ambiente: ${ASAAS_BASE_URL.includes('sandbox') ? 'SANDBOX' : 'PRODUÇÃO'}`);
  console.log(`Wallet ID: ${ASAAS_WALLET_ID}\n`);
});
